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
const SEARCH_QUERY = {
  lowerPrice: 0,
  upperPrice: 10000,
};
const Q = localStorage.getItem(`q`).toLowerCase();
const ALL_ARTISTS = localStorage.getItem(`allArtists`);
const ALL_RECORDS = localStorage.getItem(`allRecords`);

document.body
  .querySelector(`#navSearchForm`)
  .addEventListener(`submit`, (event) => {
    event.preventDefault();
    localStorage.setItem(`allArtists`, false);
    localStorage.setItem(`allRecords`, false);
    localStorage.setItem(`q`, event.target.firstElementChild.value);
    window.location.href = "./index.html";
});

document.body.querySelector(`#filter`).addEventListener(`submit`, (event) => {
  event.preventDefault();
  filterSearch();
});

document.querySelector(`select`).addEventListener(`click`, (event) => {
  let orderBy = event.target.value;
  if (orderBy !== `orderBy` && orderBy !== SEARCH_QUERY.orderBy) {
    SEARCH_QUERY.orderBy = orderBy;
    filterSearch();
  }
});

document.body.querySelector(`#allArtists`).addEventListener(`click`, event => {
  localStorage.setItem(`allArtists`, true)
  localStorage.setItem(`allRecords`, false)
  localStorage.setItem(`q`, event.target.textContent)
  window.location.href = `./index.html`
})

document.body.querySelector(`#allRecords`).addEventListener(`click`, event => {
  localStorage.setItem(`allRecords`, true)
  localStorage.setItem(`allArtists`, false)
  localStorage.setItem(`q`, event.target.textContent)
  window.location.href = `./index.html`
})

const filterSearch = () => {
  let contentType = document.querySelector(
    `input[name='contentType']:checked`
  ).value;

  let shopPrice = document.querySelector(`input[name='shopPrice']:checked`);

  if (shopPrice) shopPrice = shopPrice.value.split(`-`);

  if (shopPrice) {
    SEARCH_QUERY.lowerPrice = shopPrice[0];
    SEARCH_QUERY.upperPrice = shopPrice[1];
  }

  document.querySelector(`#results`).innerHTML = ``;
  DISPLAYED_RES.length = 0;


  if (contentType === `record`) {
    if (ALL_RECORDS === `true` || ALL_ARTISTS === `true`) {
      allAlbumsSearch();
    } else {
      recordSearch();
    }
  } else if (contentType === `artist`) {
    if (ALL_ARTISTS === `true` || ALL_RECORDS === `true`) {
      allArtistsSearch();
    } else {
      artistSearch();
    }
  }
};

const genreSearch = (genreId) => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();

  axios.get(`/api/albumGenre/${genreId}`).then((res) => {
    res.data.forEach((ele) => {
      if (!DISPLAYED_RES.includes(ele.album_name)) {
        displayRecordRes(ele);
        DISPLAYED_RES.push(ele.album_name);
      }
    });
  });
};

const recordSearch = () => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios
    .get(`/api/search/${Q}/?orderBy=${SEARCH_QUERY.orderBy}`)
    .then((res) => {
      res.data.forEach((ele) => {
        if (!DISPLAYED_RES.includes(ele.album_name)) {
          if (
            ele.price > SEARCH_QUERY.lowerPrice &&
            ele.price < SEARCH_QUERY.upperPrice
          ) {
            displayRecordRes(ele);
            DISPLAYED_RES.push(ele.album_name);
          }
        }
      });
    });
};

const artistSearch = () => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios
    .get(`/api/search/${Q}/?orderBy=${SEARCH_QUERY.orderBy}`)
    .then((res) => {
      res.data.forEach((ele) => {
        if (!DISPLAYED_RES.includes(ele.artist_name)) {
          if (
            ele.price > SEARCH_QUERY.lowerPrice &&
            ele.price < SEARCH_QUERY.upperPrice
          ) {
            displayArtistSearch(ele);
            DISPLAYED_RES.push(ele.artist_name);
          }
        }
      });
    });
};

const allArtistsSearch = () => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios
    .get(`/api/allArtists/?orderBy=${SEARCH_QUERY.orderBy}`)
    .then((res) => {
      res.data.forEach((ele) => displayArtistSearch(ele));
    });
};

const allAlbumsSearch = () => {
  document.querySelector(`#queryLabel`).textContent = Q.toUpperCase();
  axios
    .get(`/api/allAlbums/?orderBy=${SEARCH_QUERY.orderBy}`)
    .then((res) => {
      res.data.forEach((ele) => {
          if (
            ele.price > SEARCH_QUERY.lowerPrice &&
            ele.price < SEARCH_QUERY.upperPrice
          ) {
            displayRecordRes(ele);
          }
        });
    });
};

const displayRecordRes = (res) => {
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

const displayArtistSearch = (res) => {
  let img = document.createElement(`img`);
  let div = document.createElement(`div`);
  let button = document.createElement(`button`);

  div.classList.add(`resultsArtist`);
  div.setAttribute(`artistName`, res.artist_name);
  div.appendChild(img);
  div.appendChild(button);

  button.classList.add(`previewArtistButton`);
  button.addEventListener(`click`, (event) => {
    let artist = event.target.parentElement.getAttribute(`artistname`);
    localStorage.setItem(`artist`, artist);
    window.location.href = `../artistPage/index.html`;
  });
  button.textContent = `Discover`;

  img.id = res.artist_name;
  img.src = res.artist_img;
  img.classList.add(`imgVid`);
  img.addEventListener(`click`, (event) => {
    localStorage.setItem("artist", event.target.id);
    window.location.href = "../artistPage/index.html";
  });
  document.querySelector(`#results`).appendChild(div);
};

const addToCart = (record) => {
  let cart = localStorage.getItem(`cart`);
  const ID = record.id;
  if (!cart) {
    cart = ID + ``;
    popUpNotif(`Added To Cart`);
  } else {
    cart = cart.split(`,`);
    if (!cart.includes(ID)) {
      cart.push(ID);
      cart.join(`,`);
      popUpNotif(`Added To Cart`);
    } else {
      popUpNotif(`Already In Cart`);
    }
  }
  localStorage.setItem(`cart`, cart);
};

const popUpNotif = (message) => {
  let div = document.createElement(`div`);
  div.classList.add(`popUpNotif`);
  div.textContent = message;

  document.querySelector(`#widgetTextDiv`).appendChild(div);
  setTimeout(() => div.remove(), 1500);
};

const vinylWidget = (event) => {
  let vinyl = event.target;
  axios.get(`/api/album/${vinyl.id}`).then((res) => {
    let album = res.data[0];
    const opBckgrnd = document.createElement(`div`);
    const widget = document.createElement(`div`);

    widget.innerHTML = `
        <i id='exitButton' class="fa-solid fa-xmark"></i>
        <div id='widgetImgDiv'><img id='widgetImg' class='imgVid'></div>
        <div id='widgetTextDiv'>
            <span id='widgetTextAlbum'></span>
            <span id='widgetTextArtist'></span>
            <span id='widgetPriceText'></span>
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

    document
      .querySelector(`#widgetBuyButton`)
      .addEventListener(`click`, (event) => {
        let record =
          event.target.parentElement.previousElementSibling.firstElementChild;
        addToCart(record);
      });

    let img = document.querySelector(`#widgetImg`);
    img.classList.add(`imgVid`);
    img.src = album.album_img;
    img.id = album.album_id;
    img.alt = album.album_name;

    document.querySelector(`#exitButton`).addEventListener(`click`, exitWidget);
    document.querySelector(`#widgetPriceText`).textContent = `$` + album.price;
    document.querySelector(`#widgetTextAlbum`).textContent = album.album_name;
    document.querySelector(`#widgetTextArtist`).textContent = album.artist_name;
    document
      .querySelector(`#widgetTextArtist`)
      .addEventListener(`click`, (event) => {
        localStorage.setItem("artist", event.target.textContent);
        window.location.href = "../artistPage/index.html";
      });

    axios.get(`/api/tracks/${album.album_spotify_id}`).then((spotRes) => {
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

  axios.get(`/api/album/${album.id}`).then((res) => {
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

window.onpageshow = () => {
  document.getElementsByName(`shopPrice`).forEach(ele => {
    ele.checked = false
  })
  document.querySelector(`#results`).innerHTML = ``;
   if (GENRES.includes(Q)) {
     localStorage.setItem(`allArtists`, false);
     localStorage.setItem(`allRecords`, false);
    genreSearch(GENRES.indexOf(Q) + 1);
  } else if (ALL_ARTISTS === `true`) {
    document.querySelector(`#artistradio`).checked = true
    allArtistsSearch();
  } else if (ALL_RECORDS === `true`) {
    allAlbumsSearch();
  } else {
    localStorage.setItem(`allArtists`, false);
    localStorage.setItem(`allRecords`, false);
    recordSearch(Q);
  }
}