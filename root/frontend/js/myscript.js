//debug statement
console.log('myscript.js is loaded');	//debug, remove later


/*
Checking if the user is logged in and displaying correct nav button 
*/    
// User authentication check: constants which exist if these elements exist
const loginSignupElement = document.getElementById('login_signup');
const userInfoElement = document.getElementById('user-info');

//function checking if user logged in and displaying correct button 
if (loginSignupElement || userInfoElement) //any page with these things will run this script  
{
    fetch('/check-auth')
    .then(response => response.json())
    .then(data => {
        console.log('Auth status:', data); // Log the authentication status for debugging
        if (data.loggedIn) {
            loginSignupElement.style.display = 'none'; // Hide login/signup link
            userInfoElement.style.display = 'inline'; // Show user info
            userInfoElement.innerHTML = ` <a href="../html/profile.html">Account: ${data.username}</a>`;
        } else {
            loginSignupElement.style.display = 'inline'; // Show login/signup link
            userInfoElement.style.display = 'none'; // Hide user info
        }
    })
    .catch(error => console.error('Error:', error));
} 
else 
{
    console.log(loginSignupElement, userInfoElement);
    console.error('Elements not found in the DOM');
}


/*
'Protected' pages 
*/
//function to check if user logged in 
function checkAuth() {
    fetch('/check-auth')
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            // Redirect to login page if not authenticated
            window.location.href = '../html/login.html';
        }
    })
    .catch(error => {
        console.error('Error checking authentication:', error);
    });
}
//on page load...
document.addEventListener('DOMContentLoaded', () => {
    //set of 'protected' pages 
    const protectedPages = [
        'profile.html',
        //'studySetTemplate.html',
        'userLibrary.html'
    ];
    
    //get current page
    const currentPage = window.location.pathname.split('/').pop();
    console.log(currentPage);
    
    //if current page is protected 
    if (protectedPages.includes(currentPage)) {
        checkAuth();
    }
});
