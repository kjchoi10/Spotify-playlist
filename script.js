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
			app.retreiveArtistInfo(search);
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
				.map(item => item.id);
			const randomTracks = [];
			for(let i = 0; i < 30; i++){
				randomTracks.push(getRandomTrack(tracksResults));
			}
			const baseUrl = 'https://embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:'
			+ randomTracks.join();
			console.log(baseUrl);

			$('.loader').toggleClass('show');

			$('.playlist').html('<iframe src="' + baseUrl + '"height="400"' + '></iframe>' );
			console.log(randomTracks);
		});
};

app.retreiveArtistInfo = function(search) {
	$.when(...search) // ... is the spread operator takes an array and spreads them out as if spassing in one of a time don't need to know lenght
		.then((...results) => { // gathers all the data collected
			results = results.map(getFirstElement)
				.map(res => res.artists.items[0].id) // gets album id
			 	.map(id => app.getArtistAlbums(id));

			app.retreiveArtistTracks(results);
	});
};

app.retreiveArtistTracks = function(artistAlbums) {
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
