/*
--- studySetTemplate.js ---
All functions associated with with the
study set templates and their features
should be placed in this file
*/

//initialize page 
document.addEventListener('DOMContentLoaded', async () => {
    await checkEditAuth(); // Wait for user and authorization setup to complete
    await fetchTerms(); // Populate the table and learning status after auth check
});






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


    //update visibility for header buttons 
    const headerButtonContainer = document.querySelector('.button-container');
    

    if(currentUser != null)
    {
        // Remove the 'hidden' class from both buttons
        headerButtonContainer.classList.remove('hidden');;
        
    }
    else
    {
        headerButtonContainer.classList.add('hidden');
        
    }
    


	//update visibility for action and learning status column for non-account users
	const rows = document.querySelectorAll('#myTable tbody tr');
	const actionsHeader = document.querySelector('#myTable thead th:last-child');
    const statusHeader = document.querySelector('#myTable thead th:nth-child(4)');
    if (auth) {
        actionsHeader.classList.remove('hidden');
        statusHeader.classList.remove('hidden');
    }
	else
	{
		actionsHeader.classList.add('hidden');
        statusHeader.classList.add('hidden');
	}

    rows.forEach(row => {
        // Reference the Action and Status cells
        const actionCell = row.lastElementChild;
        const statusCell = row.cells[4];

        // Add or remove the 'hidden' class based on the flag
        if (auth) {
            actionCell.classList.remove('hidden');
            statusCell.classList.remove('hidden');

        } else {
            actionCell.classList.add('hidden');
            statusCell.classList.add('hidden');
        }
    })
}

function fetchCurrentUser() {
    let CURRENT_USER = null; // Default to null

    fetch('/current-user')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                CURRENT_USER = data.user; // Set the current user
                console.log("Current user:", CURRENT_USER);
            } else {
                console.warn("No user logged in.");
            }
        })
        .catch(error => {
            console.error("Error fetching current user:", error);
        });

    return CURRENT_USER; // Note: This will initially return null because fetch is asynchronous
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

//Learning status funcitons
async function toggleLearningStatus(termId, username, statusBubble) {
    const newStatus = statusBubble.textContent === "unknown" ? 1 : 0;

    // Update the UI immediately for smoother experience
    statusBubble.textContent = newStatus === 1 ? "known" : "unknown";
    statusBubble.classList.toggle('unknown', newStatus === 0);
    statusBubble.classList.toggle('known', newStatus === 1);

    // Send the status update to the backend
    try {
        const response = await fetch('/update-term-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                termId: termId,
                username: username,
                status: newStatus,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("Failed to update status in database:", result.message);
        }
    } catch (error) {
        console.error("Error while updating status:", error);
    }
}



async function addLearningStatusCell(row, termId, username) {
    const statusCell = row.insertCell();
    
    // Create the status bubble
    const statusBubble = document.createElement('span');
    statusBubble.textContent = "Loading..."; // Placeholder text
    statusBubble.classList.add('status-bubble'); // Initial class
    statusCell.appendChild(statusBubble);

    // Fetch term status from the backend
    try {
        const response = await fetch(`/get-term-status?username=${username}&termId=${termId}`);
        const data = await response.json();

        // Set status based on the response
        const statusValue = data.status; // Assuming the backend returns a numeric `status` field
        if (statusValue > 0) {
            statusBubble.textContent = " ";      // Simply apply color indicators instead
            statusBubble.classList.add('known'); // Apply appropriate CSS class
        } else {
            statusBubble.textContent = " ";        // Simply apply color indicators instead
            statusBubble.classList.add('unknown'); // Apply appropriate CSS class
        }
    } catch (error) {
        console.error("Error fetching term status:", error);
        statusBubble.textContent = "error"; // Indicate fetching error
        statusBubble.classList.add('error'); // Apply error class
    }

    console.log("Status bubble added:", statusBubble); // Debugging check
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = "Toggle Status";
    toggleButton.classList.add('toggle-button');
    toggleButton.addEventListener('click', () => {
        toggleLearningStatus(termId, currentUser, statusBubble); // Pass required info to toggle
    });
    statusCell.appendChild(toggleButton);
}





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
	//this block of code is used to make these HTML elements visible again
	document.getElementById('SSheader').style.opacity = '1';
    document.getElementById('SScontent').style.opacity = '1';
    document.getElementById('SSfooter').style.opacity = '1';
	
	//this quiz variable is used to hold the Quiz div, then if the div exists it will delete the div
    var quiz = document.getElementById("Quiz");
    if (quiz) {
		
        quiz.parentNode.removeChild(quiz);
    }
	
	//this flashcard variable is used to hold the Flashcards div, then if the div exists it will delete the div
	var flashcard = document.getElementById("Flashcards");
    if (flashcard) {
        flashcard.parentNode.removeChild(flashcard);
    }

    // Enable buttons
    document.getElementById('flashcardbtn').disabled = false;
    document.getElementById('quizbtn').disabled = false;    
	document.getElementById('mconlybtn').disabled = false;
	document.getElementById('oeonlybtn').disabled = false;
	document.getElementById('tfonlybtn').disabled = false;
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
	document.getElementById('mconlybtn').disabled = true;
	document.getElementById('oeonlybtn').disabled = true;
	document.getElementById('tfonlybtn').disabled = true;
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

//quizFlag will be used if the user is doing a quiz the value will be 1 otherwise it will be 0
var quizFlag = 0

//used to hold questions and answers for quiz generation
const correct_questions = [];
const oe_questions = [];
const tf_questions = [];
const rand_answers = [];

//used to fill the question array and randomize it
function QuestionHandler(){
	/*
		randomUnevenQuestionType will be used to select a random question type to get extra question
		questionHolder will hold the number of questions per type used later in function
		extraFlag will not be 0 if the total questions cannot be divided evenly, else it will be a 1 or 2 depeding on amount of extra questions
	*/
	var randomUnevenQuestionType = 0; 															
	var questionHolder = 0; 																	
	var extraFlag = 0																			
	
	if(correct_questions.length === 0){															//if the correct_questions array is empty
		if(document.getElementsByClassName('selected-row').length > 0) {						// Check if the class 'selected-row' exists
			for(var i=1; i<=getRowCount(); i++){												//if selected row exists this for loop will go through each row and only push the row's that are selected to the question array
				if(document.getElementById("row"+i).classList.contains('selected-row')){		//the actual if statement that checks if the 
					correct_questions.push(i);
				}
			}
		} 
		else {																					//this else will fill the array will all terms if the user has not selected any
			for(var i=1; i<=getRowCount(); i++){
				correct_questions.push(i);
			}	
		}
	}
	
	//if the rand_answers array is empty
	if(rand_answers.length === 0){
		//this for loop will fill it
		for(var i=1; i<=getRowCount(); i++){
			rand_answers.push(i);
		}
	}
	
	//randomizes both arrays to make sure the answer is truly random
	shuffleArray(correct_questions);
	shuffleArray(rand_answers);
	
	/*------------------- quiz length portion of QuestionHandler ----------------------*/
	
	//if the quizFlag is 1 it will mean the user has selected to do a quiz, and the program will proceed with the automatic question length
	if(quizFlag == 1){
		//sets the total questions to the length of the correct_questions array
		totalQuestions = correct_questions.length;
		
		//questionHolder will be the length of correct_questions/3 rounded down, this is used to determine how many each questions should be in each type initially 
		questionHolder = Math.floor(correct_questions.length / 3);
			
		//will assign each length of section
		mcquestions = questionHolder * 1;
		oequestions = questionHolder * 2;
		tfquestions = questionHolder * 3;

		//the extraFlag will tell the program if there is a remainder
		extraFlag = correct_questions.length % 3;
			
		//while the extraFlag is greater than zero this loop will go through and distribute the extra questions making the appropriate adjustments to each size
		while(extraFlag > 0){
			//will get a random number between 1 and 3
			randomUnevenQuestionType = getRandomNumber(1,3);
			if(extraFlag == 1){
				//if random number is 1 it will add the extra to the mcquestions
				if(randomUnevenQuestionType == 1){
					mcquestions++;
					oequestions++;
				}
				//if the random number is 2 it will add one to the oequestions 
				if(randomUnevenQuestionType == 2){
					oequestions++;
				}
				//true or false questions will go up regardless of question type to keep the initial amount of questions the same
				tfquestions++;
			}
				
			if(extraFlag == 2){
				//if random number is 1 it will add the extra to the mcquestions
				if(randomUnevenQuestionType == 1){
					mcquestions++;
					oequestions++;
				}
				//if the random number is 2 it will add one to the oequestions 
				if(randomUnevenQuestionType == 2){
					oequestions++;
				}
				//true or false questions will go up regardless of quesiton type to keep the initial amount of questions the same 
				tfquestions++;
			}
			extraFlag--;
		}
	}
	quizFlag = 0;
}

//generates the quiz
function generate_quiz(){
	//this will set the quizFlag to 1 to tell the program the user has selected a quiz 
	quizFlag = 1;
	
	//this will zero out each array everytime a quiz is generated to assure its different everytime
	correct_questions.length = 0;
	oe_questions.length = 0;
	rand_answers.length = 0;
	tf_questions.length = 0;
	
	//randomQuestion is used later in the true and false to grab a random question if the tfflag is set to 0
	var randomQuestion = 0;
	
	//currentQuestion is used to hold the current question at(qcount) in the correct_questions array 
	var currentQuestion = 0;
	
	//termCount is used to hold table length
	var termCount = getRowCount();
	
	//qcount is used to hold the current question count
	var qcount = 0;
	
	//selectedAnswers is used to keep track of the multiple choice answers to insure the correct answer is one of the selections
	const selectedAnswers = [];
	
	//tfflag is the true or false flag, 0 = false, 1 = true
	var tfflag = 0;
	
	//disableSSaction call to prevent the user from generating more than one quiz
	disableSSaction();
	
	//this block of code will generate the quiz div 
	var quiz = document.createElement("div");												//creates the quiz div
	quiz.id = "Quiz";																		//sets the quiz id
	document.body.appendChild(quiz);														//attaches the quiz to the HTML body
	
	//this block of code will create the study set name
	var studySetName = document.getElementById("studySetName").innerHTML;					//grabs study set name
	studySetName.id = "StudySetName"														//sets the studySetName id 
	quiz.innerHTML = studySetName;															//adds the studySetName to the quiz
	
	//this adds the submit button to the bottom of the quiz div
	var submitbtn = document.createElement("button");										//submitbtn creates the html element button
    submitbtn.id = "submitbtn";																//assigns the id submitbtn to submitbtn
    submitbtn.innerHTML = "Submit";															//adds the text "Submit" to the button
	submitbtn.onclick = quizCheck;															//assigns the onlick of the button to call the function quizCheck()
		
		
	//This code is what generates the quiz questions and answers	
	var formforquiz = document.createElement("form");										//formforquiz creates the html element form
	var questionLbl = document.createElement("label");										//questionLbl creates the html element label
	var answerLbl = document.createElement("label");										//answerLbl creates the html element label
	var questionAnswer = document.createElement("input");									//questionAnswer creates the html element label
	
	//gives the form an id
	formforquiz.id = "quiz-QA-selector"
	
	//adds the form to the quiz div
	quiz.appendChild(formforquiz);
	
	//randomizes the quiz questions
	QuestionHandler();
	
	//--------------------- Multiple choice --------------------------//

	//while loop will go through generating the multiple choice questions until the qcount is at the mcquestions number
	while(qcount < mcquestions){
		
		//sets the currentQuestions to the value that is at correct_questions.at(qcount)
		currentQuestion = correct_questions.at(qcount);

		//adds question label and answer buttons
		questionLbl = document.createElement("label");																		//questionLbl will create the HTML element label
		questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(qcount)).innerHTML;					//questionLbl text will become the question that is in the correct_questions.at(qcount)
		questionLbl.id = "MC"+qcount;																						//questionLbl will get the id ""MC"+qcount"
		formforquiz.appendChild(questionLbl);																				//adds the questionLbl to the quiz form
		formforquiz.appendChild(document.createElement("br"));																//creates a linebreak for better spacing
		formforquiz.appendChild(document.createElement("br"));																//creates a linebreak for better spacing
			
		//the correctAnswer variable is used to pick a random number for the answer selection if the right answer isnt already an option
		var correctAnswer = getRandomNumber(0, 3);
		
		//will randomize answers
		shuffleArray(rand_answers);
		
		//this for loop will generate all of the quiz multiple choice answers
		for (var i = 0; i<4; i++){	

			//this block of code will generate the buttons for each answer
			questionAnswer = document.createElement("input");																//questionAnswer creates the HTML element input
			questionAnswer.type = 'radio';																					//questionAnswer becomes the input type radio
			questionAnswer.name = 'Answer' + qcount;																		//questionAnswer gets set to the name ""answer"+qcount" so that the user can only select one multiple choice answer in the set
			questionAnswer.id = "MC"+qcount+"A"+i;																			//questionAnswer gets a unique id of ""MC"+ qcount + "A"+ i"
			questionAnswer.classList.add("quizOption");																		//questionAnswer gets the class "quizOption"
				
			//generates the label for each answer
			answerLbl = document.createElement("label");																	//answerLbl creates the HTML element label
			answerLbl.htmlFor = "MC"+qcount+"A"+i;																			//answerLbl is set to be for its specific radio button
			answerLbl.id = "MC"+qcount+"LB"+i;																				//answerLbl gets a unique id of ""MC" + qcount + "LB" + i"
			answerLbl.innerHTML = document.getElementById("answer" + rand_answers.at(i)).innerText;							//answerLbl becomes the answer that is in rand_answers.at(i)
			
			//pushes the corrent generated answers to array, this is only used to check if the correct answer is in the options
			selectedAnswers.push(rand_answers.at(i));
			
			//adds the radio button and the label for each radio button to the quiz
			formforquiz.appendChild(questionAnswer);
			formforquiz.appendChild(answerLbl);
			
			//adds a line break after each answer
			formforquiz.appendChild(document.createElement("br"));
			
			//this if will check if the correct question 
			if(rand_answers.at(i) == currentQuestion){
				document.getElementById("MC"+qcount+"A"+i).classList.add("correct_response");
			}
			
			//these three if statments will check if there are less than 4 questions in the study set, and adjust i to display the correct amount without crashing
			//it will set i to 3 to insure the program leaves the for loop without crashing
			if(termCount == 3 && i == 2){
				i = 3;
			}
			if(termCount == 2 && i == 1){
				i = 3;
			}
			if(termCount == 1 && i == 0){
				i = 3;
			}
		}
		//this if will check if the selectedAnswers array has the correct_questions answer, if it does not it will randomly add the correct answer to the 4 selected questions
		if(selectedAnswers.includes(correct_questions.at(qcount)) == false){
			document.getElementById("MC"+qcount+"LB"+correctAnswer).innerText =  document.getElementById("answer" + currentQuestion).innerText;
			document.getElementById("MC"+qcount+"A"+correctAnswer).classList.add("correct_response");
		}
		
		//will clear the selectedAnswers array to ensure no bad data when the while loop goes through again
		selectedAnswers.length = 0;
		
		//adds two line breaks for styling
		formforquiz.appendChild(document.createElement("br"));
		formforquiz.appendChild(document.createElement("br"));
		
		//increments the qcount variable
		qcount++;
	}
	
	//--------------------- Open Ended Question generation --------------------------//

	if(termCount>0){
		
		//this while loop will increase go until the qcount variable is equal to the oequestions
		while(qcount < oequestions){
			
			//adds question label and text input
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "term: " + document.getElementById("question"+correct_questions.at(qcount)).innerHTML + '&nbsp';
			questionLbl.id = "OE"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			//generates the text input boxes and assigns all of the appropriate values to them
			questionAnswer = document.createElement("input");
			questionAnswer.type = 'text';
			questionAnswer.name = 'OE' + qcount;
			questionAnswer.id = "OE"+qcount+"A";
			questionAnswer.classList.add("quizOption");
			formforquiz.appendChild(questionAnswer);
				
			//adds line breaks for styling purposes
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
			
			//pushes the correct answer into the oe_questions array for checking later
			oe_questions.push(document.getElementById("answer"+correct_questions.at(qcount)));	
			
			//increments the qcount 
			qcount++;
		}
	}
	
	//--------------------- True or False Question generation --------------------------//
	
	//tfquestiontracker is used to keep track of it the text should be T: or F: later in the true and false generation
	var tfquestiontracker = 0;
	
	if(termCount>0){
		//this while loop will go until qcount is equal to tfquestions
		while(qcount < tfquestions){
			//currentQuestion will grab the current question from the correct_questions array
			currentQuestion = correct_questions.at(qcount);
			
			//tfflag is used to hold whether or not the answer should be true or false, 0 for false, 1 for true
			tfflag =  getRandomNumber(0, 1);
			
			//if there is only 1 term in the entire study set the answer will always be true
			if(termCount == 1){
				tfflag = 1;
			}
			
			//adds the "term: " label
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "Term: ";
			formforquiz.appendChild(questionLbl);
			
			//this block of code is what grabes the actual term and adds the appropriate values to it
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = document.getElementById("question"+correct_questions.at(qcount)).innerHTML;
			questionLbl.id = "TFT"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			//pushes the currentQuestion to the tf_question array for checking later
			tf_questions.push(currentQuestion);
			
			
			
			//adds "Definition: " label
			questionLbl = document.createElement("label");
			questionLbl.innerHTML = "Defintion: ";
			formforquiz.appendChild(questionLbl);
			questionLbl = document.createElement("label");
			
			/*
				this if else statement will check if the tfflag is 0
				if the tfflag is 0 it will grab a random question from the answer Array
				if the tfflag is 1 it will grab the correct answer f
			*/
			if(tfflag == 0){
				randomQuestion = getRandomNumber(0, rand_answers.length-1);
				while(rand_answers.at(randomQuestion) == currentQuestion){
					randomQuestion = getRandomNumber(0, rand_answers.length-1);
				}
				currentQuestion = rand_answers.at(randomQuestion);
				questionLbl.innerHTML = document.getElementById("answer"+rand_answers.at(randomQuestion)).innerHTML;
			}
			else{
				questionLbl.innerHTML = document.getElementById("answer"+correct_questions.at(qcount)).innerHTML;
			}
			
			//this will add the appropriate id and add the label to the quiz
			questionLbl.id = "TFD"+qcount;
			formforquiz.appendChild(questionLbl);
			formforquiz.appendChild(document.createElement("br"));
			
			//this for loop will generate the true and false labels
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
			
			//this if else statement will add the correct_response class to the true or false radio buttons depending on if its true or false
			if(document.getElementById("TFD"+qcount).innerHTML == document.getElementById("answer"+tf_questions.at(tfquestiontracker)).innerHTML){
				document.getElementById("TF"+qcount+"A"+0).classList.add("correct_response");
			}
			else{
				document.getElementById("TF"+qcount+"A"+1).classList.add("correct_response");
			}
			
			//adds line breaks for format purposes
			formforquiz.appendChild(document.createElement("br"));
			formforquiz.appendChild(document.createElement("br"));
			
			qcount++;
			tfquestiontracker++;
		}
	}
	//adds line breaks for format purposes
	formforquiz.appendChild(document.createElement("br"));
	formforquiz.appendChild(document.createElement("br"));
	
	//adds the submit button to the quiz
	quiz.appendChild(submitbtn);
}

//check answer with fuzzy input 
async function checkAnswer(userInput, correctAnswer) {
	console.log("user input: ", userInput, "\ncorrect answer: ", correctAnswer);

    try {
        const response = await fetch('/check-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput, correctAnswer }),
        });

        const result = await response.json();
        console.log(result.message); // Display the response message

		if(result.success == true)
		{
			return true;
		}
		else
		{
			return false;
		}
		

    } catch (error) {
        console.error("Error checking answer:", error);
    }
}




//this function checks the quiz answers
async function quizCheck() {
	//these console logs are for debugging purposes
    console.log("Checking quiz...");
    console.log("oe questions: ", oequestions);
    console.log("tf questions: ", tfquestions);
    console.log("mc questions: ", mcquestions);

    var termCount = getRowCount();			//termCount is used to hold the number of terms in a study set
    var total = totalQuestions;				//total is used to hold the total number of questions
    var correctAnswered = 0;				//correctAnswered is used to hold how many questions were answered correctly
    var questionIterator = 0;				//questionIterator is used to grab correct fill in the blank questions during the fill in the blank check
    var iterator = mcquestions;				//this iterator is used to grab the correct fill in the blank quesion during the fil in the blank check
    var score = 0;							//score is used to hold the users score on the quiz

	//if there are no terms in the study set it will skip the checking portion 
    if (termCount === 0) {
        enableSSaction();
        return; // Exit if no terms are found
    } 
	else {
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

        // Open-ended questions check
        if (oequestions > 0) {
            console.log("if oe questions");

            if (mcquestions === 0) {
                iterator = 0;
            }

            // Process questions sequentially using an async loop
            while (iterator !== oequestions) {
                console.log("got into the while loop");

                try {
                    const isCorrect = await checkAnswer(
                        document.getElementById("OE" + iterator + "A").value,
                        oe_questions[questionIterator].textContent
                    );
                    console.log("right after check function");
                    console.log(isCorrect);

                    if (isCorrect) {
                        correctAnswered++;
                        console.log(correctAnswered);
                    }

                    iterator++;
                    questionIterator++;
                } catch (error) {
                    console.error("Error during question processing:", error);
                }
            }
        }
    }
	//console log used for debug purposes
    console.log(correctAnswered);
	
	//makes the score correct by dividing the correctAnswered by the total and multiplying by 100
    score = (correctAnswered / total) * 100;
	
 	//score.toFixed(2) is just there to round the score to two decimal places
    score = score.toFixed(2);
	
	//will do an alert displaying the correct score of the user on this quiz
    alert(`Correct answers: ${score}%`);
	
	//calls the enableSSaction function
    enableSSaction();
}


function mconly(){
	mcquestions = 1;
	oequestions = 0;
	tfquestions = 0;
	
	generate_quiz();
	
}

function oeonly(){
	mcquestions = 0;
	oequestions = 1;
	tfquestions = 0;
	
	generate_quiz();

}

function tfonly(){
	mcquestions = 0;
	oequestions = 0;
	tfquestions = 1;
	
	generate_quiz();

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

//copy study set button
document.getElementById('copy-Btn').addEventListener('click', async () => {
    const studySetId = new URLSearchParams(window.location.search).get('id');
    const currentUser = 'currentUser'; // Replace this with the actual way you're retrieving the username

    if (!studySetId || !currentUser) {
        alert('Missing required data: studySetId or currentUser');
        return;
    }

    try {
        // Make the POST request to the server
        const response = await fetch('/copy-study-set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ set_id: studySetId })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Study set copied successfully! New set ID: ${data.newSetId}`);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error copying study set:', error);
        alert('An error occurred while copying the study set.');
    }
});




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

function toggleStatusSelection(filterClass) {
    const rows = document.querySelectorAll('#myTable tbody tr');
    rows.forEach((row) => {
        const checkbox = row.querySelector('.row-checkbox'); // Locate the checkbox in the row
        const statusBubble = row.querySelector('.status-bubble'); // Locate the bubble element

        // Ensure the bubble exists and matches the filter class
        if (statusBubble?.classList.contains(filterClass)) {
            checkbox.checked = true; // Select the checkbox
            console.log("Checkbox selected for row:", row);
        } else if (checkbox) {
            checkbox.checked = false; // Deselect the checkbox
            console.log("Checkbox deselected for row:", row);
        }

		updateRowSelection(row, checkbox.checked);
    });
}


document.getElementById('selectKnownButton').addEventListener('click', () => toggleStatusSelection('known'));
document.getElementById('selectUnknownButton').addEventListener('click', () => toggleStatusSelection('unknown'));





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
		
		
		//learning status
		
		if(currentUser != null){
			addLearningStatusCell(row, termId, currentUser);
			console.log("Row after adding learning status:", row);
		}
		


    }


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


