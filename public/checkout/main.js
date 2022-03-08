let TOTAL = 0;
const CART = localStorage.getItem(`cart`);

document.body
  .querySelector(`#navSearchForm`)
  .addEventListener(`submit`, (event) => {
    event.preventDefault();
    localStorage.setItem(`allArtists`, false);
    localStorage.setItem(`allRecords`, false);
    localStorage.setItem(`q`, event.target.firstElementChild.value);
    event.target.firstElementChild.value = ``;
    window.location.href = "../catalouge/index.html";
});

document.querySelector(`#placeOrderButton`).addEventListener(`click`, event => {
  let cart = localStorage.getItem(`cart`)
  if (!cart) {
    document.querySelector(`#cartItemsDiv`).innerHTML = `
    <div id='emptyCart'>
    <span>Your Cart Is Empty<br>
    <i class="fa-regular fa-face-meh"></i>
    </span>
    </div>
    `
  } else {
    document.querySelector(`#cartItemsDiv`).innerHTML = `
    <div id='emptyCart'>
    <span>Thank You For Your Purchase!<br>
    <i class="fa-solid fa-face-laugh-beam"></i>
    <i class="fa-solid fa-credit-card"></i>
    </span>
    </div>
    `
    localStorage.removeItem(`cart`)
  }
})

document.body.querySelector(`#allArtists`).addEventListener(`click`, event => {
  localStorage.setItem(`allArtists`, true)
  localStorage.setItem(`allRecords`, false)
  localStorage.setItem(`q`, event.target.textContent)
  window.location.href = `../catalouge/index.html`
})

document.body.querySelector(`#allRecords`).addEventListener(`click`, event => {
  localStorage.setItem(`allRecords`, true)
  localStorage.setItem(`allArtists`, false)
  localStorage.setItem(`q`, event.target.textContent)
  window.location.href = `../catalouge/index.html`
})

const displayCartItem = (cartItemsId) => {
  document.querySelector(`#cartItemsDiv`).innerHTML = `
  <span id="cartItemsLabel">Cart</span>
  `
  let i = 0;
  while (i < cartItemsId.length) {
    axios.get(`/api/album/${cartItemsId[i]}`).then((res) => {
      let record = res.data[0];

      let div = document.createElement(`div`);
      let imgDiv = document.createElement(`div`);
      let img = document.createElement(`img`);
      let artistText = document.createElement(`span`);
      let albumText = document.createElement(`span`);
      let priceText = document.createElement(`span`);
      let removeItem = document.createElement(`i`);

      removeItem.classList.add(`fa-solid`, `fa-xmark`, `removeItem`);
      removeItem.addEventListener(`click`, removeItems)

      artistText.textContent = record.artist_name;
      albumText.textContent = record.album_name;
      albumText.classList.add(`albumCartName`);
      priceText.textContent = `$` + record.price;
      priceText.classList.add(`price`);

      img.id = record.album_id;
      img.src = record.album_img;
      img.alt = record.artist_name;
      img.classList.add(`imgVid`);

      imgDiv.classList.add(`checkoutImg`);
      imgDiv.appendChild(img);

      div.appendChild(imgDiv);
      div.appendChild(albumText);
      div.appendChild(artistText);
      div.appendChild(priceText);
      div.appendChild(removeItem);

      div.classList.add(`cartItem`);

      document.querySelector(`#cartItemsDiv`).appendChild(div);

      displayOrderSummary(record);

    });
    i++
  }

};

const displayOrderSummary = (record) => {
  let div = document.createElement(`div`);
  let albumName = document.createElement(`span`);
  let price = document.createElement(`span`);

  albumName.textContent = record.album_name;
  price.textContent = `$` + record.price;

  TOTAL += Math.round(+record.price * 100) / 100

  div.appendChild(albumName);
  div.appendChild(price);

  document.querySelector(`#orderSummaryItems`).appendChild(div);
  displayCharges()
};

const displayCharges = () => {
  let shippingPrice = document.querySelector(`#shippingPrice`);
  let deliveryPrice = document.querySelector(`#deliveryPrice`);
  let preTaxTotal = document.querySelector(`#preTaxPrice`);
  let taxDiv = document.querySelector(`#taxPrice`);
  let orderTotal = document.querySelector(`#orderTotalPrice`)


  shippingPrice.textContent = `$` + Math.round((TOTAL * .05) * 100) / 100
  deliveryPrice.textContent = `$` + Math.round((TOTAL * .07) * 100) / 100
  taxDiv.textContent = `$` + Math.round((TOTAL * .04) * 100) / 100
  
  let arr = [+shippingPrice.textContent.replace(`$`, ``),
  +deliveryPrice.textContent.replace(`$`, ``),
  TOTAL]

  preTaxTotal.textContent = `$` + (Math.round(arr.reduce((ele, tot) => ele += tot) * 100) / 100)

  let arr2 = [
    +preTaxTotal.textContent.replace(`$`, ``),
    +taxDiv.textContent.replace(`$`, ``)
  ]

  orderTotal.textContent = `$` + (Math.round(arr2.reduce((ele, tot) => ele += tot) * 100) / 100)
};

const removeItems = (event) => {
  recordId = event.target.parentElement.firstElementChild.firstElementChild.id

  let cart = localStorage.getItem(`cart`)
  cart = cart.split(`,`)
  cart.splice(cart.indexOf(recordId), 1)
  TOTAL = 0
  displayCartItem(cart)
  cart = cart.join(`,`)
  if (cart.length < 1) window.location.href = `./index.html`
  document.querySelector(`#orderSummaryItems`).innerHTML = ``
  localStorage.setItem(`cart`, cart)
}

window.onload = () => {
  if (CART) {
    displayCartItem(CART.split(`,`));
  } else {
    document.querySelector(`#cartItemsDiv`).innerHTML = `
    <div id='emptyCart'>
    <span>Your Cart Is Empty <br>
    <i class="fa-solid fa-ghost"></i>
    </span>
    </div>
    `
  }
};
