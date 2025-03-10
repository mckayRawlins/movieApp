import { MOVIE_API_KEY } from "../variables.js";

class MovieApp {
    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));
        const saveMovieButton = this.getElement('save-movie');
        saveMovieButton.addEventListener('click', this.addToSavedMovies.bind(this));
        const favoriteMovieButton = this.getElement('favorite-movie');
        favoriteMovieButton.addEventListener('click', this.addToFavoriteMovies.bind(this));

        this.movies = [];
        this.selectedMovie = null;
        this.savedMovies = [];
        this.favoriteMovies = [];

        this.renderSearchedMovies();
    }

    addToSavedMovies() {
        this.savedMovies.push(this.selectedMovie);
        this.renderDisplay();
    }

    addToFavoriteMovies() {
        console.log('favorited movie');
    }

    searchClicked() {
        this.movies = [];
        this.getMovieDetails();
    }

    getMovieDetails() {
        const query = this.getElement('search-movies-input').value;
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIE_API_KEY}`;

        return fetch(searchUrl)
            .then(response => response.json())
            .then(this.populateMovies.bind(this))
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    populateMovies(tmdbMovies) {
        if (tmdbMovies.results && tmdbMovies.results.length > 0) {
            tmdbMovies.results.forEach(tmdbMovie => {
                const movie = new Movie(tmdbMovie.id, tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date, "genres", 'runtime', 'cast', tmdbMovie.poster_path);
                this.movies.push(movie);
            });

            this.renderSearchedMovies();
        } else {
            const displayedMoviesUl = this.getElement('display-movies');
            displayedMoviesUl.innerHTML = '<li>No movies found</li>';
        }
    }

    movieClicked(movie) {
        this.selectedMovie = movie;
        this.getGenres(this.selectedMovie).then(this.getCredits.bind(this));
    }

    getGenres(movie) {
        const genresUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${MOVIE_API_KEY}`;

        return fetch(genresUrl)
            .then(reponse => reponse.json())
            .then(genresData => {
                movie.genres = genresData.genres;
                movie.runtime = genresData.runtime;
                return movie;
            });
    }

    getCredits(movie) {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${MOVIE_API_KEY}`;

        return fetch(creditsUrl)
            .then(creditsResponse => creditsResponse.json())
            .then(creditsData => {
                movie.cast = creditsData.cast;
                this.renderMovieDetails(movie);
            });
    }

    renderMovieDetails(movie) {
        this.getElement('movie-title-display').textContent = movie.title;
        this.getElement('movie-title').textContent = movie.title;
        this.getElement('movie-description').textContent = movie.description;
        this.getElement('release-date').textContent = movie.releaseDate;
        this.getElement('movie-genre').textContent = movie.genres.map(genre => genre.name).join(',  ');
        this.getElement('runtime').textContent = movie.runtime;
        this.getElement('cast').textContent = movie.cast.map(actor => actor.name).slice(0, 8).join(',  ');
    }

    renderSearchedMovies() {
        const displayedMoviesUl = this.getElement('display-movies');
        displayedMoviesUl.innerHTML = '';
        this.movies.forEach(movie => {
            const displayedMovieLi = this.createElement('li');
            displayedMovieLi.addEventListener('click', () => this.movieClicked(movie));
            const posterURL = `<div><img src="https://image.tmdb.org/t/p/w92${movie.posterPath}"><span>${movie.title}</span></div>`;
            displayedMovieLi.innerHTML = posterURL;
            displayedMoviesUl.appendChild(displayedMovieLi);
        });
    }

    renderDisplay() {
        const savedMoviesUl = this.getElement('saved-movies-ul');
        this.savedMovies.forEach(movie => {
            const savedMoviesLi = document.createElement('li');
            savedMoviesLi.movie = movie;
            savedMoviesLi.textContent = movie.title;
            savedMoviesUl.appendChild(savedMoviesLi);
        });

        // render favorited movies
    }

    getElement(id) {
        return document.getElementById(id);
    }
    createElement(tag) {
        return document.createElement(tag);
    }
}

class Movie {
    constructor(id, title, description, releaseDate, genres = [], runtime, cast, posterPath) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.genres = genres;
        this.runtime = runtime;
        this.cast = cast;
        this.posterPath = posterPath;
    }
}

const newMovieApp = new MovieApp();

