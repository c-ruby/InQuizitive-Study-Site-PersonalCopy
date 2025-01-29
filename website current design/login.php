<?php
session_start();

if($_SERVER["REQUEST_METHOD"] == "POST") {
    // username and password sent from form 

    $username = $_POST['username'];
    $password = $_POST['password'];

    $users = [
        ['username' => 'user1', 'password' => 'pass1'],
        ['username' => 'user2', 'password' => 'pass2']
    ];

    foreach ($users as $user) {
        if ($user['username'] == $username && $user['password'] == $password) {
            $_SESSION['username'] = $username;
            echo json_encode(['message' => 'Login successful']);
            exit;
        }
    }
    echo json_encode(['message' => 'Login failed']);
    http_response_code(401);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    <h1>Login</h1>
    <?php if (isset($error)) { ?>
        <p style="color: red;"><?php echo $error; ?></p>
    <?php } ?>
    <form action="login.php" method="POST">
        <label for="username">Username</label>
        <input type="text" name="username" id="username" required>
        <br>
        <br>
        <label for="password">Password</label>
        <input type="password" name="password" id="password" required>
        <br>
        <br>
        <button type="submit">Login</button>
    </form>
</body>
</html>