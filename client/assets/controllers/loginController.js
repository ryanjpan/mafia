app.controller('loginController', ['$scope','$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {
    rs.socket = io.connect();

    function setUser(){
        rs.socket.emit('set_user', {room: sc.roomId, user: sc.userName});
    }

    rs.socket.on('user_response', function(data){
        console.log('got user response');
        if(data.valid){
            rs.user = sc.userName;
            rs.room = sc.roomId;
            loc.url('/game');
            sc.$apply();
        }
        else{
            console.log('user name invalid');
            loc.url('/')
            sc.$apply();
        }
    });

    sc.createRoom = function(){
       rs.socket.emit('create_room', {room: sc.roomId});
    }

    sc.joinRoom = function(){
       rs.socket.emit('join_room', {room: sc.roomId});
    }

    rs.socket.on('room_response', function(data){
        if(data.valid){
            setUser();
        }
        else{
            sc.userName = "";
            sc.roomId = "";
            loc.url('/');
            sc.$apply();
        }
    });

}]);
