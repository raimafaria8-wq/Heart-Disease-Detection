<?php
$conn = mysqli_connect("localhost", "root", "", "school_db");

$sql = "SELECT * FROM student WHERE age = 18 OR name = 'Ali'";
$result = mysqli_query($conn, $sql);

$names = array();
$duplicate = false;

echo "<h2>Suspicious Data Detection</h2>";

while($row = mysqli_fetch_assoc($result)){

    echo "ID: ".$row['id']." | ";
    echo "Name: ".$row['name']." | ";
    echo "Age: ".$row['age']."<br>";

    if(in_array($row['name'], $names)){
        $duplicate = true;
    }
    else{
        $names[] = $row['name'];
    }
}

if($duplicate){
    echo "<h3 style='color:red;'>Warning: Duplicate names found!</h3>";
}
else{
    echo "<h3 style='color:green;'>No duplicate names found.</h3>";
}
?>