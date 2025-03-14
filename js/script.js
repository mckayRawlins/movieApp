import { MOVIE_API_KEY } from "../variables.js";

class MovieApp {
    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));
        const saveMovieButton = this.getElement('save-movie');
        saveMovieButton.addEventListener('click', this.addToSavedMovies.bind(this));
        const favoriteMovieButton = this.getElement('favorite-movie');
        favoriteMovieButton.addEventListener('click', this.addToFavoriteMovies.bind(this));
        const commentButton = this.getElement('comment-button')
        commentButton.addEventListener('click', this.commentButtonClicked.bind(this));

        this.movies = [];
        this.selectedMovie = null;
        this.savedMovies = [];
        this.favoriteMovies = [];
        this.moviesWithComments = [];

        this.renderSearchedMovies();
        this.renderPopularMovies();
    }

    save() {
        this.setItem('saved-movies', this.savedMovies);
        this.setItem('favorite-movies', this.favoriteMovies);
        this.setItem('movie-comments', this.moviesWithComments);

        // When the user saves a comment, store the selected movie id and the comment in an
        // object to local storage. 
        this.renderMovieDetails(this.selectedMovie);
    }

    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    load() {
        this.savedMovies = this.getItem('saved-movies');
        this.favoriteMovies = this.getItem('favorite-movies');
        this.moviesWithComments = this.getItem('movie-comments') || [];
    }

    /* renderMainContent() {
        const dynamicDisplay = this.getElement('dynamic-display');
    } */

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
            })
    }

    addToSavedMovies() {
        this.storeMovies(this.savedMovies);
    }

    addToFavoriteMovies() {
        this.storeMovies(this.favoriteMovies);
    }


    storeMovies(storedMovies) {
        let alreadyFavorited = false;

        for (let i = 0; i < storedMovies.length; i++) {
            if (this.selectedMovie.id === storedMovies[i].id) {
                alreadyFavorited = true;
                break;
            }
        }

        if (alreadyFavorited === false) {
            storedMovies.push(this.selectedMovie);
            this.renderDisplay();
        }
        this.save();
    }

    searchClicked() {
        this.movies = [];
        this.getMovieDetails();
        console.log(this.movies);
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
        this.getGenres(this.selectedMovie)
            .then(this.getCredits)
            .then(this.getTrailer.bind(this))
            .then(this.renderMovieDetails.bind(this));
    }

    commentButtonClicked() {
        const commentsInput = this.getElement('comments-input');
        const newComment = commentsInput.value;

        const existingMovieWithComments = this.moviesWithComments
            .find(movieWithComments => movieWithComments.movieId === this.selectedMovie.id);
        if (existingMovieWithComments) {
            existingMovieWithComments.comments.push(newComment);
        } else {
            this.moviesWithComments.push(new MovieReviews(this.selectedMovie.id, [newComment]))
        }
        commentsInput.value = ''
        this.save();
    }

    getTrailer(movie) {
        const trailerUrl = `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${MOVIE_API_KEY}&language=en-US`;
        const trailerContainer = this.getElement('trailer-container');

        return fetch(trailerUrl)
            .then(response => response.json())
            .then(videoData => {
                if (videoData.results.length > 0) {
                    const trailers = videoData.results.filter(video => video.type === "Trailer");
                    if (trailers.length > 0) {
                        const displayedTrailer = trailers[0];
                        const trailerKey = displayedTrailer.key;
                        const trailerSite = displayedTrailer.site;
                        this.renderTrailer(trailerKey, trailerSite);
                    }
                } else {
                    trailerContainer.innerHTML = `<span>No trailer found</span>`;
                }
                return movie;
            });
    }

    renderTrailer(trailerKey, trailerSite) {
        const trailerContainer = this.getElement('trailer-container');

        trailerContainer.innerHTML = '';

        if (!trailerKey || !trailerSite) {
            trailerContainer.innerHTML = `<span>No trailer found</span>`;
        }

        let embedUrl = '';
        if (trailerSite.toLowerCase() === 'youtube') {
            embedUrl = `https://www.youtube.com/embed/${trailerKey}`;
        } else if (trailerSite.toLowerCase() === 'vimeo') {
            embedUrl = `https://www.vimeo.com/embed/${trailerKey}`;
        } else {
            trailerContainer.textContent = 'trailer site unsupported';
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.width = 560;
        iframe.height = 315;


        trailerContainer.appendChild(iframe);

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
                return movie;
            });
    }

    renderMovieDetails(movie) {
        const moviePoster = this.getElement('movie-poster');
        if (movie.posterPath !== null) {
            moviePoster.innerHTML = `<img src="https://image.tmdb.org/t/p/w185${movie.posterPath}"></img>`;
        } else {
            moviePoster.innerHTML = `<div class="null-image2">no image found</div><br><span>${movie.title}</span>`;
        }
        this.rateMovie();
        this.getElement('movie-title-display').textContent = movie.title;
        this.getElement('movie-title').textContent = movie.title;
        this.getElement('movie-description').textContent = `Description: ${movie.description}`;
        this.getElement('release-date').textContent = `Release date: ${movie.releaseDate}`;
        this.getElement('movie-genre').textContent = `Genres: ${movie.genres.map(genre => genre.name).join(',  ')}`;
        this.getElement('runtime').textContent = `Runtime: ${movie.runtime} minutes`;
        this.getElement('cast').textContent = `Main cast: ${movie.cast.map(actor => actor.name).slice(0, 8).join(',  ')}`;

        const commentsUl = this.getElement('comments-ul');
        commentsUl.innerHTML = '';

        const tmdbMovieComments = this.moviesWithComments.find(movieComment => movieComment.movieId === movie.id);
        if (tmdbMovieComments) {
            movie.comments = tmdbMovieComments.comments;

            movie.comments.forEach(comment => {
                const commentLi = document.createElement('li');
                commentLi.innerHTML = comment;
                commentsUl.append(commentLi);
            })
        }

        //this.getElement('trailer-div').innerHTML = `<p>trailer displayed</p>`
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

    rateMovie() {

        const starsContainer = this.getElement('star-container');
        let active = -1;
        for (let i = 0; i < 5; i++) {
            const star = this.createElement('span');
            star.classList.add('fa', 'fa-star');
            starsContainer.appendChild(star);

            star.addEventListener("mouseover", () => onStarHover(i));
            star.addEventListener("mouseleave", () => onStarOut());
            star.addEventListener("click", () => onStarClick(i));
        }

        const stars = document.querySelectorAll(".fa-star");

        function onStarHover(i) {
            fill(i);
        }

        function fill(ratingValue) {
            for (let i = 0; i < 5; i++) {
                if (i <= ratingValue) {
                    stars[i].classList.add('star-filled');
                } else {
                    stars[i].classList.remove('star-filled');
                }
            }
        }

        function onStarOut() {
            fill(active);
        }

        function onStarClick(i) {
            active = i;
            fill(active);
        }
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

class MovieReviews {
    constructor(movieId, comments = [], rating) {
        this.movieId = movieId;
        this.comments = comments;
        this.rating = rating;
    }


}

const newMovieApp = new MovieApp();
newMovieApp.load();

