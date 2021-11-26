function searchGame() {
    //get title
    var gamesTitle  = document.getElementById('gamesTitle').value
    //construct the URL and redirect to it
    window.location = '/games/search/' + encodeURI(gamesTitle)
}