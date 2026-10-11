<?php
// download_bridge.php - 100% self-contained streaming download for SaNDSLabCardBridge.zip

error_reporting(0);
ini_set('display_errors', '0');

$workspaceRoot = realpath(__DIR__);
if (!$workspaceRoot) {
    $workspaceRoot = __DIR__;
}

$zipPath = $workspaceRoot . '/downloads/SaNDSLabCardBridge.zip';
$sourceDir = $workspaceRoot . '/SaNDSLabCardBridge';

// If zip does not exist or is too small (< 100KB), generate it on the fly
if (!file_exists($zipPath) || filesize($zipPath) < 100000) {
    if (!is_dir($workspaceRoot . '/downloads')) {
        @mkdir($workspaceRoot . '/downloads', 0755, true);
    }
    
    if (class_exists('\\ZipArchive') && is_dir($sourceDir)) {
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDir, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($files as $file) {
                $filePath = $file->getRealPath();
                $relativePath = 'SaNDSLabCardBridge/' . substr($filePath, strlen($sourceDir) + 1);
                $relativePath = str_replace('\\', '/', $relativePath);
                if ($file->isDir()) {
                    $zip->addEmptyDir($relativePath);
                } else {
                    $zip->addFile($filePath, $relativePath);
                }
            }

            if (file_exists($workspaceRoot . '/Start_Bahrain_Card_Bridge.bat')) {
                $zip->addFile($workspaceRoot . '/Start_Bahrain_Card_Bridge.bat', 'Start_Bahrain_Card_Bridge.bat');
            }
            if (file_exists($workspaceRoot . '/BAHRAIN_SMART_CARD_SETUP_GUIDE.html')) {
                $zip->addFile($workspaceRoot . '/BAHRAIN_SMART_CARD_SETUP_GUIDE.html', 'BAHRAIN_SMART_CARD_SETUP_GUIDE.html');
            }
            $zip->close();
        }
    }
}

// Stream the zip file with exact headers
if (file_exists($zipPath) && filesize($zipPath) > 100000) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    header('Content-Description: File Transfer');
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="SaNDSLabCardBridge.zip"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . filesize($zipPath));
    
    // Chunked read to support large files without memory exhaustion
    $handle = fopen($zipPath, 'rb');
    if ($handle !== false) {
        while (!feof($handle)) {
            echo fread($handle, 1048576); // 1MB chunks
            flush();
        }
        fclose($handle);
    } else {
        readfile($zipPath);
    }
    exit;
} else {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo "Error: SaNDSLabCardBridge package could not be found or generated on this server.";
    exit;
}
