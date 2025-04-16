//debug statement
console.log('myscript.js is loaded');	//debug, remove later


/*
Checking if the user is logged in and displaying correct nav button 
*/    
document.addEventListener("DOMContentLoaded", () => {
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            const authLink = document.getElementById('auth-link');
            const altRegisterLink = document.getElementById('altRegisterLink');

            if (data.loggedIn) {
                authLink.innerHTML = `<a href="profile.html">Account: ${data.username}</a>`;
                altRegisterLink.style.visibility = "hidden"; // Hides element without affecting layout
            } else {
                altRegisterLink.style.visibility = "visible"; // Shows element when logged out
            }
        })
        .catch(error => console.error('Error:', error));
});



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
