//https://www.omdbapi.com/?i=tt3896198&apikey=4882512

let userPageNumber = 1;
let userSearchTerm = '';
const containerHeight = document.querySelector('.container');
const resultsContainer = document.querySelector('.search-results');
const paginationShow = document.querySelector('.pagination');
const pageSelectDropdown = document.querySelector('.page-num');
const prevButton = document.querySelector('.prev-page');
const nextButton = document.querySelector('.next-page');
const loadingSpinner = document.querySelector('.spinner-container');

async function searchMovies(searchTerm, pageNumber = 1) {
  resultsContainer.style.display = 'none' 
  paginationShow.style.display = 'none'
  userSearchTerm = searchTerm;
  userPageNumber = pageNumber;
  // Show spinner
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  try {
    // Calculate which OMDb API pages to fetch. Hard mode math!
    const startIndex = (pageNumber - 1) * 6;
    const apiPage1 = Math.floor(startIndex / 10) + 1;
    const apiPage2 = Math.floor((startIndex + 5) / 10) + 1;
    // Fetch both pages if needed
    const apiPage1Promise = fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=4882512&page=${apiPage1}`).then(r => r.json());
    let apiPage2Promise = null;
    if (apiPage2 !== apiPage1) {
      apiPage2Promise = fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=4882512&page=${apiPage2}`).then(r => r.json());
    }
    const [result1, result2] = await Promise.all([apiPage1Promise, apiPage2Promise]);
    let allResults = [];
    if (result1 && result1.Search) allResults = allResults.concat(result1.Search);
    if (result2 && result2.Search) allResults = allResults.concat(result2.Search);
    // Slice the correct 6 results.
    const start = startIndex % 10;
    const moviesToShow = allResults.slice(start, start + 6);
    if (moviesToShow.length > 0) {
      resultsContainer.innerHTML = moviesToShow.map(movie => searchResultHTML(movie)).join('');
      // Trigger fade-in animation for each .movie after DOM update
      const movieEls = resultsContainer.querySelectorAll('.movie');
      movieEls.forEach(el => {
        el.classList.remove('fade-in'); // reset if needed
        // Force reflow to restart animation
        void el.offsetWidth;
        el.classList.add('fade-in');
    paginationShow.style.display = 'block';
    paginationShow.style.animation = 'fade-in 2s ease';
      });
    } else {
      resultsContainer.innerHTML = '<div>No results found.</div>';
    paginationShow.style.display = 'none';

    }
    // Calculate total custom pages and populate dropdown. 
    let totalResults = 0;
    if (result1 && result1.totalResults) {
      totalResults = Math.min(Number(result1.totalResults), 1000);
    }
    const totalCustomPages = Math.ceil(totalResults / 6);
    if (pageSelectDropdown) {
      pageSelectDropdown.innerHTML = '';
      for (let i = 1; i <= totalCustomPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === pageNumber) option.selected = true;
        pageSelectDropdown.appendChild(option);
      }
    }
    if (prevButton) prevButton.disabled = pageNumber <= 1;
    if (nextButton) nextButton.disabled = pageNumber >= totalCustomPages;
  } finally {
    // Hide spinner
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    resultsContainer.style.display = 'flex';
  }
}

function searchResultHTML(movie) {
    return `
    <div class="movie">
      <img class="movie-poster" src="${movie.Poster}"/>
      <div class="movie-details">
          <div class="movie-title"><b>${movie.Title}</b></div>
          <div class="year">${movie.Year}</div>
          <a class="imdb" href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank">
            <img class="imdb-logo" src="./assets/imdb-logo.png">
          </a>
      </div>
    </div>
    `;
}

const searchFormElement = document.querySelector('.search-form');
const searchInputElement = document.querySelector('.search-input');
if (searchFormElement && searchInputElement) {
  searchFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInputElement.value.trim();
    if (query) {
      searchMovies(query, 1);
    }
  });
}

if (prevButton) {
  prevButton.addEventListener('click', function() {
    if (userPageNumber > 1) {
      searchMovies(userSearchTerm, userPageNumber - 1);
    }
  });
}

if (nextButton) {
  nextButton.addEventListener('click', function() {
    searchMovies(userSearchTerm, userPageNumber + 1);
  });
}

if (pageSelectDropdown) {
  pageSelectDropdown.addEventListener('change', function() {
    searchMovies(userSearchTerm, Number(pageSelectDropdown.value));
  });
}
