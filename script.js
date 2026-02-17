const API_KEY = "642fea44679404601e516c9c287d0a0a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let page = 1;
let isLoading = false;
let currentQuery = "";
let loadedMovieIds = new Set();
let exploreMode = false;
let selectedMood = null;

/* MOOD → GENRE MAP */
const moodMap = {
  happy: 35,        // Comedy
  romantic: 10749,  // Romance
  intense: 28,      // Action
  chill: 18         // Drama
};

/* MOOD BUTTON LOGIC */
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = btn.dataset.mood;
  });
});

/* INITIAL SUGGESTIONS */
function getMovies() {
  const industry = document.getElementById("industry").value;
  const genreDropdown = document.getElementById("genre").value;
  const moviesDiv = document.getElementById("movies");

  if (!industry) {
    alert("Please select movie type");
    return;
  }

  const reasonEl = document.getElementById("recommendationReason");

let reasonText = "🎬 Suggested";

if (selectedMood && industry) {
  reasonText += ` because you're feeling ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} in ${industry.charAt(0).toUpperCase() + industry.slice(1)}.`;
} else if (selectedMood) {
  reasonText += ` based on your mood: ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}.`;
} else if (genreDropdown) {
  reasonText += ` based on your selected genre.`;
}

reasonEl.textContent = reasonText;
reasonEl.classList.remove("hidden");

  page = 1;
  exploreMode = false;
  loadedMovieIds.clear();
  moviesDiv.innerHTML = "";
  document.getElementById("exploreMore").classList.add("hidden");

  let language = "en";
  let region = "US";

  if (industry === "bollywood") {
    language = "hi";
    region = "IN";
  } else if (industry === "south") {
    language = "te";
    region = "IN";
  } else if (industry === "bengali") {
    language = "bn";
    region = "IN";
  }

  currentQuery =
    `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
    `&with_original_language=${language}` +
    `&region=${region}` +
    `&sort_by=popularity.desc`;

  /* Mood overrides genre */
  let finalGenre = null;

  if (selectedMood) {
    finalGenre = moodMap[selectedMood];
  } else if (genreDropdown) {
    finalGenre = genreDropdown;
  }

  if (finalGenre) {
    currentQuery += `&with_genres=${finalGenre}`;
  }

  /* Fetch first page (curated suggestions) */
  fetch(`${currentQuery}&page=1`)
    .then(res => res.json())
    .then(data => {
      data.results.slice(0, 8).forEach(movie => {
        renderMovie(movie);
      });

      document.getElementById("exploreMore").classList.remove("hidden");
    });
}

/* EXPLORE MODE ACTIVATION */
document.getElementById("exploreMore").onclick = () => {
  exploreMode = true;
  page = 2;
};

/* INFINITE SCROLL (ONLY AFTER EXPLORE MODE) */
window.addEventListener("scroll", () => {
  if (!exploreMode || isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadMoreMovies();
  }
});

/* LOAD MORE MOVIES */
function loadMoreMovies() {
  isLoading = true;

  fetch(`${currentQuery}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      data.results.forEach(movie => {
        renderMovie(movie);
      });
      page++;
      isLoading = false;
    })
    .catch(() => {
      isLoading = false;
    });
}

/* RENDER MOVIE CARD */
function renderMovie(movie) {
  if (!movie.poster_path) return;
  if (loadedMovieIds.has(movie.id)) return;

  loadedMovieIds.add(movie.id);

  const card = document.createElement("div");
  card.className = "movie";
  card.onclick = () => openModal(movie.id);

  card.innerHTML = `
    <img src="${IMG_URL + movie.poster_path}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <span>⭐ ${movie.vote_average.toFixed(1)}</span>
    </div>
  `;

  document.getElementById("movies").appendChild(card);
}

/* MODAL */
function openModal(id) {
  fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(movie => {
      document.getElementById("modalBody").innerHTML = `
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p><strong>Release:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
      `;
      document.getElementById("modal").classList.remove("hidden");
    });
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
