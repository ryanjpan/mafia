app.controller('gameController', ['$scope', '$http', '$location', '$rootScope', '$route',
function(sc, http, loc, rs, r) {

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

    rs.socket.on('boot', function(data){
        loc.url('/');
        sc.$apply();
    })

    function joinInit(){
        console.log('emitting receive');
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
        sc.nooneexecuted = false;
    }

    function changeToNight(){
        sc.votecast = false;
        sc.daytime = false;
        sc.nightevent = "";
        if(sc.role == 'Mafia'){
            sc.mafiabox = "";
        }
        if(sc.role == 'Cop'){
            sc.investigateStr = "";
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
        sc.image = image[data.role]
        sc.$apply();
    });
    rs.socket.on('mafia_list', function(data){
        sc.mafiaList = data.mafiaList
        sc.mafia = true
        sc.$apply();
    })

    rs.socket.on('players_sent', function(data){
        sc.players = data.players;
        sc.players.push('');
        sc.allroles = data.aliveList
        sc.deadroles = data.deadList
        sc.$apply();
    });

    rs.socket.on('game_start', function(data){
        sc.started = true;
        sc.dead = false;
        changeToDay();
        sc.$apply();
    });

    rs.socket.on('game_over', function(data){
        sc.gameover = data.end
        sc.gameend = true
        sc.$apply();
    })

    sc.dayVote = function(name){
        if(name === undefined){
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
        sc.executed = data.user;
        sc.executedrole = data.role;
        sc.$apply();
    });

    rs.socket.on('nooneexecuted', function(data){
        sc.nooneexecuted = true;
        sc.$apply();
    })

    rs.socket.on('set_dead', function(data){
        sc.dead = true;
        console.log('you ded');
    });

    rs.socket.on('set_nighttime', function(data){
        changeToNight();
        sc.$apply();
    })

    rs.socket.on('set_daytime', function(data){
        changeToDay();
        sc.$apply();
    })

    sc.StartCheck = function(){
      if(1 < sc.chatcount && sc.chatcount < 5){
        return true;
      } else {
        return false;
      }
    };

    sc.nightVote= function(vote){
        if(vote === ""){
            //at night must vote for someone
            return;
        }
        if(sc.role !== 'Mafia'){
            //if not mafia, can only vote once
            sc.votecast = true;
        }
        console.log(vote);
        rs.socket.emit('night_vote', {user: rs.user, votedfor: vote, role: sc.role, roomId: rs.room});
    }

    rs.socket.on('mafia_votedone', function(data){
        sc.votecast = true;
        sc.$apply();
    })

    rs.socket.on('night_event', function(data){
        if(data.status === 'saved'){
            sc.nightevent = data.user + ' was attacked in his home last night but the doctor saved him';
        }
        else{
            sc.nightevent = data.user + ' was found dead in his home last night, (s)he was a ' + data.role;
        }
        sc.$apply();
    })

    rs.socket.on('mafia_votecast', function(data){
        if(sc.role === 'Mafia'){
            sc.mafiabox += data.user + ' voted for ' + data.vote + '\n';
        }
        sc.$apply();
    })

    rs.socket.on('investigated', function(data){
        sc.investigateStr = "You investigated " + data.user + data.result;
        sc.$apply();
    })

}]);
