function updateGame(playerID){
    $.ajax({
        url: '/gamess/' + playerID,
        type: 'PUT',
        data: $('#update-game').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};