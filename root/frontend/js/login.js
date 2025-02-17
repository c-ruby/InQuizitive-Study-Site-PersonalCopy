document.addEventListener('DOMContentLoaded', function() 
{
    const loginForm = document.getElementById('loginForm');

    console.log("login.js is loaded");

    if (loginForm) //if the element is there 
    {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the default form submission

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/login', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                if (data === 'Login successful') 
                {
                    window.location.href = '../html/index.html'; // Redirect to home page
                    console.log("login worked")
                } else {
                    alert(data); // Display error message
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    }
});
