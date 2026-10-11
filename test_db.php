<?php
$conn = @new mysqli('127.0.0.1', 'root', 'S@nds1@b');
if ($conn->connect_error) {
    // Try without password or check error
    echo "Connection failed: " . $conn->connect_error . "\n";
} else {
    echo "Connected successfully to MySQL!\n";
    if ($conn->query("CREATE DATABASE IF NOT EXISTS hr_solution_db")) {
        echo "Database 'hr_solution_db' verified/created.\n";
    } else {
        echo "Error creating database: " . $conn->error . "\n";
    }
}
