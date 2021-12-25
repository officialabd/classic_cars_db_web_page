<?php

$table_name = $_POST['table_name'];

$connection = mysqli_connect("localhost","root","","abd_al-muttalib_201904158") or die("Error ".mysqli_error($connection)); 
 
$sql = "DESC $table_name;"; 

$result = mysqli_query($connection, $sql) or die("Error in Selecting ".mysqli_error($connection)); 

$table_d = array();
while($row = mysqli_fetch_assoc($result)){
     $table_d[] = $row;
}  
echo json_encode($table_d);
mysqli_close($connection);

?>