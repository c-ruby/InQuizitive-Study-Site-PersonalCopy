/*
This is simply to clone the rows on the study set template page
Will update when DB is set up to auto set rows for how many questions are in the set
for now just clones the table row
*/


function getRowCount(){
	const table = document.getElementById('myTable');
    return table.rows.length-1;
}

let count=1;

function cloneRow() {
	const table = document.getElementById("myTable");
    const row = table.insertRow();
    const question = row.insertCell();
	const answer = row.insertCell();
	
	row.setAttribute('class', 'StudySet-Q&A');
	row.setAttribute('id', 'row'+count);
	
    question.textContent = count;
	answer.textContent = count;
	
	question.setAttribute('id', 'question' + count);
    answer.setAttribute('id', 'answer' + count);
	
	count++;
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


// to handle the login submission
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
// to handle the signup submission
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

// event listeners for the search bar
document.addEventListener("DOMContentLoaded", function(){
	const searchbar = document.getElementById("searchbar");
	if (searchbar){
		searchbar.addEventListener("keypress", clickPress);
	}
	
	const loginForm = document.getElementById("loginForm");
	if (loginForm){
		loginForm.addEventListener("submit", getInformation);
	}

	const signupForm = document.getElementById("signupForm");
	if (signupForm){
		signupForm.addEventListener("submit", createAccount);
	}

	checkforaccount();

});

function clickPress(event){
	if(event.keyCode == 13){
		var searchBar = document.getElementById("searchbar");
		searchBar.value = "";
	}
}

function generate_quiz(){
	//These set the opacity of the elements on the page to low
	document.getElementById('SSheader').style.opacity = '.1';
	document.getElementById('SScontent').style.opacity = '.1';
	document.getElementById('SSfooter').style.opacity = '.1';

	//this adds the name of the study set to the top of the test
	var studySetName = document.getElementById("studySetName").innerHTML;
	var quiz = document.createElement("div");
	studySetName.id = "StudySetName"
	quiz.id = "Quiz";
	quiz.innerHTML = studySetName;
	document.body.appendChild(quiz);
	quiz.style.opacity = '1';
	
	//this adds the submit button to the bottom of the quiz div
	var submitbtn = document.createElement("button");
    submitbtn.id = "submitbtn";
    submitbtn.innerHTML = "Submit";
	submitbtn.onclick = disablequiz;
    quiz.appendChild(submitbtn);
	
	//These disable all of the buttons on the side when the quiz is generated
	document.getElementById('flashcardbtn').disabled = true;
	document.getElementById('quizbtn').disabled = true;
	document.getElementById('settingsbtn').disabled = true;
	document.getElementById('editbtn').disabled = true;
	document.getElementById('addrowbtn').disabled = true;
		
	//This code is what generates the quiz questions and answers	
	var formforquiz = document.createElement("form");
	var questionLbl = document.createElement("label");
	var questionAnswer = document.createElement("")
	
}

function disablequiz() {
    document.getElementById('SSheader').style.opacity = '1';
    document.getElementById('SScontent').style.opacity = '1';
    document.getElementById('SSfooter').style.opacity = '1';

    var quiz = document.getElementById("Quiz");
    if (quiz) {
        quiz.parentNode.removeChild(quiz);
    }

    // Enable buttons
    document.getElementById('flashcardbtn').disabled = false;
    document.getElementById('quizbtn').disabled = false;
    document.getElementById('settingsbtn').disabled = false;
    document.getElementById('editbtn').disabled = false;
    document.getElementById('addrowbtn').disabled = false;
}

function flashcards(table){
	
}

function createtag(input){
	
}

function logout(){
	sessionStorage.removeItem('loggedInUser');
	sessionStorage.removeItem('loggedInPassword');
	window.location.href = "login.html";
}