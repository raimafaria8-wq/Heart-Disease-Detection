<?php
$conn = mysqli_connect("localhost", "root", "", "school_db");

$sql = "SELECT * FROM student ORDER BY age ASC LIMIT 2";
$result = mysqli_query($conn, $sql);

$students = array();

while($row = mysqli_fetch_assoc($result)){
    $students[] = $row;
}

usort($students, function($a, $b){
    return strlen($a['name']) - strlen($b['name']);
});

echo "<h2>Final Ranking</h2>";

$rank = 1;

foreach($students as $student){

    echo "Rank ".$rank."<br>";
    echo "Name: ".$student['name']."<br>";
    echo "Age: ".$student['age']."<br><br>";

    $rank++;
}
?>