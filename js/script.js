class MovieApp {
    popularMovies = getTestMovies();

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked.bind(this));

        this.displayPopularMovies();
    }



    searchClicked(term) {
        const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
        const query = term;
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;
        const searchMoviesInput = this.getElement('search-movies-input');
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    data.results.forEach(movie => {
                        console.log(`Title: ${movie.title}, Release Date: ${movie.release_date}`);
                    });
                } else {
                    console.log('No movies found.');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
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

// class TheMovieDataBaseAPI {
function search(term) {
    // Replace 'YOUR_API_KEY' with your actual TMDB API key
    /* const API_KEY = 'b41ead9b50fce35c9fb1ff933efbd03c';
    const query = term;
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                data.results.forEach(movie => {
                    console.log(`Title: ${movie.title}, Release Date: ${movie.release_date}`);
                });
            } else {
                console.log('No movies found.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        }); */

}
// }

search('Pand').then(movies => {
    console.log(movies);
});

const newMovieApp = new MovieApp();

