// Firebase database
var config = {
	apiKey: "AIzaSyAMLEBscqVljeKS-OQpWfmPzKaTrcu71oE",
	authDomain: "spotify-playlist-2850a.firebaseapp.com",
	databaseURL: "https://spotify-playlist-2850a.firebaseio.com/",
	storageBucket: "spotify-playlist-2850a.appspot.com",
};
firebase.initializeApp(config);
let database = firebase.database();

//Connect with Firebase database
$('form').on('submit', function(e) {
	e.preventDefault();
	let userInput = $('input[type=search]').val();
	console.log(userInput);
	let artistSearch = database.ref('artists');
	artistSearch.push({
		artist: userInput
	});
});

const app = {};

app.apiUrl = 'https://api.spotify.com/v1';

//Allow the user to enter some names
app.events = function () {
	$('form').on('submit', function (e) {
		e.preventDefault();
		$('.loader').toggleClass('show');
		let artists = $('input[type=search]').val();

		// worked on this during 1:1 session
		let artistIndex = artists.indexOf(','); // indexOf returns either 1 or -1

		if(artistIndex === -1) {
			alert('You must have at least two artists.');
			$('.loader').toggle('.hide');
		} else {
			artists = artists.split(',');
			let search = artists.map(artistName => app.searchArtist(artistName));
			app.retrieveArtistInfo(search);
		}
	});
};

//Go to Spotify and get the artists.
app.searchArtist = (artistName) => $.ajax({
	url: 'https://api.spotify.com/v1/search',
	method: 'GET',
	dataType: 'json',
	data: {
		q: artistName,
		type: 'artist'
	}
});


//With the ids we want to get albums
app.getArtistAlbums = (artistId) => $.ajax({
	url: 'https://api.spotify.com/v1/artists/' + artistId +  '/albums',
	method: 'GET',
	dataType: 'json',
	data: {
		album_type: 'album',
	}
});


// Then get tracks
app.getArtistTracks = (id) => $.ajax({
	url: 'https://api.spotify.com/v1/albums/' + id + '/tracks',
	method: 'GET',
	dataType: 'json',
});

// build playlist
app.buildPlayList = function(tracks) {
	$.when(...tracks)
		.then((...tracksResults) => {
			tracksResults = tracksResults.map(getFirstElement)
			  .map(item => item.items)
				.reduce(flatten, [])
				.map(item => [item.name, item.id]);

			// Make a hashtable of track name and id
			// 1. I need to give names for the keys and values
			const artistObj = {};
			const tracks = [];
			for(let i = 0; i < tracksResults.length; i++){
				artistObj[tracksResults[i][1]] = tracksResults[i][0];
				tracks.push(tracksResults[i][1]);
			}
			// console.log(artistObj);
			// console.log(tracks);
			const randomTracks = [];

			// gets the random tracks using ids
			for(let j = 0; j < 30; j++){
				randomTracks.push(getRandomTrack(tracks));
			}

			const randomTrackName = [];

			// finds the random song anems
			for(let z = 0; z < randomTracks.length; z++){
				randomTrackName.push(artistObj[randomTracks[z]]);
			}

			console.log(randomTrackName);

			// add random track name into firebase
			let trackName = database.ref('songs');
			trackName.push({
				songs: randomTrackName
			});

			const baseUrl = 'https://embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:'
			+ randomTracks.join();

			$('.loader').toggleClass('show');

			$('.playlist').html('<iframe src="' + baseUrl + '"height="400"' + '></iframe>' );
		});
};

app.retrieveArtistInfo = function(search) {
	$.when(...search) // ... is the spread operator takes an array and spreads them out as if spassing in one of a time don't need to know lenght
		.then((...results) => { // gathers all the data collected
			results = results.map(getFirstElement)
				.map(res => res.artists.items[0].id) // gets album id
			 	.map(id => app.getArtistAlbums(id));

			app.retrieveArtistTracks(results);
	});
};

app.retrieveArtistTracks = function(artistAlbums) {
	$.when(...artistAlbums)
		.then((...albums) => {
			albumIds = albums.map(getFirstElement)
				.map(res => res.items)
				.reduce((prev, curr) => [...prev, ...curr], [])
				.map(album => album.id)
				.map(ids => app.getArtistTracks(ids));
			app.buildPlayList(albumIds);
		});
};

// gets the first item in the array to retrieveArtist Info
const getFirstElement = (item) => item[0];

// flatten function
const flatten = (prev, curr) => [...prev, ...curr];

// build random playlist track
const getRandomTrack = (trackArray) => {
	const randoNum = Math.floor(Math.random() * trackArray.length);
	return trackArray[randoNum];
};

// build popular playlist rack
const getPopularTrack = (trackArray) => {
	const popular = 0;
};
//Then build playlist

app.init = function() {
	app.events();
};

$(app.init);
