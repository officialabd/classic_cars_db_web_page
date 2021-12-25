<?php

$table_name = $_POST['table_name'];
$attrs = $_POST['attrs'];
$values = $_POST['values'];

$connection = mysqli_connect("localhost","root","","abd_al-muttalib_201904158") or die("Error ".mysqli_error($connection)); 

$sql = "INSERT INTO $table_name ($attrs) VALUES ($values);"; 

$result = mysqli_query($connection, $sql) or die("Error in Selecting ".mysqli_error($connection)); 

echo json_encode($result);
mysqli_close($connection);

?>