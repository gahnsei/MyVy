require(`dotenv`).config();
const axios = require(`axios`);
const Sequelize = require(`sequelize`);

const { DATABASE_URL, SPOTIFY_AUTH, COVER_AUTH } = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: `postgres`,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

const oAuthHeader = {
  headers: {
    Authorization: `Basic ${SPOTIFY_AUTH}`,
    "Content-Type": `application/x-www-form-urlencoded`,
  },
};

const coverrHeader = {
  headers: {
    Authorization: `Bearer ${COVER_AUTH}`,
  },
  params: {
    page_size: 100,
    urls: true,
  },
};

const oAuthBody = "grant_type=client_credentials";
const spotifyBaseUrl = `https://api.spotify.com/v1`;
const coverrBaseUrl = `https://api.coverr.co/videos/?query=`;

const getAcessToken = async () => {
  let accessToken;
  let tokenType;
  await axios
    .post(`https://accounts.spotify.com/api/token`, oAuthBody, oAuthHeader)
    .then((res) => {
      accessToken = res.data.access_token;
      tokenType = res.data.token_type;
    })
    .catch((err) => console.log(err));

  return {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  };
};

const artistChecker = async (artistName) => {
  let artistFound = false;
  await sequelize
    .query(
      `
  SELECT artist_name FROM artists
  WHERE artist_name = '${artistName}'
  ;`
    )
    .then((dbRes) => {
      if (typeof dbRes[0][0] !== `undefined`) {
        artistFound = true;
        console.log(`-------------${dbRes[0][0].artist_name}-----------------`);
      }
    });
  return artistFound;
};

const addArtist = async (artist) => {
  const acessToken = await getAcessToken();
  let artistId,
    artistSpotifyId,
    artistName,
    artsitImg,
    artistBackground,
    popularity;

  await axios
    .get(`${spotifyBaseUrl}/search?q=${artist}&type=artist&limit=1`, acessToken)
    .then((res) => {
      artistInfo = res.data.artists.items[0];
      artistSpotifyId = artistInfo.id;
      artistName = artistInfo.name;
      artsitImg = artistInfo.images[0].url;
      popularity = artistInfo.popularity;
    })
    .catch((err) => console.log(err));

  if (await artistChecker(artistName)) {
    return;
  }

  await axios
    .get(`${coverrBaseUrl}city`, coverrHeader)
    .then((res) => {
      let rand = Math.round(Math.random() * 101);
      artistBackground = res.data.hits[rand].urls.mp4;
    })
    .catch((err) => console.log(err));

  await sequelize
    .query(
      `
  INSERT INTO artists (artist_spotify_id, artist_name, artist_img, artist_background, popularity)
  VALUES
  ('${artistSpotifyId}', 
  '${artistName.replace(/'/g, `''`)}',  
  '${artsitImg}',
  '${artistBackground}',
  ${popularity})
  RETURNING artist_id
  ;`
    )
    .then((dbRes) => {
      artistId = dbRes[0][0].artist_id;
      console.log(
        `${artistId} ${artistName} ${artistSpotifyId} Inserted Into Artists`
      );
    })
    .catch((err) => console.log(err));

  return { artistId, artistSpotifyId };
};

const addAlbums = async (artistId, artistSpotifyId) => {
  const accessToken = await getAcessToken();
  const albums = [];

  await axios
    .get(
      `${spotifyBaseUrl}/artists/${artistSpotifyId}/albums?include_groups=album`,
      accessToken
    )
    .then((res) => {
      const arr = [];
      res.data.items.forEach((ele) => arr.push(ele.name));
      const set = Array.from(new Set(arr));

      res.data.items.forEach((ele) => {
        if (set.includes(ele.name)) {
          albums.push(ele);
          const index = set.indexOf(ele.name);
          set.splice(index, 1);
        }
      });
    })
    .catch((err) => console.log(err));

  albums.forEach(async (ele) => {
    let albumSpotifyId, albumName, albumImg, price, stockQuantity, releaseDate;

    albumSpotifyId = ele.id;
    albumName = ele.name;
    albumImg = ele.images[0].url;
    releaseDate = ele.release_date;

    if (releaseDate.length < 8) {
      releaseDate = `2022-02-26`;
    }

    price = Math.round((Math.random() * 140 + 20) * 100) / 100;
    stockQuantity = Math.round(Math.random() * 100);

    await sequelize
      .query(
        `
    INSERT INTO albums (album_spotify_id, album_name, artist_id, album_img, price, stock_quantity, release_date)
    VALUES (
      '${albumSpotifyId}',
      '${albumName.replace(/'/g, `''`)}',
      ${artistId},
      '${albumImg}',
      ${price},
      ${stockQuantity},
      '${releaseDate}'
    )
    ;`
      )
      .then((dbRes) => console.log(`${albumName} Added`));
  });
};

const addGenres = async () => {
  const accessToken = await getAcessToken();
  sequelize
    .query(
      `
  SELECT * FROM artists
  OFFSET 150
  LIMIT 50
  ;`
    )
    .then((dbRes) => {
      dbRes[0].forEach((ele) => {
        const genres = [
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
        const genreID = [...genres];
        axios
          .get(
            `${spotifyBaseUrl}/artists/${ele.artist_spotify_id}`,
            accessToken
          )
          .then(async (axRes) => {
            axRes.data.genres.forEach((element) => {
              element.split(` `).forEach((genre) => {
                if (genres.includes(genre)) {
                  genres.splice(genres.indexOf(genre), 1);
                  sequelize
                    .query(
                      `
                  INSERT INTO artist_genres (artist_id, genre_id)
                  VALUES (${ele.artist_id}, ${genreID.indexOf(genre) + 1})
                  ;`
                    )
                    .then((dbRes2) => console.log(ele.artist_name, genre));
                }
              });
            });
          });
      });
    });
};

const inbedArtistData = async (req, res) => {
  const { artists } = req.body;
  artists.forEach(async (ele) => {
    const artistInfo = await addArtist(ele);
    if (typeof artistInfo === `undefined`) {
      res.status(400).send(`Already In Database`);
      return;
    }
    const { artistId, artistSpotifyId } = artistInfo;
    await addAlbums(artistId, artistSpotifyId);
    res.status(200).send(`${ele} Added | id = ${artistId}`);
  });
};

const getArtist = (req, res) => {
  const { artistName } = req.params;
  sequelize
    .query(
      `
    SELECT * FROM artists ar
    JOIN artist_genres ag
    ON ar.artist_id = ag.artist_id
    WHERE artist_name = '${artistName.replace(/'/g, `''`)}'

  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0][0]))
    .catch((err) => console.log(err));
};

const getAlbums = (req, res) => {
  const { artistId } = req.params;

  sequelize
    .query(
      `
  SELECT * FROM artists ar
  JOIN albums al
  ON ar.artist_id = al.artist_id
  WHERE ar.artist_id = ${artistId}
  ORDER BY al.release_date DESC
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0]))
    .catch((err) => console.log(err));
};

const getSingleAlbum = (req, res) => {
  const { albumId } = req.params;
  sequelize
    .query(
      `
  SELECT * FROM albums al
  JOIN artists ar
  ON ar.artist_id = al.artist_id
  WHERE album_id = ${albumId}
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0]))
    .catch((err) => console.log(err));
};

const getTracks = async (req, res) => {
  const { albumSpotifyId } = req.params;

  const accessToken = await getAcessToken();

  axios
    .get(`${spotifyBaseUrl}/albums/${albumSpotifyId}/tracks`, accessToken)
    .then((axRes) => res.status(200).send(axRes.data.items))
    .catch((err) => console.log(err));
};

const getAlbumGenre = (req, res) => {
  const { genreId } = req.params;
  sequelize
    .query(
      `
  SELECT * FROM albums al
  JOIN artists ar
  ON ar.artist_id = al.artist_id
  JOIN artist_genres ag
  ON ar.artist_id = ag.artist_id
  JOIN genres g
  ON g.genre_id = ag.genre_id
  WHERE ag.genre_id IN (${genreId})
  ORDER BY ar.popularity DESC
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0]))
    .catch((err) => res.status(400).send(err));
};

const getArtistGenre = (req, res) => {
  let { artistId } = req.params;
  sequelize
    .query(
      `
  SELECT * FROM artist_genres ag
  JOIN genres g
  ON g.genre_id = ag.genre_id
  WHERE ag.artist_id = ${artistId}
  `
    )
    .then((dbRes) => res.status(200).send(dbRes[0]));
};

const getRelatedArtist = (req, res) => {
  const { id } = req.params;
  sequelize
    .query(
      `
  SELECT * FROM artist_genres ag
  JOIN artists ar
  ON ar.artist_id = ag.artist_id
  WHERE genre_id IN (${id})
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0]));
};

const getAllArtists = (req, res) => {
  let orderBy = `artist_name`;

  if (req.query.orderBy !== `undefined`) {
    if (
      req.query.orderBy === `popularity DESC` ||
      req.query.orderBy === `popularity ASC`
    ) {
      orderBy = req.query.orderBy;
    }
  }
  sequelize
    .query(
      `
  SELECT * FROM artists ar
  ORDER BY ${orderBy}
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0])).catch;
};

const getAllAlbums = (req, res) => {
  let orderBy = `al.album_name`;

  if (req.query.orderBy !== `undefined`) {
      orderBy = req.query.orderBy;
  }
  sequelize
    .query(
      `
  SELECT * FROM albums al
  JOIN artists ar
  ON ar.artist_id = al.artist_id
  ORDER BY ${orderBy}
  ;`
    )
    .then((dbRes) => res.status(200).send(dbRes[0])).catch;
}

const searchDB = (req, res) => {
  let { q } = req.params;
  q = q.replace(/'/g, `''`);

  let orderBy = `ar.popularity DESC`;

  if (req.query.orderBy !== `undefined`) {
    orderBy = req.query.orderBy;
  }

  sequelize
    .query(
      `
      SELECT * FROM albums al
      JOIN artists ar
      ON ar.artist_id = al.artist_id
      JOIN artist_genres ag
      ON al.artist_id = ag.artist_id
      JOIN genres g
      ON ag.genre_id = g.genre_id
      WHERE lower(ar.artist_name) LIKE '%${q}%'
      OR lower(al.album_name) LIKE '%${q}%'
      OR lower(g.genre_name) LIKE '%${q}%'
      ORDER BY ${orderBy}
      ;`
    )
    .then((dbRes) => {
      let arr = Array.from(new Set(dbRes[0]));
      res.status(200).send(arr);
    });
};

const changePrice = () => {
  sequelize
    .query(
      `
    SELECT * FROM albums;
  ;`
    )
    .then((dbRes) => {
      const album = dbRes[0];
      album.forEach((ele) => {
        const price = Math.round((Math.random() * 150 + 15) * 100) / 100;
        sequelize
          .query(
            `
      UPDATE albums
      SET price = ${price}
      WHERE album_id = ${ele.album_id}
      ;`
          )
          .then((res) => console.log(`Price Changed`));
      });
    });
};

module.exports = {
  inbedArtistData,
  getArtist,
  getAlbums,
  getSingleAlbum,
  getTracks,
  getAlbumGenre,
  searchDB,
  changePrice,
  addGenres,
  addAlbums,
  getArtistGenre,
  getRelatedArtist,
  getAllArtists,
  getAllAlbums
};
