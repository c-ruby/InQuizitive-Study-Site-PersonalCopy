document.addEventListener('DOMContentLoaded', fetchRecentStudySets);

function fetchRecentStudySets() {
    console.log("Yeah the history function is going ")
    fetch('/recent-study-sets')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        const studySetsList = document.getElementById('visitHistory');
        if (!studySetsList) {
            console.error('Element with ID "visitHistory" not found');
            return;
        }
        
        studySetsList.innerHTML = '';
        
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return;
        }
        
        data.forEach(set => {
            const listItem = document.createElement('li');
            
            // Create a span to hold the study set name
            const setNameSpan = document.createElement('span');
            setNameSpan.textContent = set.set_name;
            setNameSpan.style.cursor = 'pointer';
            setNameSpan.onclick = () => {
                window.location.href = `studySetTemplate.html?id=${set.set_id}`;
            };

            // Append the span and button to the list item
            listItem.appendChild(setNameSpan);

            studySetsList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error fetching study sets:', error);
    });
}
