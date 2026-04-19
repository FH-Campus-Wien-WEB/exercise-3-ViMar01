import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID).class("movie")
          .append(new ElementBuilder("div").class("posterContainer")
              .append(new ElementBuilder("img").with("src", movie.Poster)))

          .append(new ElementBuilder("div").class("infoContainer")
              .append(new ElementBuilder("div").class("titleContainer")    
                .append(new ElementBuilder("h2").text(movie.Title))
                .append(new ElementBuilder("button").text("Edit")
                      .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
              .append(new ParagraphBuilder().class("timeContainer").items(
                    "Runtime " + formatRuntime(movie.Runtime),
                    
                    "Released on " +
                        new Date(movie.Released).toLocaleDateString("en-US")))              
              .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
              .append(new ElementBuilder("p").text(movie.Plot))
              .append(new ElementBuilder("div").class("ratingContainer")
                .append(new ElementBuilder("span").text(`ImdbRating: ${movie.imdbRating}/10`).class("imdbRating"))
                .append(new ElementBuilder("span").text(`Metascore: ${movie.Metascore}%`).class("metascore")))
              .append(new ElementBuilder("h3").pluralizedText("Director", movie.Directors))
              .append(new ListBuilder().items(movie.Directors))
              .append(new ElementBuilder("h3").pluralizedText("Writer", movie.Writers))
              .append(new ListBuilder().items(movie.Writers))
              .append(new ElementBuilder("h3").pluralizedText("Actor", movie.Actors))
              .append(new ListBuilder().items(movie.Actors)))
          .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href);
  /* long way
  const params = new URLSearchParams(url.search);
  if (genre){
    params.set("genre", genre)
    url.search = params.toString();
  }*/
 if (genre) {
  url.searchParams.set("genre", genre)
 }
  /* Task 1.4. Add query parameter to the url if a genre is given */

  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
         
      const genres = JSON.parse(xhr.responseText);
      //button load all movies
      new ElementBuilder("li")
          .append(new ElementBuilder("button").text("All").class("genreAllButton")
                    .listener("click", () => loadMovies()))
                    .appendTo(listElement);

      /* add my favorite movies */
      new ElementBuilder("li")
          .append(new ElementBuilder("button").text("My Favorites").class("genreButton")
                    .listener("click", () => loadMovies("Favorite")))
                    .appendTo(listElement);
       
                                            
      //for each genres make one button
      genres.forEach(genre => {
        if(genre !== "Favorite"){
        new ElementBuilder("li")
          .append(new ElementBuilder("button").text(genre).class("genreButton")
                    .listener("click", () => loadMovies(genre)))
                    .appendTo(listElement);
        }
      });

      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};
