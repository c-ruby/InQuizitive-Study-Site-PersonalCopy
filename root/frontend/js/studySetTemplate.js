/*
--- studySetTemplate.js ---
All functions associated with with the
study set templates and their features
should be placed in this file
*/

// ------------ STUDY SET TABLE ------------ //
/*
This is simply to clone the rows on the study set template page
Will update when DB is set up to auto set rows for how many questions are in the set
for now just clones the table row
*/
// Function to add a term to the table
document.addEventListener('DOMContentLoaded', function() {
    const studySetId = new URLSearchParams(window.location.search).get('id');
    const tableBody = document.getElementById('myTable').querySelector('tbody');
    let count = 1;

    // Function to fetch and display terms
    function fetchTerms() {
        fetch(`/study-sets/${studySetId}/terms`)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            data.forEach(term => {
                addTermToTable(term.term, term.definition);
            });
        })
        .catch(error => {
            console.error('Error fetching terms:', error);
        });
    }

    // Function to add a term to the table
    function addTermToTable(term, definition) {
        const row = tableBody.insertRow();
        const questionCell = row.insertCell();
        const answerCell = row.insertCell();
        const actionCell = row.insertCell();
        
        questionCell.textContent = term;
        answerCell.textContent = definition;
        actionCell.innerHTML = '<button class="submit-btn">Submit</button>';

        questionCell.contentEditable = true;
        answerCell.contentEditable = true;

        // Add event listener to the submit button
        actionCell.querySelector('.submit-btn').addEventListener('click', function() {
            const updatedTerm = questionCell.textContent;
            const updatedDefinition = answerCell.textContent;

            // Save the term to the database
            fetch(`/study-sets/${studySetId}/terms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ term: updatedTerm, definition: updatedDefinition })
            })
            .then(response => response.json())
            .then(data => {
                alert('Term added successfully');
                fetchTerms(); // Refresh the list of terms
            })
            .catch(error => {
                console.error('Error adding term:', error);
            });
        });
    }

    // Function to handle adding a new row
    function addRow() {
        const row = tableBody.insertRow();
        const questionCell = row.insertCell();
        const answerCell = row.insertCell();
        const actionCell = row.insertCell();
        
        questionCell.contentEditable = true;
        answerCell.contentEditable = true;
        actionCell.innerHTML = '<button class="submit-btn">Submit</button>';

        // Add event listener to the submit button
        actionCell.querySelector('.submit-btn').addEventListener('click', function() {
            const term = questionCell.textContent;
            const definition = answerCell.textContent;

            // Save the term to the database
            fetch(`/study-sets/${studySetId}/terms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ term, definition })
            })
            .then(response => response.json())
            .then(data => {
                alert('Term added successfully');
                fetchTerms(); // Refresh the list of terms
            })
            .catch(error => {
                console.error('Error adding term:', error);
            });
        });
    }

    // Fetch and display terms on page load
    fetchTerms();

    // Bind addRow function to button
    document.getElementById('addrowbtn').onclick = addRow;
});

//allows for random numbers within a certain range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//used for setting row id's
let count=1;

//used to get the amount of rows in the quiz table
function getRowCount(){
	const table = document.getElementById('myTable');
    return table.rows.length-1;
}

// Unclear what this does atm.
function createtag(input){
	
}




// ------------ QUIZZES ------------ //
//generates the quiz
function generate_quiz(){
	var questionCount = getRowCount();
	
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
    
	
	//These disable all of the buttons on the side when the quiz is generated
	document.getElementById('flashcardbtn').disabled = true;
	document.getElementById('quizbtn').disabled = true;
	document.getElementById('settingsbtn').disabled = true;
	document.getElementById('editbtn').disabled = true;
	document.getElementById('addrowbtn').disabled = true;
		
	//This code is what generates the quiz questions and answers	
	var formforquiz = document.createElement("form");
	var questionLbl = document.createElement("label");
	var questionAnswer = document.createElement("input");
	//gives the form an id
	formforquiz.id ="quiz-QA-selector"
	
	//adds the form to the div
	quiz.appendChild(formforquiz);
	
	//this for loop will create n question answer combos for n questions in table
	for(var qcount = 1; qcount <= questionCount; qcount++){
		//adds question label and answer buttons
		questionLbl = document.createElement("label");
		questionLbl.innerHTML = qcount;
		formforquiz.appendChild(questionLbl);
		formforquiz.appendChild(document.createElement("br"));
		formforquiz.appendChild(document.createElement("br"));
		//selects correct answer and which answer selection it is randomly
		var correctAnswer = getRandomNumber(1, 4);
		
		//double for loops to place two buttons next to each other, and two bellow
		for (var i = 0; i<2; i++){
			for (var j=0; j<2; j++){
				
				questionAnswer = document.createElement("input");
				questionAnswer.type = 'radio';
				questionAnswer.name = 'Answer' + qcount;
				formforquiz.appendChild(questionAnswer);
			}
			formforquiz.appendChild(document.createElement("br"));
		}
		formforquiz.appendChild(document.createElement("br"));
	}
	formforquiz.appendChild(document.createElement("br"));
	formforquiz.appendChild(document.createElement("br"));
	
	
	quiz.appendChild(submitbtn);
}

//this function is what submits the quiz
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




// ------------ FLASH CARDS ------------ //
function flashCards(){
	var questionCount = getRowCount();
	var currentQuestion = 0;
	var question;
	var answer;
	//this creates the exit button for the flashcards
	var exitbtn = document.createElement("button");
	exitbtn.id = "exitButton";
	exitbtn.innerHTML = "Close Flashcards";
	exitbtn.onclick = disableFlashcards;
	
	//this creates the exit button for the flashcards
	var nextbtn = document.createElement("button");
	var backbtn = document.createElement("button");
	nextbtn.id = "nextButton";
	backbtn.id = "backButton";
	nextbtn.innerHTML = "Next";
	backbtn.innerHTML = "Back";
	
	//These set the opacity of the elements on the page to low
	document.getElementById('SSheader').style.opacity = '.1';
	document.getElementById('SScontent').style.opacity = '.1';
	document.getElementById('SSfooter').style.opacity = '.1';

	//creates the flashcard div and adds the buttons to it
	var flashcard = document.createElement("div");
	flashcard.id = "Flashcards";
	flashcard.appendChild(exitbtn);
	flashcard.appendChild(backbtn);
	flashcard.appendChild(nextbtn);
	flashcard.style.opacity = '1';
	
	//These disable all of the buttons on the side when the quiz is generated
	document.getElementById('flashcardbtn').disabled = true;
	document.getElementById('quizbtn').disabled = true;
	document.getElementById('settingsbtn').disabled = true;
	document.getElementById('editbtn').disabled = true;
	document.getElementById('addrowbtn').disabled = true;
	
	
	if(questionCount > 0){
		currentQuestion = 1;
		document.body.appendChild(flashcard);   
	} else{
		alert("No StudySet questions");
		disableFlashcards();
	}	
}

function disableFlashcards(){
	document.getElementById('SSheader').style.opacity = '1';
    document.getElementById('SScontent').style.opacity = '1';
    document.getElementById('SSfooter').style.opacity = '1';

    var flashcard = document.getElementById("Flashcards");
    if (flashcard) {
        flashcard.parentNode.removeChild(flashcard);
    }

    // Enable buttons
    document.getElementById('flashcardbtn').disabled = false;
    document.getElementById('quizbtn').disabled = false;
    document.getElementById('settingsbtn').disabled = false;
    document.getElementById('editbtn').disabled = false;
    document.getElementById('addrowbtn').disabled = false;
}