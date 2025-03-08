import { MOVIE_API_KEY } from "../variables.js";

class MovieApp {

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));
        this.movies = [];
        this.movieDetails = {};
        this.displayMovies();
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
            .then(tmdbMovies => {
                if (tmdbMovies.results && tmdbMovies.results.length > 0) {
                    tmdbMovies.results.forEach(tmdbMovie => {
                        const movie = new Movie(tmdbMovie.id, tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date);
                        this.movies.push(movie);
                    });

                    this.displayMovies();
                } else {
                    const displayedMoviesUl = this.getElement('display-movies');
                    displayedMoviesUl.innerHTML = '<li>No movies found</li>';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

    };

    movieClicked(mouseEvent) {
        this.getGenres(mouseEvent.target.movie).then(this.getCredits.bind(this));
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
                this.updateMovieDetails(movie);
            });
    }

    updateMovieDetails(movie) {
        this.getElement('movie-title-display').textContent = movie.title;
        this.getElement('movie-title').textContent = movie.title;
        this.getElement('movie-description').textContent = movie.description;
        this.getElement('release-date').textContent = movie.releaseDate;
        this.getElement('movie-genre').textContent = movie.genres.map(genre => genre.name).join(',  ');
        this.getElement('runtime').textContent = movie.runtime;
        this.getElement('cast').textContent = movie.cast.map(actor => actor.name).slice(0, 8).join(',  ');
    }

    displayMovies() {
        const displayedMoviesUl = this.getElement('display-movies');
        displayedMoviesUl.innerHTML = '';
        this.movies.forEach(movie => {
            const displayedMovieLi = this.createElement('li');
            displayedMovieLi.movie = movie;
            displayedMovieLi.addEventListener('click', this.movieClicked.bind(this));
            displayedMovieLi.textContent = movie.title;
            displayedMoviesUl.appendChild(displayedMovieLi);
        });
    }

    getElement(id) {
        return document.getElementById(id);
    }
    createElement(tag) {
        return document.createElement(tag);
    }
}

class Movie {
    constructor(id, title, description, releaseDate, genres = [], runtime, cast) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.genres = genres;
        this.runtime = runtime;
        this.cast = cast;
    }
}

const newMovieApp = new MovieApp();

