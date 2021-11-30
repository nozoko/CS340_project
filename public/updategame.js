function updateGame(gameID){
    $.ajax({
        url: '/games/' + gameID,
        type: 'PUT',
        data: $('#update-game').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
