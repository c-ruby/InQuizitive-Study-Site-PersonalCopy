// Function to get query parameter value by name
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetch and display search results
function fetchSearchResults(query, categories = []) {
    console.log('Fetching search results for query:', query, 'with categories:', categories); // Debugging log

    // Ensure that categories are sent as an array
    fetch('/study-sets/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ set_name: query, categories }) // Send both query and categories
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received search results:', data); // Debugging log
        if (Array.isArray(data)) {
            displaySearchResults(data); // Use your existing function to display the results
        } else {
            console.error('Unexpected response format:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching search results:', error); // Handle network or backend errors
    });
    console.log('Sending data to backend:', {
        set_name: query,
        categories: categories,
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
            <p>Category: ${result.category}</p>
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
    const searchbar = document.getElementById("exploreSearchbar"); // The search bar on the explore page
    const searchQuery = getQueryParameter('search'); // Extract 'search' query parameter

    if (searchQuery) {
        searchbar.value = decodeURIComponent(searchQuery); // Prefill the search bar with the query
        fetchSearchResults(searchQuery, getAllCategories()); // Fetch results with the query
    }

    // Add an event listener for the Enter key
    searchbar.addEventListener("keypress", function(event) {
        if (event.keyCode === 13) {
            const query = searchbar.value.trim();
            if (query) {
                fetchSearchResults(query, getSelectedCategories());
            }
        }
    });
});

// Helper function to get query parameters
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Helper function to get all categories (if all are selected by default)
function getAllCategories() {
    return Array.from(document.querySelectorAll('.category-checkbox')).map(checkbox => checkbox.value);
}

// Helper function to get selected categories
function getSelectedCategories() {
    return Array.from(document.querySelectorAll('.category-checkbox:checked')).map(checkbox => checkbox.value);
}


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
