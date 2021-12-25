<?php

$connection = mysqli_connect("localhost","root","","abd_al-muttalib_201904158") or die("Error ".mysqli_error($connection)); 
 
$sql = "show tables;"; 
 
$result = mysqli_query($connection, $sql) or die("Error in Selecting ".mysqli_error($connection)); 

$tables_array = array();
while($row = mysqli_fetch_assoc($result)){
     $tables_array[] = $row['Tables_in_abd_al-muttalib_201904158'];
} 

echo json_encode($tables_array);

mysqli_close($connection);

?>