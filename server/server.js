require(`dotenv`).config()
const express = require(`express`)
const cors = require(`cors`)
const ctrl = require(`./controller`)
const path = require(`path`)

const app = express()
app.use(express.json())

app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, `../public/index.html`))
})
app.use(express.static(path.join(__dirname, '../public')))

// Endpoints
app.get(`/api/artist/:artistName`, ctrl.getArtist)
app.get(`/api/artistAlbums/:artistId`, ctrl.getAlbums)
app.get(`/api/album/:albumId`, ctrl.getSingleAlbum)
app.get(`/api/tracks/:albumSpotifyId`, ctrl.getTracks)
app.get(`/api/search/:q`, ctrl.searchDB)
app.get(`/api/albumGenre/:genreId`, ctrl.getAlbumGenre) 
app.get(`/api/artistGenre/:artistId`, ctrl.getArtistGenre)
app.get(`/api/relatedArtists/:id`, ctrl.getRelatedArtist)
app.get(`/api/allArtists`, ctrl.getAllArtists)
app.get(`/api/allAlbums`, ctrl.getAllAlbums)
app.post(`/api/artist/add`, ctrl.inbedArtistData)

// Server
const port = process.env.PORT || process.env.PORT_NUMBER

app.listen(port, () => console.log(`Have you boys seen my goyard garments on ${port}`))