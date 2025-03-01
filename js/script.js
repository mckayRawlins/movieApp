class MovieApp {

    constructor() {
        const search = this.getElement('search');
        search.addEventListener('click', () => {
            console.log('click');
        })
    }
    popularMovies = [''];


    searchClicked() {

    }

    getElement(id) {
        return document.getElementById(id);
    }
}

const newMovieApp = new MovieApp();