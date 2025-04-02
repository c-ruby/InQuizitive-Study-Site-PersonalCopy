// Script to update user-info on profile page
document.getElementById("userName").innerHTML = userInfo.name;
document.getElementById("userJoinDate").innerHTML = userInfo.joinDate;



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


document.addEventListener('DOMContentLoaded', function() {
    const passwordChangeContainer = document.getElementById('passwordChangeContainer');
    const changePasswordBtn = document.getElementById('changePasswordBtn');

    // Function to create the password change form
    function createPasswordChangeForm() {
        const formHTML = `
            <form id="changePasswordForm">
                <label for="new_password">New Password:</label>
                <input type="password" id="new_password" required>
                <br>
                <label for="confirm_password">Confirm Password:</label>
                <input type="password" id="confirm_password" required>
                <br>
                <button type="submit">Change Password</button>
            </form>
        `;
        passwordChangeContainer.innerHTML = formHTML;

        // Add event listener to the form
        const changePasswordForm = document.getElementById('changePasswordForm');
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // Password validation regex
            const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+]{6,20}$/;

            // Check if passwords match
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            // Check if passwords meet the criteria
            if (!passwordRegex.test(newPassword)) {
                alert('Password must be 6-20 characters long and contain only letters, numbers, and "!@#$%^&*()_".');
                return;
            }

            // Fetch request to change password
            fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                passwordChangeContainer.innerHTML = ''; // Clear the form on success
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Add event listener to the button
    changePasswordBtn.addEventListener('click', createPasswordChangeForm);
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
//calls the history fetch function when the document loads, if the user is logged in 
document.addEventListener('DOMContentLoaded', function() {
    fetch('/check-auth')
      .then(response => response.json())
      .then(data => {
        if (data.loggedIn) {
          fetchRecentStudySets();
        } else {
          console.log('User is not logged in');
        }
      })
      .catch(error => {
        console.error('Error checking authentication:', error);
      });
  });

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/user/info'); // Replace with your backend endpoint
        if (!response.ok) throw new Error('Failed to fetch user info');
        const userInfo = await response.json();

        // Populate user info
        document.getElementById('userName').textContent = userInfo.name;
        document.getElementById('userJoinDate').textContent = userInfo.joinDate;
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}
document.addEventListener("DOMContentLoaded", function(){
    loadRecentActivity();
});

function loadRecentActivity() {
    const activityList = document.getElementById("activityList");

    // Example: Fetch recent activity from an API or local storage
    const recentActivities = [
        "Completed Quiz: JavaScript Basics",
        "Started Quiz: HTML Fundamentals",
        "Achieved High Score in CSS Quiz",
        "Reviewed Notes: React Components"
    ];

    // Clear existing items
    activityList.innerHTML = "";

    // Populate the list with recent activities
    recentActivities.forEach(activity => {
        const listItem = document.createElement("li");
        listItem.textContent = activity;
        activityList.appendChild(listItem);
    });
}
