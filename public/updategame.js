function updateGame(gameID){
    $.ajax({
        url: '/gamess/' + gameID,
        type: 'PUT',
        data: $('#update-game').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
