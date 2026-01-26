<?php
$host = "localhost";
$user = "root";      // ค่าเริ่มต้นของ XAMPP
$pass = "";          // ค่าเริ่มต้นของ XAMPP มักจะว่างไว้
$db   = "mukratha";  // ชื่อฐานข้อมูล

$conn = new mysqli($host, $user, $pass, $db);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// ตั้งค่าภาษาไทยให้รองรับชื่อวัตถุดิบ
$conn->set_charset("utf8mb4");
?>