app.controller('gameController', ['$scope','$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {

    sc.chatbox = "";
    if(!rs.user){
        loc.url('/');
        return;
    }
    function joinInit(){
        rs.socket.emit('receive_users', {roomId: rs.room});
    }
    joinInit();

    rs.socket.on('users_received', function(data){
        console.log(data);
        sc.users = "";
        for(var i=0; i<data.users.length; i++){
            sc.users += data.users[i] + '\n';
        }
        sc.$apply();
    });

  sc.send_message = function(){
      rs.socket.emit('chat_send', {user: rs.user, message: sc.message, roomId: rs.room});
  }
  rs.socket.on('update_chat', function(data){
      sc.chatbox += data.user + ': ' + data.message + '\n';
      sc.message = "";
      sc.$apply()
  });

}]);
