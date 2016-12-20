app.controller('gameController', ['$scope','$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {
    sc.chatbox = "";
    if(!rs.user){
        loc.url('/');
        return;
    }
    sc.send_message = function(){
        rs.socket.emit('chat_send', {user: rs.user, message: sc.message, roomId: rs.room});
    }
    rs.socket.on('update_chat', function(data){
        sc.$apply(function(){
            sc.chatbox += '\n' + data.user + ': ' + data.message;
            sc.message = "";
        })
        //r.reload();
    });

}]);
