/*
--- studySetTemplate.js ---
All functions associated with with the
study set templates and their features
should be placed in this file
*/

//-------user-auth---------//
let auth = false; // Authorization flag
let studySetUser = null; // creator of current study set 
let currentUser = null; // logged in user

async function checkEditAuth() {
    try {
        // Fetch user authentication status
        const authResponse = await fetch('/check-auth');
        const authData = await authResponse.json();

        if (!authData.loggedIn) {
            auth = false; // User is not logged in
        } else {
            currentUser = authData.username;

            // Fetch the study set information
            const studySetId = new URLSearchParams(window.location.search).get('id');
            const studySetResponse = await fetch(`/study-set-info/${studySetId}`);
            const studySetData = await studySetResponse.json();

            studySetUser = studySetData.username;

            // Determine authorization
            auth = currentUser === studySetUser;

            console.log("Logged in User:", currentUser);
            console.log("StudySet Creator:", studySetUser);
        }
    } catch (error) {
        console.error('Error during authentication process:', error);
    }

    console.log("Final Auth Status:", auth);
    updateVisibility(); // Call after async tasks complete
}


document.addEventListener('DOMContentLoaded', () => {
    checkEditAuth();	
});

//toggle visibility for protected elements 
// Update visibility for protected elements
function updateVisibility() {
    const termForm = document.getElementById('termForm'); // Select the term form element
    const deleteButtons = document.querySelectorAll('button.delete-button'); // Select all delete buttons
    const editButtons = document.querySelectorAll('button.edit-button'); // Select all edit buttons

    // Update visibility for term form
    if (termForm) {
        if (auth) {
            termForm.classList.remove('hidden'); // Show form
            console.log("We're trying to show the form");
        } else {
            termForm.classList.add('hidden'); // Hide form
            console.log("We're trying to hide the form");
        }
    }

    // Update visibility for delete buttons
    deleteButtons.forEach(deleteBtn => {
        if (auth) {
            deleteBtn.classList.remove('hidden'); // Show button
            console.log("We're trying to show the delete button");
        } else {
            deleteBtn.classList.add('hidden'); // Hide button
            console.log("We're trying to hide the delete button");
        }
    });

    // Update visibility for edit buttons
    editButtons.forEach(editBtn => {
        if (auth) {
            editBtn.classList.remove('hidden'); // Show button
            console.log("We're trying to show the edit button");
        } else {
            editBtn.classList.add('hidden'); // Hide button
            console.log("We're trying to hide the edit button");
        }
    });
}










// ------------ STUDY SET TABLE ------------ //
/*
This is simply to clone the rows on the study set template page
Will update when DB is set up to auto set rows for how many questions are in the set
for now just clones the table row
*/
function cloneRow() {
	const table = document.getElementById("myTable");
    const row = table.insertRow();
    const question = row.insertCell();
	const answer = row.insertCell();
	
	row.setAttribute('class', 'StudySet-Q&A');
	row.setAttribute('id', 'row'+count);
	
    question.textContent = 'question '+count;
	answer.textContent = 'answer '+count;
	
	question.setAttribute('id', 'question' + count);
    answer.setAttribute('id', 'answer' + count);
	
	count++;
}

// ------------ STUDY SET UTILITIES ------------ //

//allows for random numbers within a certain range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//used for setting row id's
let count=1;

//used to get the amount of rows in the quiz table
function getRowCount(){
	const table = document.getElementById('myTable');
    return table.rows.length;
}
//used to randomize array
function shuffleArray(array){
	for (let i = array.length - 1; i > 0; i--) { 
		// Generate random index 
		const j = Math.floor(Math.random() * (i + 1));
					  
		// Swap elements at indices i and j
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

//Streamlined the disabling and enabling of the buttons and opacity for when generating quizzes/flashcards
function enableSSaction(){
	document.getElementById('SSheader').style.opacity = '1';
    document.getElementById('SScontent').style.opacity = '1';
    document.getElementById('SSfooter').style.opacity = '1';

    var quiz = document.getElementById("Quiz");
    if (quiz) {
		
        quiz.parentNode.removeChild(quiz);
    }
	
	var flashcard = document.getElementById("Flashcards");
    if (flashcard) {
        flashcard.parentNode.removeChild(flashcard);
    }

    // Enable buttons
    document.getElementById('flashcardbtn').disabled = false;
    document.getElementById('quizbtn').disabled = false;
    document.getElementById('settingsbtn').disabled = false;
    
    document.getElementById('addrowbtn').disabled = false;
}

function disableSSaction(){
	//These set the opacity of the elements on the page to low
	document.getElementById('SSheader').style.opacity = '.1';
	document.getElementById('SScontent').style.opacity = '.1';
	document.getElementById('SSfooter').style.opacity = '.1';
	
	//These disable all of the buttons on the side when the quiz is generated
	document.getElementById('flashcardbtn').disabled = true;
	document.getElementById('quizbtn').disabled = true;
	document.getElementById('settingsbtn').disabled = true;

	document.getElementById('addrowbtn').disabled = true;
}



// ------------ QUIZZES ------------ //

/*
variables for question type count
mcquestions = multiple choice
oequestions = open ended/fill in the blank
tfquestions = true or false questions
*/
var mcquestions = 5;
var oequestions = 5;
var tfquestions = 5;
var totalQuestions = mcquestions + oequestions + tfquestions;

//used to hold questions and answers for quiz generation
const correct_questions = [];
const oe_questions = [];
const tf_questions = [];
const rand_answers = [];

//used to fill the question array and randomize it
function QuestionHandler(){
	if(correct_questions.length === 0){
		for(var i=1; i<getRowCount(); i++){
			correct_questions.push(i);
			rand_answers.push(i);
		}
		shuffleArray(correct_questions);
		shuffleArray(rand_answers);
	}
	else{
		shuffleArray(correct_questions);
		shuffleArray(rand_answers);
	}
	shuffleArray(correct_questions);
	shuffleArray(rand_answers);
}

//generates the quiz
function generate_quiz(){
	
	correct_questions.length = 0;
	oe_questions.length = 0;
	rand_answers.length = 0;
	tf_questions.length = 0;
	
	var randomQuestion = 0;
	var currentQuestion = 0;
	
	var termCount = getRowCount()-1;
	var qcount = 0;
	
	const questions = [];
	const selectedAnswers = [];
	
	var tempmcquestions = mcquestions;
	
	var tfflag = 0;
	
	disableSSaction();
	
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
	submitbtn.onclick = quizCheck;
		
	//This code is what generates the quiz questions and answers	
	var formforquiz = document.createElement("form");
	var questionLbl = document.createElement("label");
	var answerLbl = document.createElement("label");
	var questionAnswer = document.createElement("input");
	
	//gives the form an id
	formforquiz.id = "quiz-QA-selector"
	
	//adds the form to the div
	quiz.appendChild(formforquiz);
	
	//randomizes the quiz questions
	QuestionHandler();
	
	//--------------------- Multiple choice --------------------------//
	if(termCount<4){
		//set the mcquestions to 0
		mcquestions = 0;
	}
	else{
		while(qcount != mcquestions){
			
			randomQuestion = getRandomNumber(0, correct_questions.length-1);
			currentQuestion = correct_questions.at(randomQuestion);
	
			//adds question label and answer buttons
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(randomQuestion)).innerHTML;
			questionLbl.id = "MC"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
				
			//selects correct answer and which answer selection it is randomly if needed
			var correctAnswer = getRandomNumber(0, 3);
			
			//will randomize answers
			shuffleArray(rand_answers);
			
			//this for loop will generate all of the quiz multiple choice answers
			for (var i = 0; i<4; i++){	
				//generates the actual radio input
				questionAnswer = document.createElement("input");
				questionAnswer.type = 'radio';
				questionAnswer.name = 'Answer' + qcount;
				questionAnswer.id = "MC"+qcount+"A"+i;
				questionAnswer.classList.add("quizOption");
					
				//generates the label for each input
				answerLbl = document.createElement("label");
				answerLbl.htmlFor = "MC"+qcount+"A"+i;
				answerLbl.id = "MC"+qcount+"LB"+i;
				answerLbl.innerHTML = document.getElementById("answer" + rand_answers.at(i)).innerText;
				
				//pushes the corrent generated answers to array, this is only used to check if the correct answer is in the options
				selectedAnswers.push(rand_answers.at(i));
					
				formforquiz.appendChild(answerLbl);
				formforquiz.appendChild(questionAnswer);
				
				formforquiz.appendChild(document.createElement("br"));
				
				if(rand_answers.at(i) == currentQuestion){
					document.getElementById("MC"+qcount+"A"+i).classList.add("correct_response");
				}
			}
			
			if(selectedAnswers.includes(currentQuestion) == false){
				document.getElementById("MC"+qcount+"LB"+correctAnswer).innerText =  document.getElementById("answer" + currentQuestion).innerText;
				document.getElementById("MC"+qcount+"A"+correctAnswer).classList.add("correct_response");
			}
			
			selectedAnswers.length = 0;
			
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
			
			qcount++;
		}
		qcount = 0;
	}
	
	//--------------------- Open Ended Question generation --------------------------//
	
	//randomizes the quiz questions
	QuestionHandler();

	if(termCount>0){
		while(qcount != oequestions){
			
			randomQuestion = getRandomNumber(0, correct_questions.length-1);
			
			
			//adds question label and text input
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "term: " + document.getElementById("question"+correct_questions.at(randomQuestion)).innerHTML + '&nbsp';
			questionLbl.id = "OE"+qcount;
			formforquiz.appendChild(questionLbl);
			
			//generates the actual radio input
			questionAnswer = document.createElement("input");
			questionAnswer.type = 'text';
			questionAnswer.name = 'OE' + qcount;
			questionAnswer.id = "OE"+qcount+"A";
			questionAnswer.classList.add("quizOption");
			formforquiz.appendChild(questionAnswer);
				
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
				
			oe_questions.push(document.getElementById("answer"+correct_questions.at(randomQuestion)));	
			
			qcount++;
		}
	}
	
	qcount = 0;
	
	//--------------------- True or False Question generation --------------------------//
	
	QuestionHandler();
	
	if(termCount>0){
			while(qcount != tfquestions){
			randomQuestion = getRandomNumber(0, correct_questions.length-1);
			currentQuestion = correct_questions.at(randomQuestion);
			tfflag = getRandomNumber(0, 1);
			
			//adds term label
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "Term: ";
			formforquiz.appendChild(questionLbl);
			
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(randomQuestion)).innerHTML;
			questionLbl.id = "TFT"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			tf_questions.push(currentQuestion);
			
			if(tfflag == 0){
				randomQuestion = getRandomNumber(0, correct_questions.length-1);
				currentQuestion = correct_questions.at(randomQuestion);
			}
			
			//adds definition label
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "Defintion: ";
			formforquiz.appendChild(questionLbl);
			
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("answer"+correct_questions.at(randomQuestion)).innerHTML;
			questionLbl.id = "TFD"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			for(var i=0; i<2; i++){
				
				//adds question label
				questionLbl = document.createElement("label");
				if(i==0){
					questionLbl.innerHTML = "T: ";
				}
				else{
					questionLbl.innerHTML = "F: ";
				}
				
				formforquiz.appendChild(questionLbl);
				
				//generates the actual radio input
				questionAnswer = document.createElement("input");
				questionAnswer.type = 'radio';
				questionAnswer.name = 'TF' + qcount;
				questionAnswer.id = "TF"+qcount+"A"+i;
				questionAnswer.classList.add("quizOption");
				formforquiz.appendChild(questionAnswer);
			}
			
				
			if(document.getElementById("TFT"+qcount).innerHTML == document.getElementById("question"+correct_questions.at(randomQuestion)).innerHTML){
				document.getElementById("TF"+qcount+"A"+0).classList.add("correct_response");
			}
			else{
				document.getElementById("TF"+qcount+"A"+1).classList.add("correct_response");
			}
			
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
			
			qcount++;
		}
	}
	
	
	
	
	formforquiz.appendChild(document.createElement("br"));
	formforquiz.appendChild(document.createElement("br"));
	quiz.appendChild(submitbtn);
	
	
	mcquestions = tempmcquestions;
}

function quizCheck() {
	var termCount = getRowCount()-1;
    var total = totalQuestions;
    var correctAnswered = 0;
	var questionIterator = 0;
	var iterator = 0;
	
	if(termCount == 0){
		enableSSaction();
	}
	else{
		 // Select all input elements with the class 'quizOption'
		const inputs = document.querySelectorAll('.quizOption');
		let selected = false;

		// Iterate through each input element and check if it is selected
		inputs.forEach(input => {
			if (input.checked) {
				selected = true;
				if (input.classList.contains("correct_response")) {
					correctAnswered++;
				}
			}
		});
		
		//open ended check
		while(iterator != oequestions){
			if(document.getElementById("OE"+iterator+"A").value === oe_questions[iterator].textContent){
				correctAnswered++;
			}
			iterator++
		}
	}
   
	
    
	correctAnswered = correctAnswered/total*100;
    alert(`Correct answers: ${correctAnswered}` + "%");
	enableSSaction();
}

// ------------ FLASH CARDS ------------ //

function flashCards(){
	
	disableSSaction();
	//used to keep track of the current question
	var currentQuestion = 1;
	var termCount = getRowCount();
	fetchTerms();
	//this div will check if there are any questions and generate the flashcard elements if there are.
	if(termCount > 0){
		
		//this creates the exit button for the flashcards
		var exitbtn = document.createElement("button");
		exitbtn.id = "exitButton";
		exitbtn.innerHTML = "Close Flashcards";
		exitbtn.onclick = enableSSaction;
		
		//this creates the exit button for the flashcards
		var nextbtn = document.createElement("button");
		var backbtn = document.createElement("button");
		nextbtn.id = "nextButton";
		backbtn.id = "backButton";
		nextbtn.innerHTML = "Next";
		backbtn.innerHTML = "Back";
		
		

		//creates the flashcard div and adds the buttons to it
		var flashcard = document.createElement("div");
		flashcard.id = "Flashcards";
		flashcard.appendChild(exitbtn);
		flashcard.appendChild(backbtn);
		flashcard.appendChild(nextbtn);
		flashcard.style.opacity = '1';
		
		//creates the text div that will hold the questions and answers of the flashcards
		var flashcardTextholder = document.createElement("div");
		var flashCardtext = document.createElement("h3");
		flashcardTextholder.id = "flashCardTextHolder";
		flashCardtext.id = "flashcardText";
		flashcard.appendChild(flashcardTextholder);
		flashcardTextholder.appendChild(flashCardtext);
		//This changes the text to the question text
		flashCardtext.innerHTML = document.getElementById("question1").innerText;
		
		document.body.appendChild(flashcard);
		
		//adds the onclick function to the next button
		document.getElementById("nextButton").onclick = function() {
			currentQuestion++;
			if(currentQuestion > termCount){
				currentQuestion = 1;
				flashCardtext.innerHTML = document.getElementById("question1").innerText;
			}
			else{
				flashCardtext.innerHTML = document.getElementById("question"+currentQuestion).innerText;
			}
			
			if(flashcardTextholder.classList.contains('clicked')){
				flashcardTextholder.classList.toggle('clicked');
			}
		}
		
		//adds the onclick function to the back button
		document.getElementById("backButton").onclick = function() {
			currentQuestion--;
			if(currentQuestion < 1){
				currentQuestion = termCount;
				flashCardtext.innerHTML = document.getElementById("question"+currentQuestion).innerText;
			}
			else{
				flashCardtext.innerHTML = document.getElementById("question"+currentQuestion).innerText;
			}
			if(flashcardTextholder.classList.contains('clicked')){
				flashcardTextholder.classList.toggle('clicked');
			}
		}
		
		//this does the "flipping" of the flashcards
		document.getElementById("flashCardTextHolder").onclick = function() {
			if(flashCardtext.innerHTML == document.getElementById("question"+currentQuestion).innerText){
				flashCardtext.innerHTML = document.getElementById("answer"+currentQuestion).innerText;
			}
			else{
				flashCardtext.innerHTML = document.getElementById("question"+currentQuestion).innerText;
			}
			
			// Toggle the 'clicked' class to change the background color
            flashcardTextholder.classList.toggle('clicked');	
		}
	}
	else{
		alert("no StudySet Questions");
		enableSSaction();
	}
}

// ------------ SETINGS ------------ //
// WILL FILL IN LATER



//------------Datbase Operations------------
//Caleb Ruby's additions
/*
	This segment of code populates the table with the terms in the study set 
*/
    // Function to fetch and display terms
	const studySetId = new URLSearchParams(window.location.search).get('id');
    const tableBody = document.getElementById('myTable').querySelector('tbody');
    function fetchTerms() {
        return fetch(`/study-sets/${studySetId}/terms`)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
			count = 1;
            data.forEach(term => {
                addTermToTable(term.term, term.definition, term.term_id);
				count++;
            });
        })
        .catch(error => {
            console.error('Error fetching terms:', error);
        });
    }

    // Function to add a term to the table
    function addTermToTable(term, definition, termId) {
		const row = tableBody.insertRow();
		row.dataset.termId = termId; // Assign termId to the row for future reference
	
		const questionCell = row.insertCell();
		questionCell.classList.add('question-cell');
		questionCell.textContent = term;
		questionCell.setAttribute('id', 'question' + count);
	
		const answerCell = row.insertCell();
		answerCell.classList.add('answer-cell');
		answerCell.textContent = definition;
		answerCell.setAttribute('id', 'answer' + count);
	
		const actionCell = row.insertCell();
		
		const deleteBtn = document.createElement('button');
		deleteBtn.textContent = 'Delete';
		deleteBtn.classList.add('delete-button'); // Add class for selection
		if (!auth) {
			deleteBtn.classList.add('hidden'); // Immediately hide if not authorized
		}
		deleteBtn.onclick = () => deleteTerm(row, termId);
		actionCell.appendChild(deleteBtn);

		const editBtn = document.createElement('button');
		editBtn.textContent = 'Edit';
		editBtn.classList.add('edit-button'); // Add class for selection
		if (!auth) {
			editBtn.classList.add('hidden'); // Immediately hide if not authorized
		}
		editBtn.onclick = () => makeRowEditable(row);
		actionCell.appendChild(editBtn);

		
		
		

		row.appendChild(actionCell);
		
	
    }
fetchTerms();

/* 
	script to handle form submission and save term to database 
*/
//grabs values from form 
document.querySelector('#termForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const termInput = document.querySelector('#term');
    const definitionInput = document.querySelector('#definition');
    
    const term = termInput.value;
    const definition = definitionInput.value;

    saveTerm(term, definition);
    
    // Clear the form inputs
    termInput.value = '';
    definitionInput.value = '';
});
//fetches the route 
function saveTerm(term, definition) {
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
    })
    .catch(error => {
        console.error('Error adding term:', error);
    });

	fetchTerms();	//just make sure table updates after adding a term 
}



/**
	hanldes deletion 
 */
// Function to handle deleting term from database
function deleteTerm(row, termId) {
	fetch(`/terms/${termId}`, {
		method: 'DELETE'
	})
	.then(response => response.json())
	.then(data => {
		alert('Term deleted successfully');
		// Remove the row from the table
		row.remove();
		fetchTerms();
	})
	.catch(error => {
		console.error('Error deleting term:', error);
	});
}



/**
 * Script to handle term editing 
 */
//makes the table row editable 
function makeRowEditable(row) {
    const questionCell = row.querySelector('.question-cell');
    const answerCell = row.querySelector('.answer-cell');

    if (!questionCell || !answerCell) {
        console.error('Error: Unable to find questionCell or answerCell');
        return;
    }

    // Enable content editing
    questionCell.contentEditable = true;
    answerCell.contentEditable = true;

    // Change "Edit" button to "Save" button
    const editBtn = row.querySelector('button');
    editBtn.textContent = 'Save';
    editBtn.onclick = () => saveRowEdits(row, questionCell, answerCell);
		//calls the saving function to save changes 
}

// Function to save row edits and update the database
function saveRowEdits(row, questionCell, answerCell) {
    const term = questionCell.textContent;
    const definition = answerCell.textContent;
    const termId = row.dataset.termId;

    fetch(`/terms/${termId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term, definition })
    })
    .then(response => response.json())
    .then(data => {
        alert('Term updated successfully');
        // Disable content editing
        questionCell.contentEditable = false;
        answerCell.contentEditable = false;
        // Change "Save" button back to "Edit" button
        const saveBtn = row.querySelector('button');
        saveBtn.textContent = 'Edit';
        saveBtn.onclick = () => makeRowEditable(row);
    })
    .catch(error => {
        console.error('Error updating term:', error);
    });
}


/**
 * function to update the study set title header  
 */
// Function to fetch study set details and update the title
function updateStudySetTitle() {
    fetch(`/study-sets/${studySetId}`)
    .then(response => response.json())
    .then(data => {
        const studySetNameElement = document.getElementById('studySetName').querySelector('h1');
        studySetNameElement.textContent = data.set_name; // Assuming 'set_name' is the property for the study set title
    })
    .catch(error => {
        console.error('Error fetching study set details:', error);
    });
}
//update the details 
function fetchStudySetDetails() {
	// Make a GET request to your route
	fetch(`/study-set-info/${studySetId}`)
		.then(response => response.json())
		.then(data => {
            // Format the date
            const rawDate = new Date(data.created_at); // Convert to JavaScript Date object
            const formattedDate = rawDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // Populate the details-section with formatted data
            const detailsSection = document.querySelector('.details-section');
            detailsSection.innerHTML = `
                <p><strong>Date Created:</strong> ${formattedDate}</p>
                <p><strong>Creator:</strong> ${data.username}</p>
                <p><strong>Category:</strong> ${data.category}</p>
            `;
        })
		.catch(error => {
			console.error('Error:', error.message);
		});
}

// Call the function to update the study set title when the page loads
document.addEventListener('DOMContentLoaded', updateStudySetTitle);
document.addEventListener('DOMContentLoaded', fetchStudySetDetails);


