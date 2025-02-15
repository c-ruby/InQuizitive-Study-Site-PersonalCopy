/*
--- registration.js ---
All functions associated with with the
user registration (i.e., login/logout/signup)
and their features should be placed in this file
*/


// simulates a simple user database
let users = [];
/*
will use the following function for testing
and to see if the user exists in the database
*/


//this function is to see if there is an account for the website
//will eventually have it get rid of the login/signup button 
//and display a Welcome "username" or something along those lines
//still getting used to javascript

function checkforaccount(){
	
	const user = sessionStorage.getItem('loggedInUser');
	const loginSignupLink = document.getElementById("login_signup");
	const dashboardLink = document.getElementById("dashboard");
	if (user) {
		 // disable link if logged in
		loginSignupLink.style.innerText = "Welcome " + user;
		loginSignupLink.herf = "dashboard.html";
		dashboardLink.style.display = "block";
		if (dashboardLink){
			dashboardLink.display = "block";
		}
	}
	else {
		loginSignupLink.style.display = "block";
		if (dashboardLink){
		dashboardLink.style.display = "none";
		}
	}
}


// ------------ LOGIN ------------ //
// Handle the login submission
function getInformation(event){
	event.preventDefault();
	const userName = document.getElementById("username").value;
	const passWord = document.getElementById("password").value;
	
	const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
	const user = storedUsers.find(user => user.username === userName && user.password === passWord);

	if (user && passWord){
		sessionStorage.setItem('loggedInUser', userName);
		sessionStorage.setItem('loggedInPassword', passWord);
		window.location.href = "dashboard.html";
	}
	else{
		alert("Invalid username or password");
	}
}




// ------------ SIGNUP ------------ //
// Handle the signup submission
function createAccount(event){
	event.preventDefault();
	const userName = document.getElementById("username").value;
	const passWord = document.getElementById("password").value;

	const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
	const userExists = storedUsers.some(user => user.username === userName);
	if (userExists){
		alert("Username already exists");
	}
	else{
		storedUsers.push({username: userName, password: passWord});
		localStorage.setItem('users', JSON.stringify(storedUsers));
		alert("Account created successfully");
		window.location.href = "login.html";
	}
}




// ------------ LOGOUT ------------ //
function logout(){
	sessionStorage.removeItem('loggedInUser');
	sessionStorage.removeItem('loggedInPassword');
	window.location.href = "login.html";
}