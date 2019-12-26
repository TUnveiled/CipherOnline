<?php
include "config.php";

if (isset($_POST['email'])) {
    $email = $_POST['email'];
    $username = $_POST['username'];

    $sql_query = "select count(*) as cnt from user where email='".$email."'";

    $result = mysqli_query($con,$sql_query);
    $row = mysqli_fetch_array($result);
    $count = $row['cnt'];

    if ($count > 0)
        echo "That email address is already associated with an account.\n";

    $sql_query = "select count(*) as cnt from user where username='".$username."'";

    $result = mysqli_query($con,$sql_query);
    $row = mysqli_fetch_array($result);
    $count = $row['cnt'];

    if ($count > 0)
        echo "That username is already associated with an account.\n";
}