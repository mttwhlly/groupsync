// spotify app info
const clientId = "df4898ee8ef340deb1dd4fc684236dd4"; // Insert client ID here.
const redirectUri = "https://spotify-fetch.glitch.me/"; //callbackHave to add this to your accepted Spotify redirect URIs on the Spotify API.
let accessToken;


// define variables that reference elements on our page
const tracksList = document.getElementById("trackslist");
const searchForm = document.forms[0];
const searchInput = searchForm.elements["search"];
const connectButton = document.getElementById("connect");

// a helper function that creates a list item for a given track
const appendTrack = function (track) {
    const newListItem = document.createElement("li");
    newListItem.innerHTML = track;
    tracksList.appendChild(newListItem);
};

console.log("access token is" + accessToken);
if (accessToken) {
    console.log("we have an access token");
} else {
    console.log("we do not have an access token");
    searchForm.style.visibility = "hidden";
}


searchForm.onsubmit = function (event) {
    // stop our form submission from refreshing the page
    event.preventDefault();
    search(searchInput.value);

    // reset form
    searchInput.value = "";
    searchInput.focus();
};

connectButton.addEventListener("click", function () {
    console.log("Hi I was clicked");
    accessToken = getAccessToken();
});

//implicit grant flow

function getAccessToken() {
    console.log("get our access token");
    if (accessToken) {
        return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
        accessToken = accessTokenMatch[1];
        const expiresIn = Number(expiresInMatch[1]);
        window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
        window.history.pushState("Access Token", null, "/"); // This clears the parameters, allowing us to grab a new access token when it expires.
        searchForm.style.visibility = "visible";
        connectButton.style.visibility = "hidden";

        return accessToken;
    } else {
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}`;
        window.location = accessUrl;
    }
}

const search = function (term) {
    console.log("search");
    console.log(
        "request will be" + `https://api.spotify.com/v1/search?type=track&q=${term}`
    );

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            console.log(response)
            return response.json();
        })
        .then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            const tracks = jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
            console.log(tracks);
            tracks.forEach(function (track) {
                appendTrack(track.name);
            });
            return tracks;
        });
};
