function updatePlayer(playerID){
    $.ajax({
        url: '/players/' + playerID,
        type: 'PUT',
        data: $('#update-player').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};