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

	//update visibility for action column
	const rows = document.querySelectorAll('#myTable tbody tr');
	const actionsHeader = document.querySelector('#myTable thead th:last-child');
    if (auth) {
        actionsHeader.classList.remove('hidden');
    }
	else
	{
		actionsHeader.classList.add('hidden');
	}


    rows.forEach(row => {
        // Reference the "Action" cell (last cell in the row)
        const actionCell = row.lastElementChild;

        // Add or remove the 'hidden' class based on the flag
        if (auth) {
            actionCell.classList.remove('hidden');
        } else {
            actionCell.classList.add('hidden');
        }
    })
}










// ------------ STUDY SET TABLE ------------ //
/*
This is simply to clone the rows on the study set template page
Will update when DB is set up to auto set rows for how many questions are in the set
for now just clones the table row
*/
function cloneRow() {
	var term = 'question' + count;
	var definition = 'definition' + count;
	var termId = count;
	addTermToTable(term, definition, termId)
	
	count++;
}

// ------------ STUDY SET UTILITIES ------------ //

//set class for selected rows 
// Set class for selected rows and listen for checkboxes or buttons
const table = document.querySelector('#myTable tbody');

function updateRowSelection(target, isChecked) {
    const row = target.closest('tr');
    if (isChecked) {
        row.classList.add('selected-row');
        console.log('Added to selected class:', row);
    } else {
        row.classList.remove('selected-row');
        console.log('Removed from selected class:', row);
    }
    
}

// Event listener for row checkboxes
table.addEventListener('change', (event) => {
    if (event.target.matches('.row-checkbox')) {
        updateRowSelection(event.target, event.target.checked);
    }
});


//allows for random numbers within a certain range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//used for setting row id's
let count=1;

//used to get the amount of rows in the quiz table
function getRowCount() {
    const table = document.getElementById('myTable');
    if (!table) {
        console.error("Table not found!");
        return 0;
    }

    // Select only rows within <tbody>
    const contentRows = table.querySelectorAll('tbody tr');
    return contentRows.length;
}
//get number of selected rows 
function getSelectedRowCount() {
    const table = document.getElementById('myTable');
    if (!table) {
        console.error("Table not found!");
        return 0;
    }

    // Select rows with the class .selected-row within the <tbody>
    const selectedRows = table.querySelectorAll('tbody tr.selected-row');
    return selectedRows.length;
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
    //document.getElementById('settingsbtn').disabled = false;
    
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
	//document.getElementById('settingsbtn').disabled = true;

	document.getElementById('addrowbtn').disabled = true;
}



// ------------ QUIZZES ------------ //

/*
variables for question type count
mcquestions = multiple choice
oequestions = open ended/fill in the blank
tfquestions = true or false questions
*/
var mcquestions = 0;
var oequestions = 0;
var tfquestions = 0;
var totalQuestions = 0;


var tempmcquestions = mcquestions;
var tempoequestions = oequestions;
var temptfquestions = tfquestions;

//used to hold questions and answers for quiz generation
const correct_questions = [];
const oe_questions = [];
const tf_questions = [];
const rand_answers = [];

//used to fill the question array and randomize it
function QuestionHandler(){
	//this will be used to select a random question type to get extra question
	var randomUnevenQuestionType = 0;
	//this will hold the number of questions per type used later in function
	var questionHolder = 0;
	//this will not be 0 if the total questions cannot be divided evenly
	var extraFlag = 0
	
	//if the correct_questions array is empty
	if(correct_questions.length === 0){
		// Check if the class 'selected-row' exists
		if(document.getElementsByClassName('selected-row').length > 0) {
			//if selected row exists this for loop will go through each row and only push the row's that are selected to the question array
			for(var i=1; i<=getRowCount(); i++){
				if(document.getElementById("row"+i).classList.contains('selected-row')){
					correct_questions.push(i);
				}
			}
		} 
		else {
			//this will push all rows into the correct_questions array
			for(var i=1; i<=getRowCount(); i++){
				correct_questions.push(i);
			}	
		}
	}
	else{
		//this will randomize the array
		shuffleArray(correct_questions);
	}
	//if the rand_answers array is empty
	if(rand_answers.length === 0){
		//this for loop will fill it
		for(var i=1; i<=getRowCount(); i++){
			rand_answers.push(i);
		}
	}
	else{
		//this will randomize the array
		shuffleArray(rand_answers);
	}
	
	//randomizes both arrays to make sure the answer is truly random
	shuffleArray(correct_questions);
	shuffleArray(rand_answers);
	
	/*------------------- quiz length portion of quizHandler ----------------------*/
	
	//sets the total questions to the length of the correct_questions array g
	totalQuestions = correct_questions.length;
	
	//if the user is just doing multiple choice questions
	if(mcquestions == 1 && oequestions == 0 && tfquestions == 0){
		mcquestions = correct_questions.length;
	}
	//if the user is just doing open ended questions
	else if(mcquestions == 0 && oequestions == 1 && tfquestions == 0){
		oequestions = correct_questions.length;
	}
	//if the user is just doing true false questions
	else if(mcquestions == 0 && oequestions == 0 && tfquestions == 1){
		tfquestions = correct_questions.length;
	}
	//if the user is doing a quiz
	else{
		//questionHolder will be the length of correct_questions/3 rounded down
		questionHolder = Math.floor(correct_questions.length / 3);
		
		//will assign each length of section
		mcquestions = questionHolder * 1;
		oequestions = questionHolder * 2;
		tfquestions = questionHolder * 3;

		//the extraFlag will tell the program if there is a remainder
		extraFlag = correct_questions.length % 3;
		if(extraFlag != 0){
			//will get a random number between 1 and 3
			randomUnevenQuestionType = getRandomNumber(1,3);
			//if random number is 1 it will add the extra to the mcquestions
			if(randomUnevenQuestionType == 1){
				mcquestions++;
			}
			//if the random number is 2 it will add one to the oequestions 
			else if(randomUnevenQuestionType == 2){
				oequestions++;
			}
			//if the random number is 3 it will add one to the tfquestions
			else{
				tfquestions++;
			}
		}
	}
	
}

//generates the quiz
function generate_quiz(){
	
	correct_questions.length = 0;
	oe_questions.length = 0;
	rand_answers.length = 0;
	tf_questions.length = 0;
	
	var randomQuestion = 0;
	var currentQuestion = 0;
	
	var termCount = getRowCount();
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
	if(termCount<3){
		//set the mcquestions to 0
		mcquestions = 0;
	}
	else{
		while(qcount < mcquestions){
			
			currentQuestion = correct_questions.at(qcount);
	
			//adds question label and answer buttons
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(qcount)).innerHTML;
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
				
				formforquiz.appendChild(questionAnswer);
				formforquiz.appendChild(answerLbl);
				
				formforquiz.appendChild(document.createElement("br"));
				
				if(rand_answers.at(i) == currentQuestion){
					document.getElementById("MC"+qcount+"A"+i).classList.add("correct_response");
				}
			}
			
			if(selectedAnswers.includes(correct_questions.at(qcount)) == false){
				document.getElementById("MC"+qcount+"LB"+correctAnswer).innerText =  document.getElementById("answer" + currentQuestion).innerText;
				document.getElementById("MC"+qcount+"A"+correctAnswer).classList.add("correct_response");
			}
			
			selectedAnswers.length = 0;
			
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
			
			qcount++;
		}
	}
	
	//--------------------- Open Ended Question generation --------------------------//

	if(termCount>0){
		while(qcount < oequestions){
			
			//adds question label and text input
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "term: " + document.getElementById("question"+correct_questions.at(qcount)).innerHTML + '&nbsp';
			questionLbl.id = "OE"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			//generates the actual radio input
			questionAnswer = document.createElement("input");
			questionAnswer.type = 'text';
			questionAnswer.name = 'OE' + qcount;
			questionAnswer.id = "OE"+qcount+"A";
			questionAnswer.classList.add("quizOption");
			formforquiz.appendChild(questionAnswer);
				
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
				
			oe_questions.push(document.getElementById("answer"+correct_questions.at(qcount)));	
			
			qcount++;
		}
	}
	
	//--------------------- True or False Question generation --------------------------//
	
	
	if(termCount>0){
		while(qcount < tfquestions){
			currentQuestion = correct_questions.at(qcount);
			tfflag = getRandomNumber(0, 1);
			
			//adds term label
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "Term: ";
			formforquiz.appendChild(questionLbl);
			
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(qcount)).innerHTML;
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
	
	
}

function quizCheck() {
	var termCount = getRowCount();
    var total = mcquestions+oequestions+tfquestions;
    var correctAnswered = 0;
	var questionIterator = 0;
	var iterator = mcquestions+1;
	
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
			if(document.getElementById("OE"+iterator+"A").value === oe_questions[questionIterator].textContent){
				correctAnswered++;
			}
			iterator++;
			questionIterator++
		}
	}
    
	correctAnswered = correctAnswered/total*100;
    alert(`Correct answers: ${correctAnswered}` + "%");
	enableSSaction();
	
	mcquestions = tempmcquestions;
	oequestions = tempoequestions;
	tfquestions = temptfquestions;
}

function mconly(){
	mcquestions = 5;
	oequestions = 0;
	tfquestions = 0;
	
	generate_quiz();
	document.getElementById(submitbtn).onclick = quizCheck;

}

function oeonly(){
	mcquestions = 0;
	oequestions = 5;
	tfquestions = 0;
	
	generate_quiz();
	document.getElementById(submitbtn).onclick = quizCheck;

}

function tfonly(){
	mcquestions = 0;
	oequestions = 0;
	tfquestions = 5;
	
	generate_quiz();
	document.getElementById(submitbtn).onclick = quizCheck;

}

// ------------ FLASH CARDS ------------ //

function flashCards() {
    disableSSaction();

    // Get rows with the class .selected-row
    const selectedRows = document.querySelectorAll('#myTable tbody tr.selected-row');
    const termCount = selectedRows.length;
    let currentQuestion = 0;

    // Check if there are selected rows to generate flashcards
    if (termCount > 0) {
        // Create exit button
        const exitbtn = document.createElement("button");
        exitbtn.id = "exitButton";
        exitbtn.innerHTML = "Close Flashcards";
        exitbtn.onclick = enableSSaction;

        // Create navigation buttons
        const nextbtn = document.createElement("button");
        const backbtn = document.createElement("button");
        nextbtn.id = "nextButton";
        backbtn.id = "backButton";
        nextbtn.innerHTML = "Next";
        backbtn.innerHTML = "Back";

        // Create flashcard div
        const flashcard = document.createElement("div");
        flashcard.id = "Flashcards";
        flashcard.appendChild(exitbtn);
        flashcard.appendChild(backbtn);
        flashcard.appendChild(nextbtn);
        flashcard.style.opacity = '1';

        // Create text holder div for flashcards
        const flashcardTextholder = document.createElement("div");
        const flashCardtext = document.createElement("h3");
        flashcardTextholder.id = "flashCardTextHolder";
        flashCardtext.id = "flashcardText";
        flashcard.appendChild(flashcardTextholder);
        flashcardTextholder.appendChild(flashCardtext);

        // Display the first term
        const firstRow = selectedRows[currentQuestion];
        const term = firstRow.querySelector('.question-cell').textContent.trim(); // Extract term
        flashCardtext.innerHTML = term;

        document.body.appendChild(flashcard);

        // OnClick function for the next button
        nextbtn.onclick = function () {
            currentQuestion = (currentQuestion + 1) % termCount; // Loop back to the first term
            const nextRow = selectedRows[currentQuestion];
            const term = nextRow.querySelector('.question-cell').textContent.trim(); // Extract term
            flashCardtext.innerHTML = term;

            if (flashcardTextholder.classList.contains('clicked')) {
                flashcardTextholder.classList.toggle('clicked');
            }
        };

        // OnClick function for the back button
        backbtn.onclick = function () {
            currentQuestion = (currentQuestion - 1 + termCount) % termCount; // Loop back to the last term
            const prevRow = selectedRows[currentQuestion];
            const term = prevRow.querySelector('.question-cell').textContent.trim(); // Extract term
            flashCardtext.innerHTML = term;

            if (flashcardTextholder.classList.contains('clicked')) {
                flashcardTextholder.classList.toggle('clicked');
            }
        };

        // OnClick function for flipping the flashcards
        flashcardTextholder.onclick = function () {
            const currentRow = selectedRows[currentQuestion];
            const term = currentRow.querySelector('.question-cell').textContent.trim(); // Extract term
            const answer = currentRow.querySelector('.answer-cell').textContent.trim(); // Extract answer

            if (flashCardtext.innerHTML === term) {
                flashCardtext.innerHTML = answer;
            } else {
                flashCardtext.innerHTML = term;
            }

            flashcardTextholder.classList.toggle('clicked');
        };
    } else {
        alert("No selected terms to create flashcards.");
        enableSSaction();
    }
}




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


//selection buttons 
function toggleSelection(selectAll) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll; // Update checkbox state
        updateRowSelection(checkbox, selectAll); // Update row selection
    });
}
document.getElementById('selectAllButton').addEventListener('click', () => toggleSelection(true));
document.getElementById('selectNoneButton').addEventListener('click', () => toggleSelection(false));




    // Function to add a term to the table
    function addTermToTable(term, definition, termId) {
		const row = tableBody.insertRow();
		row.setAttribute('id', 'row' + count);
		row.dataset.termId = termId; // Assign termId to the row for future reference
	
		// Checkbox cell
		const checkboxCell = row.insertCell();
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.classList.add('row-checkbox'); // Class for easier selection
		checkbox.setAttribute('id', 'checkbox' + count);
		checkboxCell.appendChild(checkbox);

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

    // Target the specific "Edit" button for this row
    const editBtn = row.querySelector('.edit-button');
    if (!editBtn) {
        console.error('Error: Edit button not found');
        return;
    }

    editBtn.textContent = 'Save';
    editBtn.classList.add('save-button');
    editBtn.classList.remove('edit-button'); // Update the class
    editBtn.onclick = () => saveRowEdits(row, questionCell, answerCell);
}

// Function to save row edits and update the database
function saveRowEdits(row, questionCell, answerCell) {
    const term = questionCell.textContent.trim();
    const definition = answerCell.textContent.trim();
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

        // Target the specific "Save" button and revert it back to "Edit"
        const saveBtn = row.querySelector('.save-button');
        if (!saveBtn) {
            console.error('Error: Save button not found');
            return;
        }

        saveBtn.textContent = 'Edit';
        saveBtn.classList.add('edit-button');
        saveBtn.classList.remove('save-button'); // Update the class
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


document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.getElementById("shareStudySetButton");
    const shareOptions = document.getElementById("shareOptions");
    const confirmShareButton = document.getElementById("confirmShareButton");
    const shareWithUserInput = document.getElementById("shareWithUser");
    const shareMessage = document.getElementById("shareMessage");

    // Show the share options when the "Share" button is clicked
    shareButton.addEventListener("click", () => {
        shareOptions.style.display = "block";
    });

    // Handle sharing the study set
    confirmShareButton.addEventListener("click", async () => {
        const usernameOrEmail = shareWithUserInput.value.trim();
        if (!usernameOrEmail) {
            alert("Please enter a username or email to share with.");
            return;
        }

        // Send the share request to the backend
        try {
            const response = await fetch("/api/share-studyset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studySetId: "12345", // Replace with the actual study set ID
                    shareWith: usernameOrEmail,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                shareMessage.textContent = `Study set shared successfully with ${usernameOrEmail}.`;
                shareMessage.style.display = "block";
            } else {
                shareMessage.textContent = `Failed to share study set: ${result.error}`;
                shareMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Error sharing study set:", error);
            shareMessage.textContent = "An error occurred while sharing the study set.";
            shareMessage.style.display = "block";
        }
    });
});