<?php

$table_name = $_POST['table_name'];
$scted_attrs = $_POST['selected_attrs'];
$conds = $_POST['conditions'];

$connection = mysqli_connect("localhost","root","","abd_al-muttalib_201904158") or die("Error ".mysqli_error($connection)); 

if($scted_attrs == ""){
    $scted_attrs = "*";
}
$sql = "SELECT $scted_attrs FROM $table_name"; 

if($conds != ""){
    $sql .= " WHERE $conds";
}
$sql .= ";";

$result = mysqli_query($connection, $sql) or die("Error in Selecting ".mysqli_error($connection)); 

$table_rs = array();
while($row = mysqli_fetch_assoc($result)){
     $table_rs[] = $row;
}  
echo json_encode($table_rs);
mysqli_close($connection);

?>