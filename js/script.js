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
        this.renderPopularMovies();
    }

    renderPopularMovies() {
        const displayMoviesUl = this.getElement('display-movies');
        const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${MOVIE_API_KEY}&language=en-US&page=1`;

        return fetch(popularMoviesUrl)
            .then(response => response.json())
            .then(popularData => {
                popularData.results.forEach(movie => {
                    const popularMovie = new Movie(movie.id, movie.title, movie.overview, movie.release_date, "genres", 'runtime', 'cast', movie.poster_path);
                    const displayMovieLi = document.createElement('li');
                    displayMovieLi.innerHTML = `<img src="https://image.tmdb.org/t/p/w92${popularMovie.posterPath}"><br><span>${popularMovie.title}</span>`
                    displayMovieLi.addEventListener('click', () => this.movieClicked(popularMovie));
                    displayMoviesUl.appendChild(displayMovieLi);
                    this.movies.push(popularMovie);

                })
                console.log(this.movies)
            })
    }

    addToSavedMovies() {
        let alreadySaved = false;

        for (let i = 0; i < this.savedMovies.length; i++) {
            if (this.selectedMovie.id === this.savedMovies[i].id) {
                alreadySaved = true;
                console.log('movie already saved');
                break;
            }
        }

        if (alreadySaved === false) {
            this.savedMovies.push(this.selectedMovie);
            this.renderDisplay();
        }
    }

    addToFavoriteMovies() {
        let alreadyFavorited = false;

        for (let i = 0; i < this.favoriteMovies.length; i++) {
            if (this.selectedMovie.id === this.favoriteMovies[i].id) {
                alreadyFavorited = true;
                console.log('movied already added to favorites');
                break;
            }
        }

        if (alreadyFavorited === false) {
            this.favoriteMovies.push(this.selectedMovie);
            this.renderDisplay();
        }
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
            const displayedMoviesH2 = this.getElement('display-movies-h2');
            const query = this.getElement('search-movies-input').value;
            displayedMoviesH2.textContent = `Search results for "${query}"`;

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
        this.getElement('movie-poster').innerHTML = `<img src="https://image.tmdb.org/t/p/w185${movie.posterPath}"></img>`
        this.getElement('movie-title-display').textContent = movie.title;
        this.getElement('movie-title').textContent = movie.title;
        this.getElement('movie-description').textContent = `Description: ${movie.description}`;
        this.getElement('release-date').textContent = `Release date: ${movie.releaseDate}`;
        this.getElement('movie-genre').textContent = `Genres: ${movie.genres.map(genre => genre.name).join(',  ')}`;
        this.getElement('runtime').textContent = `Runtime: ${movie.runtime} minutes`;
        this.getElement('cast').textContent = `Main cast: ${movie.cast.map(actor => actor.name).slice(0, 8).join(',  ')}`;
    }

    renderSearchedMovies() {
        const displayedMoviesUl = this.getElement('display-movies');
        displayedMoviesUl.innerHTML = '';
        this.movies.forEach(movie => {
            const displayedMovieLi = this.createElement('li');
            displayedMovieLi.addEventListener('click', () => this.movieClicked(movie));
            if (movie.posterPath !== null) {
                const posterURL = `<div><img src="https://image.tmdb.org/t/p/w92${movie.posterPath}"><br><span>${movie.title}</span></div>`;
                displayedMovieLi.innerHTML = posterURL;
            } else {
                displayedMovieLi.innerHTML = `<div class="null-image">no image found</div><br><span>${movie.title}</span>`;
            }
            displayedMoviesUl.appendChild(displayedMovieLi);
        });
    }

    renderDisplay() {
        const savedMoviesUl = this.getElement('saved-movies-ul');
        savedMoviesUl.innerHTML = '';
        this.savedMovies.forEach(movie => {
            const savedMoviesLi = document.createElement('li');
            savedMoviesLi.movie = movie;
            savedMoviesLi.innerHTML = `<img src="https://image.tmdb.org/t/p/w92${movie.posterPath}"><br><span>${movie.title}</span>`;
            savedMoviesUl.appendChild(savedMoviesLi);
        });

        const favoritedMoviesUl = this.getElement('favorited-movies-ul');
        favoritedMoviesUl.innerHTML = '';
        this.favoriteMovies.forEach(movie => {
            const favoritedMoviesLi = document.createElement('li');
            favoritedMoviesLi.movie = movie;
            favoritedMoviesLi.innerHTML = `<img src="https://image.tmdb.org/t/p/w92${movie.posterPath}"><br><span>${movie.title}</span>`;
            favoritedMoviesUl.appendChild(favoritedMoviesLi);
        })
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

