class MovieApp {
    movies = []; //getTestMovies();

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));

        this.displayMovies();
    }



    searchClicked() {
        this.movies = [];
        this.getMovieDetails();
        this.getMovieGenres();
    }

    getMovieDetails() {
        const query = this.getElement('search-movies-input').value;
        const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;


        fetch(searchUrl)
            .then(res => res.json())
            .then(res => console.log(res))
            .catch(err => console.error(err));

        fetch(searchUrl)
            .then(response => response.json())
            .then(tmdbMovies => {
                if (tmdbMovies.results && tmdbMovies.results.length > 0) {
                    tmdbMovies.results.forEach(tmdbMovie => {
                        // Finish populating your movie object with the tmdb data.
                        console.log(tmdbMovie.id);
                        const movie = new Movie(tmdbMovie.title, tmdbMovie.overview, tmdbMovie.release_date, tmdbMovie.genre_ids, 'runtime', 'cast');
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


    /* getMovieGenres() {
        const query = this.getElement('search-movies-input').value;
        const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
        const detailsUrl = `https://api.themoviedb.org/3/movie/${query}?api_key=${API_KEY}`;

        fetch(detailsUrl)
            .then(res => res.json())
            .then(tmdbGenres => {
                console.log(tmdbGenres.results)
                if (tmdbGenres.results && tmdbGenres.results.length > 0) {
                    tmdbGenres.results.forEach(genre => {
                        console.log(genre.name);
                    })
                }
            })
            .catch(err => console.error(err));
    } */

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

