class MovieApp {
    popularMovies = getTestMovies();

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));

        this.displayPopularMovies();
    }



    searchClicked() {
        console.log('searchCLicked');
    }

    movieClicked(mouseEvent) {
        const movieLi = mouseEvent.target;
        const movieTitle = movieLi.textContent;

        // Find the movie in the this.popularMovies whose title equals movieTitle
        const selectedMovie = this.popularMovies.find(movie => movie.title === movieTitle);
        this.getElement('movie-title-display').textContent = selectedMovie.title;

        this.getElement('movie-title').textContent = selectedMovie.title;
        this.getElement('movie-description').textContent = selectedMovie.description;
        this.getElement('release-date').textContent = selectedMovie.releaseDate;
        this.getElement('movie-genre').textContent = selectedMovie.genre;
        this.getElement('runtime').textContent = selectedMovie.runtime;
        this.getElement('cast').textContent = selectedMovie.cast;
    }

    displayPopularMovies() {
        const popularMovieUl = this.getElement('display-movies');
        this.popularMovies.forEach(movie => {
            const popularMovieLi = this.createElement('li');
            popularMovieLi.addEventListener('click', this.movieClicked.bind(this));
            popularMovieLi.textContent = movie.title;
            popularMovieUl.appendChild(popularMovieLi);
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

function getTestMovies() {
    return [
        new Movie('A New Hope', 'A long time ago...', '1977', 'sci-fi', '120 min', 'Mark Hamill'),
        new Movie('How to Train Your Dragon', 'A boy and his dragon', '2010', 'fantasy', '130 min', 'Jay Baruchel'),
        new Movie('Megamind', 'Big head', '2010', 'comedy', '125 min', 'Will Ferrell')
    ];
}

const newMovieApp = new MovieApp();

