const myVyUrl = `http://localhost:4005/api`;

document.body.querySelector(`#navSearchForm`).addEventListener(`submit`, (event) => {
  event.preventDefault()
  localStorage.setItem(`q`, event.target.firstElementChild.value)
  event.target.firstElementChild.value = ``
  window.location.href="./catalouge/index.html"
})

const displayTodaysHits = () => {
  axios.get(`${myVyUrl}/albumGenre/1,2,5/?limit=50`).then(dbRes => {
      const todaysHits = dbRes.data
      let displayedVinyl = []
      let i = 0
      let j = 1;

      let vinylDivSlide1 = document.createElement(`div`);
      vinylDivSlide1.classList.add(`vinylDivSlide`);
      let vinylDivSlide2 = document.createElement(`div`);
      vinylDivSlide2.classList.add(`vinylDivSlide`);
      let vinylDivSlide3 = document.createElement(`div`);
      vinylDivSlide3.classList.add(`vinylDivSlide`);
    
      const vinylDivSlides = [vinylDivSlide1, vinylDivSlide2, vinylDivSlide3];

      while (i < 100 && displayedVinyl.length < 13) {
        let rand = Math.floor(Math.random() * todaysHits.length)

        if (!displayedVinyl.includes(todaysHits[rand].album_name)) {
          if (displayedVinyl.length === 4) {
            document
              .querySelector(`#todaysHitsSlide${j}`)
              .appendChild(vinylDivSlides[j - 1]);
            j++;
          } else if (displayedVinyl.length === 8) {
            document
              .querySelector(`#todaysHitsSlide${j}`)
              .appendChild(vinylDivSlides[j - 1]);
            j++;
          } else if (displayedVinyl.length === 12) {
            document
              .querySelector(`#todaysHitsSlide${j}`)
              .appendChild(vinylDivSlides[j - 1]);
            return;
          }

          let img = document.createElement(`img`);
          let div = document.createElement(`div`);
          let previewDiv = document.createElement(`div`);
      

          img.id = todaysHits[rand].album_id
          img.alt = todaysHits[rand].artist_name
          img.src = todaysHits[rand].album_img;
          img.classList.add(`imgVid`);
          img.addEventListener(`click`, vinylWidget)
          
          div.appendChild(img)
          div.appendChild(previewDiv)
          div.classList.add(`vinylImg`)
          div.addEventListener(`mouseenter`, vinylInfoPreview)
        
          vinylDivSlides[j - 1].appendChild(div);
          displayedVinyl.push(todaysHits[rand].album_name)
        }
        i++;
      }
  })
};

const displayArtistOfWeek = () => {
  let artists = [`Daniel Caesar`, `Kaash Paige`];
  artists.forEach((ele, ind) => {
    axios.get(`${myVyUrl}/artist/${ele}`).then((res) => {
      let artist = res.data;
      let img = document.createElement(`img`);
      img.src = artist.artist_img;
      img.classList.add(`imgVid`);
      img.id = artist.artist_name
      img.addEventListener(`click`, (event) => {
        localStorage.setItem("artist", event.target.id);
        window.location.href="./artistPage/index.html"
      })
      let div = document.querySelector(`#artistOfWeek${ind + 1}`)
      div.setAttribute(`artistName`, artist.artist_name)
      div.appendChild(img);
    });
  });
};

const vinylWidget = (event) => {
    let vinyl = event.target
    axios.get(`${myVyUrl}/album/${vinyl.id}`).then(res => {
        let album = res.data[0]
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
            `
            opBckgrnd.id = `opBckgrnd`
            widget.id = `widget`
            opBckgrnd.appendChild(widget)
            opBckgrnd.addEventListener(`click`, exitWidget)
            let main = document.querySelector(`main`)
            main.insertBefore(opBckgrnd, main.firstChild)
        
            document.querySelector(`#exitButton`).addEventListener(`clcik`, exitWidget)
            document.querySelector(`#widgetImg`).src = album.album_img
            document.querySelector(`#widgetTextAlbum`).textContent = album.album_name
            document.querySelector(`#widgetTextArtist`).textContent = album.artist_name
            document.querySelector(`#widgetTextArtist`).addEventListener(`click`, (event) => {
              localStorage.setItem("artist", event.target.textContent);
              window.location.href="./artistPage/index.html"
            })

            axios.get(`${myVyUrl}/tracks/${album.album_spotify_id}`).then(spotRes => {
                let i = 0
                while (i < spotRes.data.length && i < 16) {
                    let li = document.createElement(`li`)
                    if (i === 15 ) {
                        li.textContent = `  . . .`
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
                }}
    )
    })
}

const vinylInfoPreview = (event) => {

  const album = event.target.firstElementChild

  axios.get(`${myVyUrl}/album/${album.id}`).then((res) => {

    const vinyl = res.data[0];
    const previewDiv =  album.nextElementSibling
    console.log(previewDiv)
    previewDiv.id = `vinylPreviewInfo${vinyl.album_id}`;
    previewDiv.classList.add(`vinylPreviewInfo`)

    previewDiv.innerHTML = `
      <div id='previewNames'>
        <span id='previewAlbum'> ${vinyl.album_name}</span>
        <span id='previewArtist'>${vinyl.artist_name}</span>
      </div>

      <div>
        <span id='previewPrice'>$${vinyl.price}</span>
      </div>
    `
    if (document.querySelectorAll(`.vinylPreviewInfo`).length > 1) {
      let element = document.querySelectorAll(`.vinylPreviewInfo`)
      element.forEach(ele => {
        if (ele.id !== previewDiv.id) {
        ele.innerHTML = ``
        ele.className = ``}
      })
    } 
    
    document.querySelector(`#previewArtist`).addEventListener(`click`, () => {
      localStorage.setItem("artist", event.target.firstElementChild.alt);
        window.location.href="./artistPage/index.html"
    })

    event.target.addEventListener(`mouseleave`, (event) => {
      let element = document.querySelectorAll(`#vinylPreviewInfo${vinyl.album_id}`)
      element.forEach(ele => {
        ele.innerHTML = ``
        ele.className = ``
      })
    });
  });
};

const exitWidget = (event) => {
    if (event.target.id === `opBckgrnd`) {
      event.target.remove();
    } else if (event.target.id === `exitButton`) {
      event.target.parentElement.parentElement.remove()
    }
};

const displayAllGenres = () => {
    const genres = [1, 2, 3, 4, 5, 6, 7, 8]
    genres.forEach(ele => {
        axios.get(`${myVyUrl}/albumGenre/${ele}`).then(res => {
            let genre = res.data[1]
            let img = document.createElement(`img`)
            let div = document.createElement(`div`)

            div.classList.add(`genreImg`)
            img.src = genre.genre_img
            img.alt = genre.genre_name
            img.classList.add(`imgVid`)

            div.setAttribute(`genreName`, genre.genre_name.toUpperCase())
            div.appendChild(img)
            div.addEventListener(`click`, event => {
              localStorage.setItem(`q` , event.target.firstElementChild.alt)
              window.location.href = `./catalouge/index.html`
            })
            document.querySelector(`#allGenresContainer`).appendChild(div)
        })
    })
}

window.onload = () => {
  displayTodaysHits()

  displayArtistOfWeek()

  displayAllGenres()
};
