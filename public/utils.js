const axios = require(`axios`);

const displaytodaysHits = () => {
    axios.get(`${myVyUrl}getGenre/1`)
    let i = 0;
    let j = 1;
    let vinylDivSlide1 = document.createElement(`div`);
    vinylDivSlide1.classList.add(`vinylDivSlide`);
    let vinylDivSlide2 = document.createElement(`div`);
    vinylDivSlide2.classList.add(`vinylDivSlide`);
    let vinylDivSlide3 = document.createElement(`div`);
    vinylDivSlide3.classList.add(`vinylDivSlide`);

    const vinylDivSlides = [vinylDivSlide1, vinylDivSlide2, vinylDivSlide3];
    while (i <= todaysHits.length) {
      if (i === 4) {
        document
          .querySelector(`#todaysHitsSlide${j}`)
          .appendChild(vinylDivSlides[j - 1]);
        j++;
      } else if (i === 8) {
        document
          .querySelector(`#todaysHitsSlide${j}`)
          .appendChild(vinylDivSlides[j - 1]);
        j++;
      } else if (i === 12) {
        document
          .querySelector(`#todaysHitsSlide${j}`)
          .appendChild(vinylDivSlides[j - 1]);
        return;
      }
      let img = document.createElement(`img`);
      img.src = todaysHits[i].album_img;
      img.classList.add(`imgVid`, `vinylImg`);
      vinylDivSlides[j - 1].appendChild(img);
      i++;
    }
};

module.exports = {
 displaytodaysHits
}