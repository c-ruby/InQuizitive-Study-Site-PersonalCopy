/*
--- studySetTemplate.js ---
All functions associated with with the
study set templates and their features
should be placed in this file
*/


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