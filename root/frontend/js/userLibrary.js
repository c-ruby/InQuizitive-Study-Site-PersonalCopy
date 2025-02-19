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
                
                // Create a span to hold the study set name
                const setNameSpan = document.createElement('span');
                setNameSpan.textContent = set.set_name;
                setNameSpan.style.cursor = 'pointer';
                setNameSpan.onclick = () => {
                    window.location.href = `studySetTemplate.html?id=${set.set_id}`;
                };

                // Create a delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('deleteBtn'); // Use a class instead of an ID
                deleteBtn.style.marginLeft = '10px'; // Add some space between the name and the button
                deleteBtn.onclick = () => {
                    if (confirm(`Are you sure you want to delete the study set: ${set.set_name}?`)) {
                        deleteStudySet(set.set_id);
                    }
                };

                // Append the span and button to the list item
                listItem.appendChild(setNameSpan);
                listItem.appendChild(deleteBtn);
                studySetsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching study sets:', error);
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
        fetch('/study-sets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ set_name: setTitle })
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