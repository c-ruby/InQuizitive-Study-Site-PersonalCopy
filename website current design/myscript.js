function clickPress(event){
	if(event.keyCode == 13){
		var searchBar = document.getElementById("searchbar");
		searchBar.value = "";
	}
}

/*
This is simply to clone the rows on the study set template page
Will update when DB is set up to auto set rows for how many questions are in the set
for now just clones the table row
*/
function cloneRow() {
	var html = document.getElementById("therow").innerHTML;

	var row = document.createElement('tr');

	row.innerHTML= html;

	document.getElementById("myTable").appendChild(row);
}

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
	var userName;
	if (userName) {
		document.getElementById("login_signup").innerText = "Welcome " + userName;
		document.getElementById("login_signup").herf = "#"; // disable link if logged in
	}
}

async function getInformation(event){
	event.preventDefault();
	const userName = document.getElementById("username").value;
	const passWord = document.getElementById("password").value;
	
	const response = await fetch("login.php",{
	method: 'POST',
	headers: {
		'content-type': 'application/json'
	},
	body: JSON.stringify({username: userName, password: passWord})
	});
	const data = await response.json();
	if (response.ok){
		sessionStorage.setItem('loggedInUser', userName);
		window.location.href = "dashboard.html";
}
else{
	alert("Invalid username or password");
	}
}	



async function createAccount(event){
	event.preventDefault();
	const userName = document.getElementById("username").value;
	const passWord = document.getElementById("password").value;

	const response = await fetch("login.php", {
	method: 'POST',
	headers: {
		'content-type': 'application/json'
	},
	body: JSON.stringify({username: userName, password: passWord})
	});
	const data = await response.json();
	if (response.ok){
		alert(data.message);
		window.location.herf = "login.html"; // redirect to login page
	}
	else {
		alert(data.message);
	}
}


// event listeners for the search bar
document.addEventListener("DOMContentLoaded", function(event){
	const searchbar = document.getElementById("searchbar");
	if (searchbar){
		searchbar.addEventListener("keypress", function(event){
			if (event.keyCode == 13){
			event.preventDefault();
			this.value = "";
			}
		});
	}
	
	const loginForm = document.getElementById("loginForm");
	if (loginForm){
		loginForm.addEventListener("submit", getInformation);
	}

	const signupForm = document.getElementById("signupForm");
	if (signupForm){
		signupForm.addEventListener("submit", createAccount);
	}

});

