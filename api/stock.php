<?php
// 1. ตั้งค่า Header (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. เรียกใช้งานไฟล์เชื่อมต่อฐานข้อมูล
require_once 'db_config.php';

// รับค่า action และข้อมูล JSON
$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true);

try {
    if ($action == 'get_stock') {
        $stmt = $conn->prepare("SELECT * FROM ingredients ORDER BY id DESC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        exit();
    } 
    elseif ($action == 'add_stock') {
        $stmt = $conn->prepare("INSERT INTO ingredients (name, cat, supplier, qty, min, unit, price, history) VALUES (:name, :cat, :supplier, :qty, :min, :unit, :price, :history)");
        $success = $stmt->execute([
            ':name' => isset($data['name']) ? $data['name'] : '',
            ':cat' => isset($data['cat']) ? $data['cat'] : '',
            ':supplier' => isset($data['supplier']) ? $data['supplier'] : '',
            ':qty' => isset($data['qty']) ? $data['qty'] : 0,
            ':min' => isset($data['min']) ? $data['min'] : 0,
            ':unit' => isset($data['unit']) ? $data['unit'] : '',
            ':price' => isset($data['price']) ? $data['price'] : 0,
            ':history' => isset($data['history']) ? $data['history'] : '[]'
        ]);
        echo json_encode(["status" => $success ? "success" : "error"]);
        exit();
    } 
    elseif ($action == 'edit_stock') {
        $stmt = $conn->prepare("UPDATE ingredients SET name=:name, cat=:cat, supplier=:supplier, min=:min, unit=:unit, price=:price WHERE id=:id");
        $success = $stmt->execute([
            ':name' => $data['name'],
            ':cat' => $data['cat'],
            ':supplier' => $data['supplier'],
            ':min' => $data['min'],
            ':unit' => $data['unit'],
            ':price' => $data['price'],
            ':id' => $data['id']
        ]);
        echo json_encode(["status" => $success ? "success" : "error"]);
        exit();
    } 
    elseif ($action == 'delete_stock') {
        $stmt = $conn->prepare("DELETE FROM ingredients WHERE id=:id");
        $success = $stmt->execute([':id' => $data['id']]);
        echo json_encode(["status" => $success ? "success" : "error"]);
        exit();
    } 
    elseif ($action == 'update_qty') {
        $stmt = $conn->prepare("UPDATE ingredients SET qty=:qty, history=:history WHERE id=:id");
        $success = $stmt->execute([
            ':qty' => $data['qty'],
            ':history' => $data['history'],
            ':id' => $data['id']
        ]);
        echo json_encode(["status" => $success ? "success" : "error"]);
        exit();
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        exit();
    }

} catch(PDOException $e) {
    // ดักจับ Error ตอน Query SQL เพื่อไม่ให้ JSON พัง
    echo json_encode([
        "status" => "error", 
        "message" => "Database Query Error: " . $e->getMessage()
    ]);
    exit();
}
?>