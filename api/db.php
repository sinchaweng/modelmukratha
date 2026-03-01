<?php
// ตั้งค่าการเชื่อมต่อฐานข้อมูล
$host = "localhost";
$db_name = "mukratha";
$username = "root";
$password = "";

try {
    // เชื่อมต่อ PDO
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    // ถ้าเชื่อมต่อไม่ได้ ให้แจ้ง Error กลับไปเป็น JSON
    echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
    exit(); 
}
?>