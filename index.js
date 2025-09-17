//https://www.omdbapi.com/?i=tt3896198&apikey=4882512

const movieResultEl = document.querySelector('.search-results')

async function searchMovies(searchCriteria) {
    const search = await fetch(`https://www.omdbapi.com/?s=${searchCriteria}&apikey=4882512`);
    const searchResult = await search.json();
    console.log(searchResult);
    if (searchResult.Search) {
      movieResultEl.innerHTML = searchResult.Search.map(movie => searchResultHTML(movie)).join('');
    } else {
      movieResultEl.innerHTML = '<div>No results found.</div>';
    }
}

function searchResultHTML(movie) {
    return `
    <div class="movie">
        <img class="movie-poster"
            src="${movie.Poster}"
        />
        <div class="movie-details">
            <div class="movie-title"><b>${movie.Title}</b></div>
            <div class="year">${movie.Year}</div>
            <a class="imdb" href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank">IMDB Link</a>
            <i class="fa-brands fa-imdb imdb"></i>
        </div>
    </div>
    `;
}


// Add event listener for the search form
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
if (searchForm && searchInput) {
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    }
  });
}

// Optionally, run a default search on page load
searchMovies('dark');