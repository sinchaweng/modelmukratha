<?php
// 1. ตั้งค่า Header เพื่อบอกว่าไฟล์นี้จะตอบกลับเป็น JSON และอนุญาตให้ Vue เข้าถึงได้ (CORS)
header("Access-Control-Allow-Origin: *"); // อนุญาตทุกเว็บ (หรือระบุเฉพาะเว็บเรา)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. ตั้งค่าการเชื่อมต่อฐานข้อมูล (แก้ไขตรงนี้ให้ตรงกับเครื่องของคุณ)
$host = "localhost";        // ชื่อ Host (ปกติใช้ localhost)
$db_name = "mukratha";    // mukratha
$username = "root";         // ชื่อผู้ใช้ 
$password = "";             // รหัสผ่าน 

try {
    // 3. เริ่มสร้างการเชื่อมต่อด้วย PDO (ปลอดภัยกว่าและทันสมัยกว่า mysqli)
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    
    // ตั้งค่าให้แสดง Error เมื่อมีปัญหา
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // ตั้งค่าภาษาไทย (สำคัญมาก ไม่งั้นอ่านไม่ออก)
    $conn->exec("set names utf8");

} catch(PDOException $exception) {
    // 4. ถ้าเชื่อมต่อไม่ได้ ให้แจ้ง Error กลับไปเป็น JSON
    echo json_encode([
        "status" => "error",
        "message" => "Connection error: " . $exception->getMessage()
    ]);
    exit(); 
}
?>