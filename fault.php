<?php

$conn = mysqli_connect("localhost", "root", "", "school_db");

if(!$conn){

    error_log("Connection Failed: ".mysqli_connect_error()."\n",
    3,
    "error_log.txt");

    die("Database connection problem. Please try again later.");
}

$sql = "SELECT * FROM wrong_table";

$result = mysqli_query($conn, $sql);

if(!$result){

    error_log("Query Failed: ".mysqli_error($conn)."\n",
    3,
    "error_log.txt");

    echo "<h3>Main query failed. Running backup query...</h3>";

    $backup = "SELECT * FROM student";

    $result = mysqli_query($conn, $backup);
}

echo "<h2>Student Records</h2>";

while($row = mysqli_fetch_assoc($result)){

    echo "ID: ".$row['id']." | ";
    echo "Name: ".$row['name']." | ";
    echo "Age: ".$row['age']."<br>";
}
?>