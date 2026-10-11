<?php
// backend/core/Model.php

namespace App\Core;

use App\Config\Database;
use PDO;

abstract class Model {
    protected PDO $db;
    protected string $table = '';
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function findAll(string $orderBy = 'id DESC'): array {
        $stmt = $this->db->query("SELECT * FROM `{$this->table}` ORDER BY $orderBy");
        return $stmt->fetchAll();
    }
    
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM `{$this->table}` WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
    
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM `{$this->table}` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
