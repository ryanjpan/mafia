app.controller('gameController', ['$scope','$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {
    if(!rs.user){
        loc.url('/');
        return;
    }

    sc.showstart = true;
    sc.chatbox = "";

    function joinInit(){
        rs.socket.emit('receive_users', {roomId: rs.room});
    }
    joinInit();

    //--------------------
    //END INITIALIZATIONS
    //-------------------

    function changeToDay(){
        sc.daytime = true;
        sc.votebox = "";
    }

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

    sc.start = function(){
        console.log('game start');
        rs.socket.emit('start_game', {roomId: rs.room});
        sc.showstart = !sc.showstart
    }

    rs.socket.on('update_roles', function(data){
        sc.role = data;
        sc.$apply();
    });

    rs.socket.on('players_sent', function(data){
        console.log(sc.players);
        sc.players = data.players;
        sc.$apply();
    })

    rs.socket.on('game_start', function(data){
        changeToDay();
        sc.$apply();
    })

    sc.dayVote = function(name){
        console.log('voted for', name);
        //rs.socket.emit('day_vote', {user: name, room: rs.room});
    }
}]);
