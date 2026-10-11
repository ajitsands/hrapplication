<?php
// backend/models/Setting.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Setting extends Model {
    protected string $table = 'settings';
    
    public function getSettings(): array {
        $stmt = $this->db->query("SELECT * FROM settings LIMIT 1");
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$res) {
            return [
                'company_name' => 'Gulf Enterprise HR & Payroll Co.',
                'country' => 'Bahrain',
                'country_code' => 'BH',
                'timezone' => 'Asia/Bahrain',
                'date_format' => 'd/m/Y',
                'currency' => 'BHD',
                'currency_symbol' => 'BD',
                'currency_decimals' => 3,
                'gosi_citizen_emp_rate' => 7.00,
                'gosi_citizen_comp_rate' => 12.00,
                'gosi_expat_emp_rate' => 1.00,
                'gosi_expat_comp_rate' => 3.00,
                'lmra_monthly_fee' => 10.000,
                'work_hours_per_day' => 8.00,
                'work_days_per_month' => 30,
                'weekly_off_days' => 'Friday,Saturday',
                'ot_normal_multiplier' => 1.25,
                'ot_night_multiplier' => 1.50,
                'ot_holiday_multiplier' => 2.00,
                'indemnity_tier1_max_years' => 3,
                'indemnity_tier1_days_per_year' => 15.00,
                'indemnity_tier2_days_per_year' => 30.00
            ];
        }
        if (empty($res['weekly_off_days'])) {
            $res['weekly_off_days'] = 'Friday,Saturday';
        }
        return $res;
    }
    
    public function updateSettings(array $data): bool {
        $current = $this->getSettings();
        $id = $current['id'] ?? 1;
        
        $fields = [
            'company_name', 'cr_no', 'tax_number', 'country', 'country_code', 'timezone',
            'date_format', 'currency', 'currency_symbol', 'currency_decimals',
            'gosi_citizen_emp_rate', 'gosi_citizen_comp_rate', 'gosi_expat_emp_rate', 'gosi_expat_comp_rate',
            'lmra_monthly_fee', 'work_hours_per_day', 'work_days_per_month', 'weekly_off_days',
            'ot_normal_multiplier', 'ot_night_multiplier', 'ot_holiday_multiplier',
            'indemnity_tier1_max_years', 'indemnity_tier1_days_per_year', 'indemnity_tier2_days_per_year',
            'company_address', 'company_phone', 'company_email', 'logo_url'
        ];
        
        $setParts = [];
        $params = [];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "`$field` = :$field";
                $params[$field] = $data[$field];
            }
        }
        
        if (empty($setParts)) {
            return true;
        }
        
        $params['id'] = $id;
        $sql = "UPDATE settings SET " . implode(', ', $setParts) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
