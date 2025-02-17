// event listeners for the search bar
document.addEventListener("DOMContentLoaded", function(){
	const searchbar = document.getElementById("searchbar");
	if (searchbar){
		searchbar.addEventListener("keypress", clickPress);
	}
});

function clickPress(event){
	if(event.keyCode == 13){
		var searchBar = document.getElementById("searchbar");
		searchBar.value = "";
	}
}