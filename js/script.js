class MovieApp {
    popularMovies = ['A New Hope', 'How to Train Your Dragon', 'Megamind'];

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', this.searchClicked);

        this.displayPopularMovies();
    }

    searchClicked() {
        console.log('searchCLicked');
    }

    displayPopularMovies() {
        const popularMovieUl = this.getElement('display-movies');
        this.popularMovies.forEach(movie => {
            const popularMovieLi = this.createElement('li');
            popularMovieLi.textContent = movie;
            popularMovieUl.appendChild(popularMovieLi);
        })
    }

    getElement(id) {
        return document.getElementById(id);
    }
    createElement(tag) {
        return document.createElement(tag);
    }
}

const newMovieApp = new MovieApp();