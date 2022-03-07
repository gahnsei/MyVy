const myVyUrl = `http://localhost:4005/api`;

document.body
  .querySelector(`#navSearchForm`)
  .addEventListener(`submit`, (event) => {
    event.preventDefault();
    localStorage.setItem(`q`, event.target.firstElementChild.value);
    event.target.firstElementChild.value = ``
    window.location.href = "../catalouge/index.html";
});

const displayArtist = (artistName) => {
  axios.get(`${myVyUrl}/artist/${artistName}`).then((res) => {
    let artist = res.data;
    let vid = document.querySelector(`#artsitBackgroundVid`);
    let img = document.querySelector(`#artsitImg`);
    let name = document.querySelector(`#artistName`);
    let pop = document.querySelector(`#artistPop`);

    vid.src = artist.artist_background;

    img.src = artist.artist_img;
    img.alt = artist.artist_name;

    name.textContent = artist.artist_name;
    pop.textContent = `Popularity | ` + artist.popularity;

    axios.get(`${myVyUrl}/artistGenre/${artist.artist_id}`).then((dbRes) => {
      displayRelatedArtists(dbRes.data);

      dbRes.data.forEach((ele) => {
        let genreImg = document.createElement(`img`);
        let div = document.createElement(`div`);
        div.id = ele.genre_name;
        div.classList.add(`artistGenre`);
        div.setAttribute(`genreName`, ele.genre_name.toUpperCase());

        genreImg.src = ele.genre_img;
        genreImg.alt = ele.genre_name;
        genreImg.classList.add(`imgVid`);

        div.appendChild(genreImg);
        div.addEventListener(`click`, event => {
          localStorage.setItem(`q` , event.target.firstElementChild.alt)
          window.location.href = `../catalouge/index.html`
        })
        document.querySelector(`#artistGenreDiv`).appendChild(div);
      });
    });

    axios.get(`${myVyUrl}/artistAlbums/${artist.artist_id}`).then((alRes) => {
      let latestReleaseImg = document.querySelector(`#latestReleaseImg`);
      latestReleaseImg.src = alRes.data[0].album_img;
      latestReleaseImg.alt = alRes.data[0].artist_name;
      latestReleaseImg.id = alRes.data[0].album_id;
      latestReleaseImg.addEventListener(`click`, vinylWidget);
      document
        .querySelector(`#latestRelease`)
        .addEventListener(`mouseenter`, vinylInfoPreview);

      alRes.data.forEach((ele) => {
        let img = document.createElement(`img`);
        let div = document.createElement(`div`);
        let previewDiv = document.createElement(`div`);

        img.id = ele.album_id;
        img.alt = ele.artist_name;
        img.src = ele.album_img;
        img.classList.add(`imgVid`);
        img.addEventListener(`click`, vinylWidget);

        div.appendChild(img);
        div.appendChild(previewDiv);
        div.classList.add(`vinylImg`, `discographyVinylImg`);
        div.addEventListener(`mouseenter`, vinylInfoPreview);

        document.querySelector(`#discography`).appendChild(div);
      });
    });
  });
};

const vinylWidget = (event) => {
  let vinyl = event.target;
  axios.get(`${myVyUrl}/album/${vinyl.id}`).then((res) => {
    let album = res.data[0];
    const opBckgrnd = document.createElement(`div`);
    const widget = document.createElement(`div`);

    widget.innerHTML = `
      <i id='exitButton' class="fa-solid fa-xmark"></i>
      <img id='widgetImg' class='imgVid'>
      <div id='widgetTextDiv'>
          <span id='widgetTextAlbum'></span>
          <span id='widgetTextArtist'></span>
          <label for='trackList'>Track List</label>
          <ol id='trackList'>
          </ol>
          <button id='widgetBuyButton'>Add To Cart</button>
          </div> 
          `;
    opBckgrnd.id = `opBckgrnd`;
    widget.id = `widget`;
    opBckgrnd.appendChild(widget);
    opBckgrnd.addEventListener(`click`, exitWidget);
    let main = document.querySelector(`main`);
    main.insertBefore(opBckgrnd, main.firstChild);

    document.querySelector(`#exitButton`).addEventListener(`clcik`, exitWidget);
    document.querySelector(`#widgetImg`).src = album.album_img;
    document.querySelector(`#widgetTextAlbum`).textContent = album.album_name;
    document.querySelector(`#widgetTextArtist`).textContent = album.artist_name;
    document
      .querySelector(`#widgetTextArtist`)
      .addEventListener(`click`, (event) => {
        localStorage.setItem("artist", event.target.textContent);
        window.location.href = "./index.html";
      });

    axios.get(`${myVyUrl}/tracks/${album.album_spotify_id}`).then((spotRes) => {
      let i = 0;
      while (i < spotRes.data.length && i < 16) {
        let li = document.createElement(`li`);
        if (i === 15) {
          li.textContent = `  . . .`;
        } else {
          let songName = spotRes.data[i].name;
          songName = songName.split(`(`)[0];
          if (songName.split(` `).length > 5) {
            songName = songName.split(` `);
            let songAbrevName = songName[0];
            for (let j = 1; j < 4; j++) {
              songAbrevName += ` ` + songName[j];
            }
            songAbrevName += ` ...`;
            li.textContent = songAbrevName;
          } else {
            li.textContent = songName;
          }
        }
        document.querySelector(`#trackList`).appendChild(li);
        i++;
      }
    });
  });
};

const exitWidget = (event) => {
  if (event.target.id === `opBckgrnd`) {
    event.target.remove();
  } else if (event.target.id === `exitButton`) {
    event.target.parentElement.parentElement.remove();
  }
};

const displayRelatedArtists = (artistGenres) => {
  let genres = [];
  artistGenres.forEach((ele) => genres.push(ele.genre_id));
  let artistDivSlide1 = document.createElement(`div`);
  artistDivSlide1.classList.add(`vinylDivSlide`);
  let artistDivSlide2 = document.createElement(`div`);
  artistDivSlide2.classList.add(`vinylDivSlide`);
  let artistDivSlide3 = document.createElement(`div`);
  artistDivSlide3.classList.add(`vinylDivSlide`);

  const artistDivSlides = [artistDivSlide1, artistDivSlide2, artistDivSlide3];

  axios.get(`${myVyUrl}/relatedArtists/${genres}`).then((res) => {
    let artist = res.data;
    let displayedArtists = [localStorage.getItem(`artist`)];
    let i = 0;
    let j = 1;

    while (i < 100 && displayedArtists.length < 14) {
      let rand = Math.floor(Math.random() * artist.length);

      if (!displayedArtists.includes(artist[rand].artist_name)) {
        if (displayedArtists.length === 5) {
          document
            .querySelector(`#relatedArtists${j}`)
            .appendChild(artistDivSlides[j - 1]);
          j++;
        } else if (displayedArtists.length === 9) {
          document
            .querySelector(`#relatedArtists${j}`)
            .appendChild(artistDivSlides[j - 1]);
          j++;
        } else if (displayedArtists.length === 13) {
          document
            .querySelector(`#relatedArtists${j}`)
            .appendChild(artistDivSlides[j - 1]);
          return;
        }

        let img = document.createElement(`img`);
        let div = document.createElement(`div`);
        let button = document.createElement(`button`);

        div.classList.add(`artistPreviewImg`);
        div.setAttribute(`artistName`, artist[rand].artist_name);
        div.appendChild(img);
        div.appendChild(button);

        button.classList.add(`previewArtistButton`);
        button.textContent = `Discover`;

        img.id = artist[rand].artist_name;
        img.src = artist[rand].artist_img;
        img.classList.add(`imgVid`);
        img.addEventListener(`click`, (event) => {
          localStorage.setItem("artist", event.target.id);
          window.location.href = "./index.html";
        });
        artistDivSlides[j - 1].appendChild(div);
        displayedArtists.push(artist[rand].artist_name);
      }
      i++;
    }
  });
};

const vinylInfoPreview = (event) => {
  const album = event.target.firstElementChild;

  axios.get(`${myVyUrl}/album/${album.id}`).then((res) => {
    const vinyl = res.data[0];
    const previewDiv = album.nextElementSibling;
    previewDiv.id = `vinylPreviewInfo${vinyl.album_id}`;
    previewDiv.classList.add(`vinylPreviewInfo`);

    previewDiv.innerHTML = `
      <div id='previewNames'>
        <span id='previewAlbum'> ${vinyl.album_name}</span>
        <span id='previewArtist'>${vinyl.artist_name}</span>
      </div>

      <div>
        <span id='previewPrice'>$${vinyl.price}</span>
      </div>
    `;
    if (document.querySelectorAll(`.vinylPreviewInfo`).length > 1) {
      let element = document.querySelectorAll(`.vinylPreviewInfo`);
      element.forEach((ele) => {
        if (ele.id !== previewDiv.id) {
          ele.innerHTML = ``;
          ele.className = ``;
        }
      });
    }

    document.querySelector(`#previewArtist`).addEventListener(`click`, () => {
      localStorage.setItem("artist", event.target.firstElementChild.alt);
      window.location.href = "./index.html";
    });

    event.target.addEventListener(`mouseleave`, (event) => {
      let element = document.querySelectorAll(
        `#vinylPreviewInfo${vinyl.album_id}`
      );
      element.forEach((ele) => {
        ele.innerHTML = ``;
        ele.className = ``;
      });
    });
  });
};

window.onload = () => {
  const ARTIST = localStorage.getItem(`artist`);
  displayArtist(ARTIST);
};
