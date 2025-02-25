document.addEventListener('DOMContentLoaded', function() //makes sure the content is loaded first
{
    // makes it so you can't type invalid characters here
    const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const validPassChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;\':",./<>?';

    document.getElementById('signup_username').addEventListener('keypress', function(event) {
        if (!validChars.includes(event.key)) {
            event.preventDefault();
        }
    });

    document.getElementById('signup_password').addEventListener('keypress', function(event) {
        if (!validPassChars.includes(event.key)) {
            event.preventDefault();
        }
    });

    document.getElementById('password_verification').addEventListener('keypress', function(event) {
        if (!validPassChars.includes(event.key)) {
            event.preventDefault();
        }
    });

  


    console.log('signup.js is loaded'); //debug statement to make sure this file is loaded 

    // Form submission event listener
    const signupForm = document.getElementById('signupForm');
    if (signupForm) 
    {
        signupForm.addEventListener('submit', async function(event) //when user presses submit
        {
            event.preventDefault(); // Prevents the default form submission behavior

            // Grab the values entered by the user
            const username = document.getElementById('signup_username').value;
            const password = document.getElementById('signup_password').value;
            const passwordVerification = document.getElementById('password_verification').value;
            
            //define valid characters 
            const usernameRegex = /^[a-zA-Z0-9]{6,15}$/;
                //lower/uppercase letters a-z, numbers 0-9, length 6-15
            const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+]{6,20}$/;
                //lower/uppercase letters a-z, numbers 0-9 standard special characters, length 6-20

    //username and password requirements check 
            const checkResponse = await fetch('/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username}),
            })
            const checkData = await checkResponse.text();
            if (checkData === 'This username exists') {
                alert('This username is taken, please try again.'); // Display error message
                return; // Exit the function if the username is taken
            }
            else
            {
            console.log("username is not taken");
            }

            if (!usernameRegex.test(username)) {
                alert('Username must be 6-15 characters long and contain only letters and numbers.');
                event.preventDefault();
                return;
            }

            if (!passwordRegex.test(password)) {
                alert('Password must be 6-20 characters long and contain only letters, numbers, and "!@#$%^&*()_".');
                event.preventDefault();
                return;
            }

            if (password !== passwordVerification) {
                alert('Passwords do not match.');
                event.preventDefault();
                return;
            }

    // Submit the data using fetch and the backend route 
            const addUserResponse = await fetch('/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            });
            const addUserData = await addUserResponse.json();
            console.log('Success:', addUserData);   

            const loginResponse = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            });
            const loginData = await loginResponse.text();
                       
            if (loginData === 'Login successful') {
                window.location.href = '../html/index.html'; // Redirect to home page
                console.log("Login worked");
            } else {
                alert(loginData); // Display error message
            }
           
        });
    }
});
