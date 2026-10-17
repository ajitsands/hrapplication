<?php
// backend/services/LicenseService.php

namespace App\Services;

use App\Config\Database;
use PDO;
use Exception;

class LicenseService {
    private PDO $db;
    private string $activationUrl = 'https://key.sandslab.com/public/api/activate';

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get current license settings from DB
     */
    public function getLicenseRecord(): array {
        $stmt = $this->db->query("
            SELECT license_key, license_token, license_public_key, license_status,
                   license_expires_at, license_domain, license_customer, license_last_checked,
                   software_suspended, software_suspension_reason
            FROM settings 
            LIMIT 1
        ");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }

    /**
     * Verify license locally using public key and RSA signature
     */
    public function verifyLocalLicense(): array {
        $rec = $this->getLicenseRecord();

        $softwareSuspended = !empty($rec['software_suspended']);
        $suspensionReason = $rec['software_suspension_reason'] ?? 'Application access has been suspended by the software vendor.';

        if ($softwareSuspended) {
            return [
                'valid' => false,
                'software_suspended' => true,
                'status' => 'suspended',
                'message' => $suspensionReason,
                'suspension_reason' => $suspensionReason,
                'license_key_masked' => $this->maskKey($rec['license_key'] ?? '')
            ];
        }

        $token = $rec['license_token'] ?? '';
        $publicKey = $rec['license_public_key'] ?? '';
        $licenseKey = $rec['license_key'] ?? '';

        if (empty($token) || empty($publicKey)) {
            return [
                'valid' => false,
                'software_suspended' => false,
                'status' => 'unlicensed',
                'message' => 'No active software license key installed. Software requires activation by vendor.',
                'license_key_masked' => $this->maskKey($licenseKey)
            ];
        }

        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return [
                'valid' => false,
                'software_suspended' => false,
                'status' => 'invalid',
                'message' => 'Malformed license token signature structure.',
                'license_key_masked' => $this->maskKey($licenseKey)
            ];
        }

        list($payloadBase64, $signatureBase64) = $parts;
        $payloadJson = base64_decode($payloadBase64);
        $signature = base64_decode($signatureBase64);
        $payload = json_decode($payloadJson, true) ?: [];

        // 1. Verify RSA-SHA256 signature against public key
        $verifyResult = @openssl_verify($payloadJson, $signature, $publicKey, OPENSSL_ALGO_SHA256);
        if ($verifyResult !== 1) {
            return [
                'valid' => false,
                'software_suspended' => false,
                'status' => 'invalid',
                'message' => 'Cryptographic signature mismatch. License token has been tampered with or revoked.',
                'license_key_masked' => $this->maskKey($licenseKey)
            ];
        }

        // 2. Verify Domain
        $currentDomain = preg_replace('#^https?://#', '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
        $currentHost = explode(':', $currentDomain)[0];
        
        $licenseDomain = preg_replace('#^https?://#', '', strtolower($payload['domain_name'] ?? ($rec['license_domain'] ?? '')));
        $licenseHost = explode(':', $licenseDomain)[0];

        $isLocalDev = in_array($currentHost, ['localhost', '127.0.0.1', '::1', '']);
        $domainMatches = ($licenseHost === '*' || $currentHost === $licenseHost || $isLocalDev);

        if (!$domainMatches) {
            return [
                'valid' => false,
                'software_suspended' => false,
                'status' => 'domain_mismatch',
                'message' => "License is tied to domain '{$licenseHost}', but application is running on '{$currentHost}'.",
                'current_domain' => $currentHost,
                'licensed_domain' => $licenseHost,
                'payload' => $payload,
                'license_key_masked' => $this->maskKey($licenseKey)
            ];
        }

        // 3. Verify Expiration Date
        $expiryStr = $payload['expiry_date'] ?? $payload['expires_at'] ?? $payload['valid_until'] ?? ($rec['license_expires_at'] ?? null);
        $daysRemaining = null;
        $isExpired = false;

        if (!empty($expiryStr)) {
            $expiryTimestamp = strtotime($expiryStr);
            if ($expiryTimestamp) {
                $daysRemaining = (int)ceil(($expiryTimestamp - time()) / 86400);
                if ($daysRemaining < 0) {
                    $isExpired = true;
                }
            }
        }

        if ($isExpired) {
            return [
                'valid' => false,
                'software_suspended' => false,
                'status' => 'expired',
                'message' => "Software license expired on " . date('Y-m-d', $expiryTimestamp) . ". Please renew license.",
                'expires_at' => $expiryStr,
                'days_remaining' => $daysRemaining,
                'payload' => $payload,
                'license_key_masked' => $this->maskKey($licenseKey)
            ];
        }

        return [
            'valid' => true,
            'software_suspended' => false,
            'status' => 'active',
            'message' => 'Software license is active and valid.',
            'license_key_masked' => $this->maskKey($licenseKey),
            'expires_at' => $expiryStr,
            'days_remaining' => $daysRemaining,
            'customer' => $payload['customer_name'] ?? $payload['client_name'] ?? ($rec['license_customer'] ?? 'Licensed Organization'),
            'domain' => $licenseHost,
            'payload' => $payload,
            'last_checked' => $rec['license_last_checked'] ?? date('Y-m-d H:i:s')
        ];
    }

    /**
     * Activate a new software key with key.sandslab.com
     */
    public function activateLicense(string $licenseKey, ?string $domain = null, ?string $ip = null): array {
        $licenseKey = trim($licenseKey);
        if (empty($licenseKey)) {
            throw new Exception("License key is required.");
        }

        // Determine domain
        if (empty($domain)) {
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $domain = preg_replace('#^https?://#', '', strtolower($host));
            $domain = explode(':', $domain)[0];
        }

        // Determine IP
        if (empty($ip)) {
            $ip = gethostbyname($domain);
            if ($ip === $domain || $ip === '127.0.0.1' || $ip === '::1') {
                $remoteIp = $_SERVER['SERVER_ADDR'] ?? ($_SERVER['LOCAL_ADDR'] ?? '127.0.0.1');
                $ip = $remoteIp;
            }
        }

        $postData = [
            'license_key' => $licenseKey,
            'domain_name' => $domain,
            'ip_address'  => trim($ip)
        ];

        $ch = curl_init($this->activationUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: GulfHR-SaNDSLab-Bridge/1.0'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 20
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new Exception("Failed to connect to SaNDS Lab Key Server: " . $curlError);
        }

        $data = json_decode($response, true);
        if ($httpCode !== 200 || empty($data['success']) || empty($data['token']) || empty($data['public_key'])) {
            $errMessage = $data['message'] ?? ("License activation failed (HTTP " . $httpCode . ")");
            throw new Exception($errMessage);
        }

        $token = $data['token'];
        $publicKey = $data['public_key'];

        // Validate returned token cryptographically before saving
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            throw new Exception("Received invalid cryptographic token structure from key server.");
        }

        $payloadJson = base64_decode($parts[0]);
        $signature = base64_decode($parts[1]);
        $payload = json_decode($payloadJson, true) ?: [];

        $verify = @openssl_verify($payloadJson, $signature, $publicKey, OPENSSL_ALGO_SHA256);
        if ($verify !== 1) {
            throw new Exception("Cryptographic verification failed for the activation token returned by the server.");
        }

        // Extract metadata
        $expiryStr = $payload['expiry_date'] ?? $payload['expires_at'] ?? $payload['valid_until'] ?? null;
        $customer = $payload['customer_name'] ?? $payload['client_name'] ?? null;

        // Persist to `settings` table
        $stmt = $this->db->prepare("
            UPDATE settings 
            SET license_key = :k,
                license_token = :t,
                license_public_key = :pk,
                license_status = 'active',
                license_expires_at = :exp,
                license_domain = :dom,
                license_customer = :cust,
                license_last_checked = NOW(),
                software_suspended = 0,
                software_suspension_reason = NULL
            LIMIT 1
        ");

        $stmt->execute([
            'k' => $licenseKey,
            't' => $token,
            'pk' => $publicKey,
            'exp' => $expiryStr ? date('Y-m-d H:i:s', strtotime($expiryStr)) : null,
            'dom' => $domain,
            'cust' => $customer
        ]);

        return [
            'success' => true,
            'message' => $data['message'] ?? 'Software activated successfully with SaNDS Lab Licensing Server!',
            'domain' => $domain,
            'customer' => $customer,
            'expires_at' => $expiryStr,
            'payload' => $payload
        ];
    }

    /**
     * Toggle software suspension state
     */
    public function setSuspension(bool $suspended, ?string $reason = null): bool {
        $stmt = $this->db->prepare("
            UPDATE settings 
            SET software_suspended = :sus,
                software_suspension_reason = :reason,
                license_status = CASE WHEN :sus2 = 1 THEN 'suspended' ELSE 'active' END
            LIMIT 1
        ");

        return $stmt->execute([
            'sus' => $suspended ? 1 : 0,
            'sus2' => $suspended ? 1 : 0,
            'reason' => $suspended ? ($reason ?: 'Software access suspended by vendor.') : null
        ]);
    }

    /**
     * Clear / Deactivate installed license
     */
    public function removeLicense(): bool {
        $stmt = $this->db->query("
            UPDATE settings 
            SET license_key = NULL,
                license_token = NULL,
                license_public_key = NULL,
                license_status = 'unlicensed',
                license_expires_at = NULL,
                license_domain = NULL,
                license_customer = NULL,
                license_last_checked = NOW()
            LIMIT 1
        ");
        return $stmt->rowCount() > 0;
    }

    /**
     * Helper to mask license key string for privacy
     */
    public function maskKey(string $key): string {
        $clean = trim($key);
        if (strlen($clean) <= 8) return $clean;
        $prefix = substr($clean, 0, 7);
        $suffix = substr($clean, -4);
        return $prefix . '******-****-' . $suffix;
    }
}
