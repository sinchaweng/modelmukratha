<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // อนุญาตให้ Frontend เข้าถึงได้
include 'db_connect.php';

$sql = "SELECT * FROM ingredients";
$result = $conn->query($sql);

$data = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
?>