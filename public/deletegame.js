
function deleteGame(gameID){
    $.ajax({
        url: '/games/' + gameID,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};

function deletePlayersGames(playerID, gameID){
    $.ajax({
        url: '/playersGames/playerID/' + playerID + '/gameID/' + gameID,
        type: 'DELETE',
        success: function(result){
            if(result.responseText != undefined){
                alert(result.responseText)
            }
            else {
                window.location.reload(true)
            }
        }
    })
};
