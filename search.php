<?php
$conn = mysqli_connect("localhost", "root", "", "school_db");

$letter = "";

if(isset($_POST['search'])){
    
    $letter = $_POST['letter'];

    $sql = "SELECT * FROM student WHERE name LIKE '$letter%'";
    $result = mysqli_query($conn, $sql);

    $count = mysqli_num_rows($result);

    echo "<h2>Search Results</h2>";

    while($row = mysqli_fetch_assoc($result)){
        echo "ID: ".$row['id']." | ";
        echo "Name: ".$row['name']." | ";
        echo "Age: ".$row['age']."<br>";
    }

    echo "<h3>Total Matches: $count</h3>";

    if($count > 5){
        echo "<h3 style='color:red;'>Too many matches, refine search</h3>";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Smart Search</title>
</head>
<body>

<form method="POST">
    Enter Starting Letter:
    <input type="text" name="letter">
    <input type="submit" name="search" value="Search">
</form>

</body>
</html>