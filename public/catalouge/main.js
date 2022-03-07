const myVyUrl = `http://localhost:4005/api`;
const GENRES = [
  `pop`,
  `rap`,
  `edm`,
  `rock`,
  `r&b`,
  `latin`,
  `k-pop`,
  `country`,
  `metal`,
];
const DISPLAYED_RES = [];
const Q = localStorage.getItem(`q`).toLowerCase()

document.body
  .querySelector(`#navSearchForm`)
  .addEventListener(`submit`, (event) => {
    event.preventDefault();
    localStorage.setItem(`q`, event.target.firstElementChild.value);
    window.location.href = "./index.html";
});

document.body.querySelector(`#filter`).addEventListener(`submit`, event => {
  event.preventDefault()
  
})

const displayGenreSearch = (genreId) => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios.get(`${myVyUrl}/albumGenre/${genreId}`).then((res) => {
    res.data.forEach((ele) => {
      if (!DISPLAYED_RES.includes(ele.album_name)) {
        displayRes(ele);
        DISPLAYED_RES.push(ele.album_name);
      }
    });
  });
};

const displayDbSearch = () => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios.get(`${myVyUrl}/search/${Q}`).then((res) => {
    res.data.forEach((ele) => {
      if (!DISPLAYED_RES.includes(ele.album_name)) {
        displayRes(ele);
        DISPLAYED_RES.push(ele.album_name);
      }
    });
  });
};

const displayRes = (res) => {
  let img = document.createElement(`img`);
  let div = document.createElement(`div`);
  let previewDiv = document.createElement(`div`);

  img.id = res.album_id;
  img.alt = res.artist_name;
  img.src = res.album_img;
  img.classList.add(`imgVid`);
  img.addEventListener(`click`, vinylWidget);

  div.appendChild(img);
  div.appendChild(previewDiv);
  div.classList.add(`vinylImg`, `resultsVinyl`);
  div.addEventListener(`mouseenter`, vinylInfoPreview);

  document.querySelector(`#results`).appendChild(div);
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

const vinylInfoPreview = (event) => {
  const album = event.target.firstElementChild;

  axios.get(`${myVyUrl}/album/${album.id}`).then((res) => {
    const vinyl = res.data[0];
    const previewDiv = album.nextElementSibling;
    console.log(previewDiv);
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
      window.location.href = "../artistPage/index.html";
    });

    event.target.addEventListener(`mouseleave`, () => {
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
  if (GENRES.includes(Q)) {
    displayGenreSearch(GENRES.indexOf(Q) + 1);
  } else {
    displayDbSearch(Q);
  }
};
