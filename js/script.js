class MovieApp {
    movies = []; //getTestMovies();

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));

        this.displayMovies();
    }



    searchClicked() {
        this.movies = [];
        const query = this.getElement('search-movies-input').value;
        const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(tmdbMovies => {
                if (tmdbMovies.results && tmdbMovies.results.length > 0) {
                    tmdbMovies.results.forEach(tmdbMovie => {
                        // Finish populating your movie object with the tmdb data.
                        const movie = new Movie(tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date, 'genre', 'runtime', 'cast');
                        this.movies.push(movie);
                    });

                    this.displayMovies();
                } else {
                    console.log('No movies found.');
                }
            })
            // .then(fetch('genres')
            // .then(fetch('cast'))
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    getMovieDetails(id) {
        const query = this.getElement('search-movies-input').value;
        const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(tmdbMovies => {
                if (tmdbMovies.results && tmdbMovies.results.length > 0) {
                    tmdbMovies.results.forEach(tmdbMovie => {
                        // Finish populating your movie object with the tmdb data.
                        const movie = new Movie(tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date, 'genre', 'runtime', 'cast');
                        this.movies.push(movie);
                    });

                    this.displayMovies();
                } else {
                    console.log('No movies found.');
                }
            })
            // .then(fetch('genres')
            // .then(fetch('cast'))
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    movieClicked(mouseEvent) {
        const movieLi = mouseEvent.target;
        const movieTitle = movieLi.textContent;

        // Find the movie in the this.popularMovies whose title equals movieTitle
        const selectedMovie = this.movies.find(movie => movie.title === movieTitle);
        this.getElement('movie-title-display').textContent = selectedMovie.title;

        this.getElement('movie-title').textContent = selectedMovie.title;
        this.getElement('movie-description').textContent = selectedMovie.description;
        this.getElement('release-date').textContent = selectedMovie.releaseDate;
        this.getElement('movie-genre').textContent = selectedMovie.genre;
        this.getElement('runtime').textContent = selectedMovie.runtime;
        this.getElement('cast').textContent = selectedMovie.cast;
    }

    displayMovies() {
        const displayedMoviesUl = this.getElement('display-movies');
        displayedMoviesUl.innerHTML = '';
        this.movies.forEach(movie => {
            const displayedMovieLi = this.createElement('li');
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
    constructor(title, description, releaseDate, genre, runtime, cast) {
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.genre = genre;
        this.runtime = runtime;
        this.cast = cast;
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

