//script to handle logging out 
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    
    logoutBtn?.removeEventListener('click', handleLogout);
    logoutBtn?.addEventListener('click', handleLogout, { once: true });
});

function handleLogout() {
    const userConfirmed = confirm('Are you sure you want to log out?');

    if (userConfirmed) {
        console.log("Logging out...");

        fetch('/logout', { method: 'POST' })
            .then(response => response.text())
            .then(message => {
                alert(message);
                window.location.href = '../html/login.html'; 
            })
            .catch(error => {
                console.error('Error during logout:', error);
                alert('An error occurred during logout. Please try again.');
            });
    }
}



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


//section which fetches and updates user info 
var userData = null; //variable to store the fetched user info

document.addEventListener('DOMContentLoaded', async function () {
    await fetchUserInfo();
    updateUserInfo(); 
});

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/user/info', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        userData = await response.json(); 
        console.log('Fetched Data:', userData);
    } catch (error) {
        console.error('Error fetching user info:', error);
        userData = { name: 'Guest', joinDate: 'N/A' }; // Fallback values
    }
}
function updateUserInfo() {
    const nameEl = document.getElementById('userName');
    const dateEl = document.getElementById('userJoinDate');

    if (nameEl && dateEl && userData) {
        nameEl.textContent = userData.username; 
        dateEl.textContent = new Date(userData.created_at).toLocaleDateString(); 
    }
}




