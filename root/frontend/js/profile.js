//script to handle logging out 
document.addEventListener('DOMContentLoaded', (event) => {
    const deleteAccountBtn = document.getElementById('logoutBtn');

    deleteAccountBtn.addEventListener('click', () => {
        const userConfirmed = confirm('Are you sure you want to log out?');
            //displays a confirmation window to the user 

        if (userConfirmed) {
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.text())
            .then(message => {
                alert(message);
                // Optionally, redirect the user to a different page after logout
                window.location.href = '../html/login.html'; 
            })
            .catch(error => {
                console.error('Error during logout:', error);
                alert('An error occurred during logout. Please try again.');
            });
        }
    });
});



//Change password script
//*** doesn't do anything rn since the button doesn't bring up a form 
document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = req.session.username;
            const newPassword = document.getElementById('new_password').value;

            fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: newPassword }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const userConfirmed = confirm('Are you sure you want to delete your account?');

            if (userConfirmed) {
                fetch('/delete-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    if (data.message === 'Account deleted successfully') {
                        fetch('/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })
                        .then(response => response.text())
                        .then(data => {
                            console.log(data);
                            if (data === 'Logout successful') {
                                window.location.href = '../html/login.html'; // Redirect to signup page after logout
                            } else {
                                alert(data); // Display error message
                            }
                        })
                        .catch(error => {
                            console.error('Error during logout:', error);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        });
    }
});

document.getElementById('changeUsernameBtn').addEventListener('click', function() {
    document.getElementById('changeUsernameForm').style.display = 'block';
});

document.getElementById('usernameForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const confirmUsername = document.getElementById('confirmUsername').value;

    if (newUsername === confirmUsername) {
        changeUsername(newUsername);
    } else {
        alert('Usernames do not match!');
    }
});

function changeUsername(newUsername) {
    fetch('/change-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Username changed successfully!');
            document.getElementById('changeUsernameForm').style.display = 'none';
        } else {
            alert('Error changing username: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}