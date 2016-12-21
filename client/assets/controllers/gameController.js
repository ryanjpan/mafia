app.controller('gameController', ['$scope', '$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {

    sc.showstart = true
    sc.chatbox = "";
    sc.started = false;
    sc.action = {
        'Mafia': 'Kill',
        'Cop': 'Investigate',
        'Angel': 'Save'
    }

    if(!rs.user){
        loc.url('/');
        return;
    }

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
        sc.showexecuted = false;
        sc.votecast = false;
    }

    function changeToNight(){
        sc.votecast = false;
        sc.daytime = false;
        if(sc.role == 'Mafia'){
            sc.mafiabox = "";
        }
    }

    rs.socket.on('users_received', function(data){
        // console.log(data);
        sc.chatcount = data.users.length;
        // console.log(sc.chatcount);
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
        sc.role = data.role;
        var image = {
            Civilian: 'citizen1',
            Mafia: 'mafia1',
            Cop: 'cop',
            Angel: 'doctor',
        }
        console.log(data.role)
        sc.image = image[data.role]
        console.log(sc.image)
        sc.$apply();
    });

    rs.socket.on('players_sent', function(data){
        console.log(sc.players);
        sc.players = data.players;
        sc.allroles = data.aliveList
        console.log(data.aliveList)
        sc.deadroles = data.deadList
        sc.$apply();
    });

    rs.socket.on('game_start', function(data){
        sc.started = true;
        sc.dead = false;
        changeToDay();
        sc.$apply();
    });

    sc.dayVote = function(name){
        if(!name){
            return;
        }
        sc.votecast = true;
        console.log('voted for', name);
        rs.socket.emit('day_vote', {votedfor: name, roomId: rs.room, user: rs.user, allroles: sc.allroles, deadroles: sc.deadroles});
    }

    rs.socket.on('vote_cast', function(data){
        console.log(data)
        sc.votebox += data.user + ' voted for ' + data.vote + '\n';
        sc.$apply();
    });

    rs.socket.on('executed', function(data){
        sc.showexecuted = true;
        console.log(data.executed, 'was executed');
        sc.executed = data.user;
        console.log(data)
        console.log(data.role)
        sc.executedrole = data.role;
        sc.$apply();
    });

    rs.socket.on('set_dead', function(data){
        sc.dead = true;
        console.log('you ded');
    });

    rs.socket.on('set_nighttime', function(data){
        changeToNight();
        sc.$apply();
    })

    sc.StartCheck = function(){
      if(1 < sc.chatcount && sc.chatcount < 5){
        return true;
      } else {
        return false;
      }
    };
}]);
