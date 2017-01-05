const app = {};

app.apiUrl = 'https://api.spotify.com/v1';

//Allow the user to enter some names
app.events = function () {
	$('form').on('submit', function (e) {
		e.preventDefault();
		let artists = $('input[type=search]').val();
		artists = artists.split(',');
		let search = artists.map(artistName => app.searchArtist(artistName));
		
		app.retreiveArtistInfo(search);
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


// THen get tracks
app.getArtistTracks = function() {

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
			albums = albums.map(getFirstElement);
				.map(res => res.items)
				.reduce((prev, curr) => [...prev, ...curr], [])
			console.log(albums);
		});
};

// gets the first item in the array to retrieveArtist Info
const getFirstElement = {item} => item[0];

//Then build playlist

app.init = function() {
	app.events();
};

$(app.init);
