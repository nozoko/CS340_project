function searchPlayer() {
    //get gamertag
    var playerGamertag  = document.getElementById('playersGamertag').value
    //construct the URL and redirect to it
    window.location = '/players/search/' + encodeURI(playerGamertag)
}