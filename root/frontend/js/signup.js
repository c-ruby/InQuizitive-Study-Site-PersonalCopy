document.addEventListener('DOMContentLoaded', function() //makes sure the content is loaded first
{
    console.log('signup.js is loaded'); //debug statement to make sure this file is loaded 

    // Form submission event listener
    const signupForm = document.getElementById('signupForm');
    if (signupForm) 
    {
        signupForm.addEventListener('submit', function(event) //when user presses submit
        {
            event.preventDefault(); // Prevents the default form submission behavior

            // Grab the values entered by the user
            const username = document.getElementById('signup_username').value;
            const password = document.getElementById('signup_password').value;

            // Log the values to the console for debugging
            console.log('Username:', username);
            console.log('Password:', password);


            /*gotta add some error stuff
                > gonna try to handle the error checking up front before any data even reaches the database

                > if bad data does get into the backend, we can check for error from sql and not fetch login route 
                    something like:

                        if(validUser && validPass)
                            fetch(add-user)
                                ...
                                if(!sqlError)
                                    fetch(login)
                                ...
            
            */

            // Submit the data using fetch and the backend route 
            fetch('/add-user', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }), //generates parameters from the json sent
            })
            .then(response => response.json())
            .then(data => 
            {
                console.log('Success:', data);

                //assuming no issues, will fetch login, logging the new user in and directing them to the homepage 
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: username, password: password }),
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    if (data === 'Login successful') {
                        window.location.href = '../html/index.html'; // Redirect to home page
                        console.log("login worked")
                    } else {
                        alert(data); // Display error message
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    }
});
