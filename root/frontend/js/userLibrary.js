document.addEventListener('DOMContentLoaded', function() {



    // Function to fetch and display user's study sets
    function fetchStudySets() {
        fetch('/study-sets')
        .then(response => response.json())
        .then(data => {
            const studySetsList = document.getElementById('studySets');
            studySetsList.innerHTML = '';
    
            data.forEach(set => {
                const listItem = document.createElement('li');
                listItem.style.display = 'flex';
                listItem.style.justifyContent = 'space-between';
                listItem.style.alignItems = 'center';
            
                // Create a span for the study set name
                const setNameSpan = document.createElement('span');
                setNameSpan.textContent = set.set_name;
                setNameSpan.style.cursor = 'pointer';
            
                // Ensure the link works again
                setNameSpan.onclick = () => {
                    if (!setNameSpan.isContentEditable) { // Only navigate if NOT editing
                        fetch('/update-visit-history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ set_id: set.set_id })
                        }).then(() => {
                            window.location.href = `studySetTemplate.html?id=${set.set_id}`;
                        }).catch(error => {
                            console.error('Error updating visit history:', error);
                        });
                    }
                };
            
                // Create a container for the buttons
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'flex-end';
                buttonContainer.style.gap = '10px';
            
                // Create an Edit button
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.classList.add('edit-button');
                editBtn.onclick = () => makeSetEditable(listItem, setNameSpan, editBtn, set.set_id);
            
                // Create a Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('deleteBtn');
                deleteBtn.onclick = () => {
                    if (confirm(`Are you sure you want to delete the study set: ${set.set_name}?`)) {
                        deleteStudySet(set.set_id);
                    }
                };
            
                // Append buttons to the container
                buttonContainer.appendChild(editBtn);
                buttonContainer.appendChild(deleteBtn);
            
                // Append elements to the list item
                listItem.appendChild(setNameSpan);
                listItem.appendChild(buttonContainer);
                studySetsList.appendChild(listItem);
            });
            
            
    
        })
        .catch(error => {
            console.error('Error fetching study sets:', error);
        });
    }

//edit name helper functions 
function makeSetEditable(row, setNameSpan, editBtn, setId) {
    setNameSpan.contentEditable = "true";
    setNameSpan.focus();

    // Add editing class
    setNameSpan.classList.add("editing-mode");

    // Prevent Enter key from adding a new line; instead, trigger save
    setNameSpan.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Stop new line creation
            saveSetEdits(row, setNameSpan, setId); // Save changes instead
        }
    });

    // Change button to "Save"
    editBtn.textContent = 'Save';
    editBtn.classList.add('save-button');
    editBtn.classList.remove('edit-button');

    editBtn.onclick = () => saveSetEdits(row, setNameSpan, setId);
}



function saveSetEdits(row, setNameSpan, setId) {
    const updatedName = setNameSpan.textContent.trim();

    if (!updatedName) {
        alert("Set name cannot be empty!");
        setNameSpan.focus();
        return;
    }

    fetch(`/study-sets/${setId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ set_name: updatedName })
    })
    .then(response => response.json())
    .then(() => {
        alert('Study set updated successfully');

        // Disable editing after saving
        setNameSpan.contentEditable = "false";
        setNameSpan.classList.remove("editing-mode");

        // Clear text selection
        window.getSelection().removeAllRanges();

        // Restore click behavior after editing
        row.onclick = () => {
            window.location.href = `studySetTemplate.html?id=${setId}`;
        };

        // Revert Save button to Edit
        const saveBtn = row.querySelector('.save-button');
        if (!saveBtn) {
            console.error('Error: Save button not found');
            return;
        }

        saveBtn.textContent = 'Edit';
        saveBtn.classList.add('edit-button');
        saveBtn.classList.remove('save-button');
        saveBtn.onclick = () => makeSetEditable(row, setNameSpan, saveBtn, setId);
    })
    .catch(error => {
        console.error('Error updating study set:', error);
    });
}







    

    // Function to delete a study set
    function deleteStudySet(set_id) {
        fetch(`/study-sets/${set_id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Study set deleted successfully');
                fetchStudySets(); // Refresh the list after deletion
            } else {
                response.json().then(data => {
                    alert(`Error: ${data.error}`);
                });
            }
        })
        .catch(error => {
            console.error('Error deleting study set:', error);
        });
    }



    // Fetch and display study sets on page load
    fetchStudySets();


    // Function to handle new study set creation
    const createStudySetForm = document.getElementById('createStudySetForm');
    createStudySetForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const setTitle = document.getElementById('setTitle').value;
        const category = document.getElementById('category').value;

        // Validate category selection
        if (!category) {
            alert('Please select a category.');
            return;
        }

        // Send setTitle and category to the server
        fetch('/study-sets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ set_name: setTitle, category })
        })
        .then(response => response.json())
        .then(data => {
            alert('Study set created successfully');
            fetchStudySets(); // Refresh the list of study sets
        })
        .catch(error => {
            console.error('Error creating study set:', error);
        });
    });
});