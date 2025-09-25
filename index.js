//https://www.omdbapi.com/?i=tt3896198&apikey=4882512

// Store last full results for sorting/pagination
let lastFullResults = [];
let lastSearchTerm = '';
let lastTotalResults = 0;

document.addEventListener('DOMContentLoaded', function() {
  const sortDropdown = document.querySelector('.sort-dropdown');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      renderSortedPage(1);
      userPageNumber = 1;
    });
  }
});

function renderSortedPage(pageNumber = 1) {
  const sortDropdown = document.querySelector('.sort-dropdown');
  const sortType = sortDropdown ? sortDropdown.value : 'default';
  let sorted = [...lastFullResults];
  if (sortType !== 'default') {
    sorted.sort((a, b) => getSortValue(b, sortType) - getSortValue(a, sortType));
  }
  // Paginate
  const perPage = 6;
  const start = (pageNumber - 1) * perPage;
  const moviesToShow = sorted.slice(start, start + perPage);
  if (moviesToShow.length > 0) {
    resultsContainer.innerHTML = moviesToShow.map(movie => searchResultHTML(movie)).join('');
    // Fade-in animation
    const movieEls = resultsContainer.querySelectorAll('.movie');
    movieEls.forEach(el => {
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    });
    paginationShow.style.display = 'block';
    sortViewer.style.display = 'block'
  } else {
    resultsContainer.innerHTML = '<div class="no-results">No results found. 😢</div>';
    paginationShow.style.display = 'none';
    sortViewer.style.display = 'none';
  }
  // Update pagination dropdown
  const totalCustomPages = Math.ceil(lastTotalResults / perPage);
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
}


let userPageNumber = 1;
let userSearchTerm = '';
const containerHeight = document.querySelector('.container');
const resultsContainer = document.querySelector('.search-results');
const paginationShow = document.querySelector('.pagination');
const pageSelectDropdown = document.querySelector('.page-num');
const prevButton = document.querySelector('.prev-page');
const nextButton = document.querySelector('.next-page');
const loadingSpinner = document.querySelector('.spinner-container');
const sortViewer = document.querySelector('.sort-dropdown');
const welcomeMessage = document.querySelector('.welcome-message')
const bouncingArrow = document.querySelector('.bouncing-arrow')


async function searchMovies(searchTerm, pageNumber = 1) {
  resultsContainer.style.display = 'none';
  paginationShow.style.display = 'none';
  sortViewer.style.display = 'none';
  bouncingArrow.style.display = 'none'
  welcomeMessage.style.display = 'none'

  userSearchTerm = searchTerm;
  userPageNumber = pageNumber;
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  try {
    // Fetch up to 50 results (5 pages)
    let allResults = [];
    let totalResults = 0;
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=4882512&page=${page}`).then(r => r.json());
      if (res && res.Search) allResults = allResults.concat(res.Search);
      if (res && res.totalResults) totalResults = Math.min(Number(res.totalResults), 50);
      if (!res.Search || allResults.length >= 50) break;
    }
    // Fetch full details for each movie (to get ratings)
    const detailedResults = await Promise.all(
      allResults.map(async (movie) => {
        const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=4882512`).then(r => r.json());
        return res;
      })
    );
    lastFullResults = detailedResults;
    lastSearchTerm = searchTerm;
    lastTotalResults = detailedResults.length;
    renderSortedPage(pageNumber);
  } finally {
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
      renderSortedPage(userPageNumber - 1);
      userPageNumber--;
    }
  });
}

if (nextButton) {
  nextButton.addEventListener('click', function() {
    renderSortedPage(userPageNumber + 1);
    userPageNumber++;
  });
}

if (pageSelectDropdown) {
  pageSelectDropdown.addEventListener('change', function() {
    renderSortedPage(Number(pageSelectDropdown.value));
    userPageNumber = Number(pageSelectDropdown.value);
  });
}

// Sort dropdown event
function getRTRating(movie) {
  const rt = movie.Ratings?.find(r => r.Source === "Rotten Tomatoes");
  if (!rt || !rt.Value) return 0;
  const match = rt.Value.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
}
function getMCRating(movie) {
  const mc = movie.Ratings?.find(r => r.Source === "Metacritic");
  if (!mc || !mc.Value) return 0;
  const match = mc.Value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
function getSortValue(movie, sortType) {
  if (sortType === 'imdb') return parseFloat(movie.imdbRating) || 0;
  if (sortType === 'rt') return getRTRating(movie);
  if (sortType === 'mc') return getMCRating(movie);
  return 0;
}


