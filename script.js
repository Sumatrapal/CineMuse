const API_KEY = "642fea44679404601e516c9c287d0a0a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
let page = 1;
let isLoading = false;
let currentQuery = "";
let loadedMovieIds = new Set();
let exploreMode = false;
let selectedMood = null;


/* =================================
   MOOD → GENRE
================================= */

const moodMap = {

  happy: 35,

  romantic: 10749,

  intense: 28,

  chill: 18

};


/* =================================
   MOOD → ATMOSPHERE
================================= */

const moodAtmosphere = {

  happy: {
    primary: "232, 201, 139",
    secondary: "244, 180, 80"
  },

  romantic: {
    primary: "220, 130, 160",
    secondary: "160, 110, 190"
  },

  intense: {
    primary: "205, 75, 70",
    secondary: "140, 35, 45"
  },

  chill: {
    primary: "120, 150, 205",
    secondary: "100, 110, 180"
  }

};


/* =================================
   APPLY MOOD ATMOSPHERE
================================= */

function applyMoodAtmosphere(mood) {

  const atmosphere =
    moodAtmosphere[mood];


  if (!atmosphere) return;


  document.body.style.setProperty(
    "--mood-primary",
    atmosphere.primary
  );


  document.body.style.setProperty(
    "--mood-secondary",
    atmosphere.secondary
  );


  document.body.style.setProperty(
    "--mood-opacity",
    "0.12"
  );

}


/* =================================
   MOOD BUTTONS
================================= */

document
  .querySelectorAll(".mood-btn")
  .forEach(btn => {

    btn.addEventListener("click", () => {

      document
        .querySelectorAll(".mood-btn")
        .forEach(b =>
          b.classList.remove("active")
        );


      btn.classList.add("active");


      selectedMood =
        btn.dataset.mood;


      /* NEW:
         Change CineMuse atmosphere
      */

      applyMoodAtmosphere(
        selectedMood
      );

    });

  });


/* =================================
   BUILD QUERY
================================= */

function buildQuery() {

  const industry =
    document
      .getElementById("industry")
      .value;


  const genreDropdown =
    document
      .getElementById("genre")
      .value;


  let language = "en";

  let region = "US";


  if (industry === "bollywood") {

    language = "hi";

    region = "IN";

  }

  else if (industry === "south") {

    language = "te";

    region = "IN";

  }

  else if (industry === "bengali") {

    language = "bn";

    region = "IN";

  }


  let query =
    `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
    `&with_original_language=${language}` +
    `&region=${region}` +
    `&sort_by=popularity.desc`;


  let finalGenre = null;


  if (selectedMood) {

    finalGenre =
      moodMap[selectedMood];

  }

  else if (genreDropdown) {

    finalGenre =
      genreDropdown;

  }


  if (finalGenre) {

    query +=
      `&with_genres=${finalGenre}`;

  }


  return query;

}


/* =================================
   GET MOVIES
================================= */

function getMovies() {

  const industry =
    document
      .getElementById("industry")
      .value;


  const genreDropdown =
    document
      .getElementById("genre")
      .value;


  const moviesDiv =
    document
      .getElementById("movies");


  if (!industry) {

    alert("Please select movie type");

    return;

  }


  page = 1;

  exploreMode = false;

  loadedMovieIds.clear();

  moviesDiv.innerHTML = "";


  document
    .getElementById("exploreMore")
    .classList.add("hidden");


  currentQuery =
    buildQuery();


  /* =================================
     REASON
  ================================= */

  const reasonEl =
    document
      .getElementById(
        "recommendationReason"
      );


  let reasonText =
    "🎬 Suggested";


  if (
    selectedMood &&
    industry
  ) {

    reasonText +=
      ` because you're feeling ${
        selectedMood
          .charAt(0)
          .toUpperCase()
        + selectedMood.slice(1)
      } in ${
        industry
          .charAt(0)
          .toUpperCase()
        + industry.slice(1)
      }.`;

  }

  else if (selectedMood) {

    reasonText +=
      ` based on your mood: ${
        selectedMood
          .charAt(0)
          .toUpperCase()
        + selectedMood.slice(1)
      }.`;

  }

  else if (genreDropdown) {

    reasonText +=
      ` based on your selected genre.`;

  }


  reasonEl.textContent =
    reasonText;


  reasonEl.classList.remove(
    "hidden"
  );


  /* =================================
     FETCH
  ================================= */

  fetch(
    `${currentQuery}&page=1`
  )

    .then(res => res.json())

    .then(data => {

      if (
        !data.results ||
        data.results.length === 0
      ) {

        moviesDiv.innerHTML = `
          <p style="
            grid-column: 1 / -1;
            text-align: center;
            color: #888;
            padding: 50px;
          ">
            No movies found for this combination.
          </p>
        `;

        return;

      }


      data.results
        .slice(0, 8)
        .forEach(movie => {

          renderMovie(movie);

        });


      document
        .getElementById("exploreMore")
        .classList.remove("hidden");

    })

    .catch(error => {

      console.error(error);

      alert(
        "Something went wrong while fetching movies."
      );

    });

}


/* =================================
   EXPLORE MODE
================================= */

document
  .getElementById("exploreMore")
  .onclick = () => {

    exploreMode = true;

    page = 2;

    loadMoreMovies();

  };


/* =================================
   INFINITE SCROLL
================================= */

window.addEventListener(
  "scroll",
  () => {

    if (
      !exploreMode ||
      isLoading
    ) return;


    if (
      window.innerHeight +
      window.scrollY >=
      document.body.offsetHeight - 300
    ) {

      loadMoreMovies();

    }

  }
);


/* =================================
   LOAD MORE
================================= */

function loadMoreMovies() {

  isLoading = true;


  fetch(
    `${currentQuery}&page=${page}`
  )

    .then(res => res.json())

    .then(data => {

      if (!data.results) {

        isLoading = false;

        return;

      }


      data.results.forEach(movie => {

        renderMovie(movie);

      });


      page++;

      isLoading = false;

    })

    .catch(error => {

      console.error(error);

      isLoading = false;

    });

}


/* =================================
   RENDER MOVIE
================================= */

function renderMovie(movie) {

  if (!movie.poster_path) return;

  if (
    loadedMovieIds.has(movie.id)
  ) return;


  loadedMovieIds.add(movie.id);


  const card =
    document.createElement("div");


  card.className = "movie";


  card.onclick = () =>
    openModal(movie.id);


  const rating =
    movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "N/A";


  card.innerHTML = `

    <img
      src="${IMG_URL + movie.poster_path}"
      alt="${movie.title}"
      loading="lazy"
    >

    <div class="movie-info">

      <h3>${movie.title}</h3>

      <span>
        ⭐ ${rating}
      </span>

    </div>

  `;


  document
    .getElementById("movies")
    .appendChild(card);

}


/* =================================
   SURPRISE ME
================================= */

function surpriseMe() {

  const query =
    buildQuery();


  const modal =
    document.getElementById(
      "surpriseModal"
    );


  const body =
    document.getElementById(
      "surpriseBody"
    );


  body.innerHTML = `

    <div style="
      text-align:center;
      padding:40px 0;
      color:#888;
    ">
      🎞️ Finding your movie...
    </div>

  `;


  modal.classList.remove(
    "hidden"
  );


  fetch(
    `${query}&page=${Math.floor(
      Math.random() * 3
    ) + 1}`
  )

    .then(res => res.json())

    .then(data => {

      if (
        !data.results ||
        data.results.length === 0
      ) {

        body.innerHTML = `
          <p style="color:#aaa;">
            CineMuse couldn't find a movie right now.
          </p>
        `;

        return;

      }


      const validMovies =
        data.results.filter(
          movie =>
            movie.poster_path
        );


      if (
        validMovies.length === 0
      ) {

        body.innerHTML = `
          <p style="color:#aaa;">
            No suitable movie found.
          </p>
        `;

        return;

      }


      const movie =
        validMovies[
          Math.floor(
            Math.random() *
            validMovies.length
          )
        ];


      const rating =
        movie.vote_average
          ? movie.vote_average.toFixed(1)
          : "N/A";


      let reason =
        "CineMuse picked this one for you.";


      if (selectedMood) {

        reason =
          `You were feeling ${
            selectedMood
              .charAt(0)
              .toUpperCase()
            + selectedMood.slice(1)
          }, so CineMuse found something that fits the vibe.`;

      }


      body.innerHTML = `

        <div class="surprise-movie">

          <img
            src="${IMG_URL + movie.poster_path}"
            alt="${movie.title}"
          >

          <div class="surprise-info">

            <h2>
              ${movie.title}
            </h2>

            <div class="surprise-rating">
              ⭐ ${rating}
            </div>

            <p class="surprise-overview">
              ${
                movie.overview ||
                "No description available."
              }
            </p>

            <p class="surprise-reason">
              ✨ ${reason}
            </p>

          </div>

        </div>

      `;

    })

    .catch(error => {

      console.error(error);

      body.innerHTML = `
        <p style="color:#aaa;">
          Something went wrong. Try again.
        </p>
      `;

    });

}


/* =================================
   CLOSE SURPRISE
================================= */

function closeSurpriseModal() {

  document
    .getElementById("surpriseModal")
    .classList.add("hidden");

}


/* =================================
   MOVIE DETAILS
================================= */

function openModal(id) {

  fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}`
  )

    .then(res => res.json())

    .then(movie => {

      const rating =
        movie.vote_average
          ? movie.vote_average.toFixed(1)
          : "N/A";


      document
        .getElementById("modalBody")
        .innerHTML = `

          <p class="section-label">
            MOVIE DETAILS
          </p>

          <h2 style="
            font-family:Georgia,serif;
            font-size:2rem;
            font-weight:400;
          ">
            ${movie.title}
          </h2>

          <p style="
            color:#a6a8b0;
            line-height:1.7;
          ">
            ${
              movie.overview ||
              "No description available."
            }
          </p>

          <p>
            <strong>Release:</strong>
            ${
              movie.release_date ||
              "N/A"
            }
          </p>

          <p style="
            color:rgb(var(--mood-primary));
          ">
            ⭐ ${rating}
          </p>

        `;


      document
        .getElementById("modal")
        .classList.remove(
          "hidden"
        );

    });

}


/* =================================
   CLOSE MOVIE MODAL
================================= */

function closeModal() {

  document
    .getElementById("modal")
    .classList.add(
      "hidden"
    );

}


/* =================================
   CLOSE ON BACKDROP
================================= */

document
  .getElementById("modal")
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        document.getElementById("modal")
      ) {

        closeModal();

      }

    }
  );


document
  .getElementById("surpriseModal")
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        document.getElementById(
          "surpriseModal"
        )
      ) {

        closeSurpriseModal();

      }

    }
  );