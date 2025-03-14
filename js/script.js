import { MOVIE_API_KEY } from "../variables.js";

class MovieApp {
    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));
        this.saveMovieButton = this.getElement('save-movie');
        this.saveMovieButton.addEventListener('click', this.addToSavedMovies.bind(this));
        const favoriteMovieButton = this.getElement('favorite-movie');
        favoriteMovieButton.addEventListener('click', this.addToFavoriteMovies.bind(this));
        const commentButton = this.getElement('comment-button')
        commentButton.addEventListener('click', this.commentButtonClicked.bind(this));
        const savedMoviesButton = this.getElement('saved-movies-button');
        savedMoviesButton.addEventListener('click', this.navigateToSavedMovies.bind(this));

        this.mainSearchPage = this.getElement('main-search-page');
        this.movieInfoPage = this.getElement('movie-info-page');
        this.savedMoviesPage = this.getElement('saved-movies-page');

        this.showPage(this.mainSearchPage);

        this.movies = [];
        this.selectedMovie = null;
        this.savedMovies = [];
        this.favoriteMovies = [];
        this.moviesWithReviews = [];

        this.renderSearchedMovies();
        this.renderPopularMovies();
    }

    showPage(pageDiv) {
        this.mainSearchPage.classList.add('hide');
        this.movieInfoPage.classList.add('hide');
        this.savedMoviesPage.classList.add('hide');

        if (pageDiv === this.mainSearchPage) {
            this.mainSearchPage.classList.remove('hide');
        } else if (pageDiv === this.movieInfoPage) {
            this.movieInfoPage.classList.remove('hide')
        } else if (pageDiv === this.savedMoviesPage) {
            this.savedMoviesPage.classList.remove('hide')
        } else {
            this.mainSearchPage.classList.remove('hide');
        }
    }

    navigateToSavedMovies() {
        this.showPage(this.savedMoviesPage);
        this.load();
        this.renderDisplay();
    }

    save() {
        this.setItem('saved-movies', this.savedMovies);
        this.setItem('favorite-movies', this.favoriteMovies);
        this.setItem('movie-comments', this.moviesWithReviews);

        this.renderMovieDetails(this.selectedMovie);
    }

    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }


    removeStoredMovie() {
        const savedMovies = JSON.parse(localStorage.getItem('saved-movies'));
        console.log('before', savedMovies);
        this.savedMovies = savedMovies.filter(movie => movie.id !== this.selectedMovie.id)
        console.log('after', this.savedMovies)
        this.save();
        this.renderDisplay();
    }

    load() {
        this.savedMovies = this.getItem('saved-movies') || [];
        this.favoriteMovies = this.getItem('favorite-movies') || [];
        this.moviesWithReviews = this.getItem('movie-comments') || [];
    }

    renderPopularMovies() {
        const displayMoviesUl = this.getElement('display-movies');
        const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${MOVIE_API_KEY}&language=en-US&page=1`;

        return fetch(popularMoviesUrl)
            .then(response => response.json())
            .then(popularData => {
                popularData.results.forEach(movie => {
                    const popularMovie = new Movie(movie.id, movie.title, movie.overview, movie.release_date, undefined, undefined, undefined, movie.poster_path);

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
        this.saveMovieButton.classList.remove('fa-plus');
        this.saveMovieButton.classList.add('fa-trash');

    }

    addToFavoriteMovies() {
        this.storeMovies(this.favoriteMovies);
    }


    storeMovies(storedMovies) {
        if (!storedMovies) {
            storedMovies.push(this.selectedMovie);
        }

        // When a user clicks favorite, add this.selectedMovie to the storedMovie list (favorited or saved);
        // When a user clicks it again, if the movie is in the array, removie it. 

        const existingMovie = storedMovies.find(savedMovie => this.selectedMovie.id === savedMovie.id);

        if (existingMovie) {
            storedMovies = storedMovies.slice(storedMovies.indexOf(this.selectedMovie));
            this.removeStoredMovie();
            this.renderDisplay();
        } else {
            storedMovies.push(this.selectedMovie);
            this.renderDisplay();
        }

        this.save();
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
                const movie = new Movie(tmdbMovie.id, tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date, undefined, undefined, undefined, tmdbMovie.poster_path);
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

        this.showPage(this.movieInfoPage);
        this.getGenres(this.selectedMovie)
            .then(this.getCredits.bind(this))
            .then(this.getTrailer.bind(this))
            .then(this.renderMovieDetails.bind(this))
            .then(() => {
                const savedMovieReviews = this.moviesWithReviews.find(movieRating => movieRating.movieId === movie.id);

                this.selectedMovie = {
                    ...this.selectedMovie,
                    comments: savedMovieReviews?.comments,
                    rating: savedMovieReviews?.rating
                };
            });


    }

    commentButtonClicked() {
        const commentsInput = this.getElement('comments-input');
        const newComment = commentsInput.value;

        const existingMovieWithComments = this.moviesWithReviews
            .find(movieWithReviews => movieWithReviews.movieId === this.selectedMovie.id);
        if (existingMovieWithComments) {
            existingMovieWithComments.comments.push(newComment);
        } else {
            this.moviesWithReviews.push(new MovieReviews(this.selectedMovie.id, [newComment], 'rating'))
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
                movie.genres = genresData?.genres || movie.genres;
                movie.runtime = genresData.runtime;
                return movie;
            });
    }

    getCredits(movie) {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${MOVIE_API_KEY}`;

        return fetch(creditsUrl)
            .then(creditsResponse => creditsResponse.json())
            .then(creditsData => {
                movie.cast = creditsData?.cast || movie.cast;
                return movie;
            });
    }

    renderMovieDetails(movie) {
        movie = this.selectedMovie;
        const moviePoster = this.getElement('movie-poster');
        if (movie.posterPath !== null) {
            moviePoster.innerHTML = `<img src="https://image.tmdb.org/t/p/w185${movie.posterPath}"></img>`;
        } else {
            moviePoster.innerHTML = `<div class="null-image2">no image found</div><br><span>${movie.title}</span>`;
        }
        this.rateMovie(movie);
        this.getElement('movie-title-display').textContent = movie.title;
        this.getElement('movie-title').textContent = movie.title;
        this.getElement('movie-description').textContent = `Description: ${movie.description}`;
        this.getElement('release-date').textContent = `Release date: ${movie.releaseDate}`;
        this.getElement('movie-genre').textContent = `Genres: ${movie.genres?.map(genre => genre.name).join(',  ')}`;
        this.getElement('runtime').textContent = `Runtime: ${movie.runtime} minutes`;
        this.getElement('cast').textContent = `Main cast: ${movie.cast?.map(actor => actor.name).slice(0, 8).join(',  ')}`;

        const commentsUl = this.getElement('comments-ul');
        commentsUl.innerHTML = '';

        const tmdbMovieComments = this.moviesWithReviews.find(movieComment => movieComment.movieId === movie.id);
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

    rateMovie(movie) {
        const starsContainer = this.getElement('star-container');
        starsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = this.createElement('span');
            star.classList.add('fa', 'fa-star');
            starsContainer.appendChild(star);

            star.addEventListener("mouseover", () => this.onStarHover(i));
            star.addEventListener("mouseleave", () => this.onStarOut());
            star.addEventListener("click", () => this.onStarClick(i, movie));
        }
        setTimeout(() => {
            this.fill();
        })
    }
    onStarHover(i) {
        this.fill(i);
    }


    onStarOut() {
        this.fill();
    }

    onStarClick(i, movie) {
        this.selectedMovie.rating = (i + 1) || -1;
        this.fill();

        const existingMovieWithRating = this.moviesWithReviews
            .find(movieWithRating => movieWithRating.movieId === movie.id);
        if (existingMovieWithRating) {
            existingMovieWithRating.rating = i + 1;
        } else {

            this.moviesWithReviews.push(new MovieReviews(this.selectedMovie.id, [], i + 1));
        }
        this.save();
    }

    fill(ratingValue) {
        ratingValue = ratingValue || (this.selectedMovie.rating - 1);
        const stars = document.querySelectorAll(".fa-star");
        for (let i = 0; i < 5; i++) {
            if (i <= ratingValue) {
                stars[i].classList.add('star-filled');
            } else {
                stars[i].classList.remove('star-filled');
            }
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

