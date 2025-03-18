// Function to get query parameter value by name
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetch and display search results
function fetchSearchResults(query) {
    console.log('Fetching search results for query:', query);  // Print the search query

    fetch('/study-sets/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ set_name: query })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Fetch response data:', data);  // Print the response data
        if (Array.isArray(data)) {
            displaySearchResults(data);
        } else {
            console.error('Error: Fetch response is not an array:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching search results:', error);
    });
}

// Display search results
function displaySearchResults(results) {
    const searchResultDiv = document.getElementById('searchResult');
    searchResultDiv.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResultDiv.textContent = 'No results found.';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <h3>${result.set_name}</h3>
            <p>Created by: ${result.username}</p>
            <p>Created at: ${new Date(result.created_at).toLocaleString()}</p>
        `;
        // Add onclick event to update visit history and redirect
        resultItem.style.cursor = 'pointer';
        resultItem.onclick = () => {
            // Send request to update visit history
            fetch('/update-visit-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ set_id: result.set_id })
            }).then(() => {
                window.location.href = `studySetTemplate.html?id=${result.set_id}`;
            }).catch(error => {
                console.error('Error updating visit history:', error);
            });
        };

        searchResultDiv.appendChild(resultItem);
    });
}

// Use the function to retrieve the 'search' query parameter and fetch search results
document.addEventListener("DOMContentLoaded", function() {
    const searchQuery = getQueryParameter('search');
    const exploreSearchbar = document.getElementById("exploreSearchbar");

    if (searchQuery) {
        exploreSearchbar.value = decodeURIComponent(searchQuery);
        fetchSearchResults(searchQuery);
    }

    exploreSearchbar.addEventListener("keypress", function(event) {
        if(event.keyCode == 13){
            var query = exploreSearchbar.value.trim();
            if(query){
                fetchSearchResults(query);
            }
        }
    });
});

//handle the category selector 
document.addEventListener('DOMContentLoaded', () => {
    const popupOverlay = document.getElementById('popupOverlay');
    const openPopupBtn = document.getElementById('openPopupBtn');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

    // Open the popup
    openPopupBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'flex';
    });

    // Close the popup
    closePopupBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });

    // Select All Categories
    selectAllBtn.addEventListener('click', () => {
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    });

    // Deselect All Categories
    deselectAllBtn.addEventListener('click', () => {
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    // Apply Filters (optional: log selected categories)
    applyFiltersBtn.addEventListener('click', () => {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        console.log('Selected Categories:', selectedCategories);

        // Optionally pass these categories to your search function
        // fetchSearchResultsWithCategories(selectedCategories);

        popupOverlay.style.display = 'none'; // Close popup after applying
    });
});
