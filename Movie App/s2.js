const apiKey = 'b2ac2294c3062792beb7c950db9f5470';
const moviesGrid = document.getElementById('movies-grid');
const suggestions = document.getElementById('suggestions');
const movieModal = document.getElementById('movie-modal');
const movieDetails = document.getElementById('movie-details');
let allMovies = []; 
const moviesPerPage = 10;
currentPage = 1; 


function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

async function searchMovies() {
    showLoading();
    const query = document.getElementById('search-input').value.trim();
    if (query === '') {
        suggestions.style.display = 'none';
        hideLoading();
        return;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&include_adult=false&page=${currentPage}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySuggestions(data.results);
        displayMovies(data.results);
        setupPagination(data.total_pages);
    } catch (error) {
        console.error('Error fetching movies:', error);
    } finally {
        hideLoading();
    }
}

function setupPagination(totalPages) {
    document.getElementById('prev-page').style.display = currentPage > 1 ? 'inline-block' : 'none';
    document.getElementById('next-page').style.display = currentPage < totalPages ? 'inline-block' : 'none';

    document.getElementById('prev-page').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            searchMovies();
        }
    };

    document.getElementById('next-page').onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            searchMovies();
        }
    };
}


function displaySuggestions(movies) {
    suggestions.innerHTML = '';
    suggestions.style.display = movies.length ? 'block' : 'none';
    movies.forEach(movie => {
        const suggestion = document.createElement('div');
        suggestion.textContent = movie.title;
        suggestion.onclick = () => {
            document.getElementById('search-input').value = movie.title;
            suggestions.style.display = 'none';
            displayMovies([movie]); 
        };
        suggestions.appendChild(suggestion);
    });
}

function sortMovies(criterion) {
    if (allMovies.length) {
        allMovies.sort((a, b) => {
            const valueA = a[criterion] || 0;
            const valueB = b[criterion] || 0;
            return valueB - valueA;
        });
        displayMovies(allMovies);
    }
}

async function showMovieDetails(movieId) {
    showLoading();
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,reviews`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        movieDetails.innerHTML = `
            <h2>${data.title || 'No title available'}</h2>
            ${data.poster_path ? `<img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">` : ''}
            <p>${data.overview || 'No overview available.'}</p>
            <p><strong>Rating:</strong> ${data.vote_average || 'N/A'}</p>
            <p><strong>Runtime:</strong> ${data.runtime ? data.runtime + ' minutes' : 'N/A'}</p>
            <h3>Cast:</h3>
            <ul>${data.credits.cast.slice(0, 5).map(actor => `<li>${actor.name} as ${actor.character}</li>`).join('')}</ul>
        `;
        movieModal.classList.add('show');
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails.innerHTML = `<p>Failed to load movie details.</p>`;
    } finally {
        hideLoading();
    }
}

async function filterByGenre(genreId) {
    showLoading();
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${currentPage}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
        setupPagination(data.total_pages);
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
    } finally {
        hideLoading();
    }
}
function displayMovies(movies) {
    allMovies = movies;
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
            <button onclick="showMovieDetails(${movie.id})">View Details</button>
            <button onclick="addToWatchlist(${movie.id})">Add to Watchlist</button>
        `;
        moviesGrid.appendChild(movieCard);
    });
}
function addToWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const movie = allMovies.find(item => item.id === movieId);

    if (movie && !watchlist.some(item => item.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        updateWatchlistDisplay();
        alert('Movie added to watchlist!');
    } else {
        alert('Movie is already in your watchlist!');
    }
}

function updateWatchlistDisplay() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const watchlistContainer = document.getElementById('watchlist-container');
    watchlistContainer.innerHTML = '';

    watchlist.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'watchlist-item';
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
            <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
        `;
        watchlistContainer.appendChild(movieCard);
    });
}

function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(item => item.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistDisplay();
}

window.onload = function() {
    updateWatchlistDisplay();
};

function closeModal() {
    movieModal.classList.remove('show');
}


window.onclick = function(event) {
    if (event.target === movieModal) {
        closeModal();
    }
};
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
