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
        /* this.getMovieGenres(); */
    }

    getMovieDetails() {
        const query = this.getElement('search-movies-input').value;
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIE_API_KEY}`;


        fetch(searchUrl)
            .then(response => response.json())
            .then(tmdbMovies => {
                if (tmdbMovies.results && tmdbMovies.results.length > 0) {
                    tmdbMovies.results.forEach(tmdbMovie => {
                        const movie = new Movie(tmdbMovie.id, tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date);
                        if (!this.movieDetails[tmdbMovie.id]) {
                            this.movieDetails[tmdbMovie.id] = movie;
                        }

                        this.movies.push(movie);


                    });

                    this.displayMovies();
                } else {
                    const displayedMoviesUl = this.getElement('display-movies');
                    displayedMoviesUl.innerHTML = '<li>No movies found</li>';
                    console.log('No movies found.');
                }
            })
            // .then(fetch('genres'z)
            // .then(fetch('cast'))
            .catch(error => {
                console.error('Error fetching data:', error);
            });

    };

    movieClicked(mouseEvent) {
        const movieLi = mouseEvent.target;
        const detailsUrl = `https://api.themoviedb.org/3/movie/${movieLi.id}?api_key=${MOVIE_API_KEY}`;

        console.log(movieLi.id);
        //if (!movieLi.id) {
        fetch(detailsUrl)
            .then(reponse => reponse.json())

            .then(detailsData => {
                //fetch cast
                console.log(detailsData);
                const selectedMovie = this.movieDetails[detailsData.id];
                selectedMovie.update(detailsData);
                this.getElement('movie-title-display').textContent = selectedMovie.title;

                this.getElement('movie-title').textContent = selectedMovie.title;
                this.getElement('movie-description').textContent = selectedMovie.description;
                this.getElement('release-date').textContent = selectedMovie.releaseDate;
                this.getElement('movie-genre').textContent = selectedMovie.genres.map(genre => genre.name).join(',  ');
                this.getElement('runtime').textContent = selectedMovie.runtime;
                this.getElement('cast').textContent = selectedMovie.cast;
            });
        // }
        // Find the movie in the this.popularMovies whose title equals movieTitle

    }

    displayMovies() {
        const displayedMoviesUl = this.getElement('display-movies');
        displayedMoviesUl.innerHTML = '';
        this.movies.forEach(movie => {
            const displayedMovieLi = this.createElement('li');
            displayedMovieLi.id = movie.id;
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

    update(data) {
        console.log(data);
        this.genres = data.genres;
        this.runtime = data.runtime;
    }
}

/* function getTestMovies() {
    return [
        new Movie('A New Hope', 'A long time ago...', '1977', 'sci-fi', '120 min', 'Mark Hamill'),
        new Movie('How to Train Your Dragon', 'A boy and his dragon', '2010', 'fantasy', '130 min', 'Jay Baruchel'),
        new Movie('Megamind', 'Big head', '2010', 'comedy', '125 min', 'Will Ferrell')
    ];
} */



const newMovieApp = new MovieApp();

