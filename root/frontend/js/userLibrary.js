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
                listItem.textContent = set.set_name;
                listItem.onclick = () => {
                    window.location.href = `studySetTemplate.html?id=${set.set_id}`;
                };
                studySetsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching study sets:', error);
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