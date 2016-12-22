module.exports = function(io, socket, rooms){

    function emitAliveDead(roomId){
        //CHANGE TO EMIT ALIVE AND DEAD
        var room = rooms[roomId];
        var users = room.users;
        var players = [];
        for(var i=0; i < users.length; i++){
            if(users[i].alive){
                players.push(users[i].name);
            }
        }
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('players_sent', {players: players, aliveList: rooms[roomId].aliveList, deadList: rooms[roomId].deadList});
            }
        }
    }

	function shuffle (array) {
		var temp = 0
		for(var k=0;k<3;k++){	
			for (var i=0; i < array.length; i++) {
				var j = Math.floor(Math.random() * (i + 1))
				var temp = array[i]
				array[i] = array[j]
				array[j] = temp
			}
		}
		return array
	}

    socket.on('start_game', function(data){

      var room = rooms[data.roomId];
	    var Rulebook = {
	            5:['Mafia', 'Angel', 'Civilian', 'Civilian', 'Civilian'],
	            6:['Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian'],
	            7:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian'],
	            8:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            9:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            10:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            11:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            12:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	    }
        // var numRoles = {
        //     1: {'Mafia': 1},
        //     5: {'Mafia': 1, 'Angel': 1, 'Civilian': 3},
        //     6: {'Mafia': 1, 'Angel': 1, 'Civilian': 3, 'Cop': 1},
        //     7: {'Mafia': 2, 'Angel': 1, 'Civilian': 3, 'Cop': 1},
        //     8: {'Mafia': 2, 'Angel': 1, 'Civilian': 4, 'Cop': 1},
        //     9: {'Mafia': 2, 'Angel': 1, 'Civilian': 5, 'Cop': 1},
        //     10: {'Mafia': 3, 'Angel': 1, 'Civilian': 5, 'Cop': 1},
        //     11: {'Mafia': 3, 'Angel': 1, 'Civilian': 6, 'Cop': 1},
        //     12: {'Mafia': 3, 'Angel': 1, 'Civilian': 7, 'Cop': 1},
        // }

  	    var users = room.users;
  	    var preshuffle = Rulebook[users.length];
  	    var roles = shuffle(preshuffle);

  	    room['mafiaList'] = []

  	    for (var x=0; x<users.length;x++){
			users[x].role = roles[x];
			users[x].alive = true;
			if(roles[x]=='Mafia'){
				room['mafiaList'].push(users[x].name)
			}
			if(io.sockets.connected[users[x].socketID]){
				io.sockets.connected[users[x].socketID].emit('update_roles', {role: users[x].role});
			}
  	    }

  	    for (var x=0; x<users.length;x++){
            if(io.sockets.connected[users[x].socketID]){
            	if(roles[x]=='Mafia'){
                	io.sockets.connected[users[x].socketID].emit('mafia_list', {mafiaList: room['mafiaList']});
            	}
            }
	    }
			room.numUsersAlive = room.users.length;
			// room.numRoles = numRoles[users.length];
			room.started = true;
			room.vote = {};

        for (var x=0; x<users.length;x++){
            if(io.sockets.connected[users[x].socketID]){
                io.sockets.connected[users[x].socketID].emit('game_start', {});
            }
	    }

	    room['deadList'] = {
	    	Mafia: 0,
	    	Cop: 0,
	    	Angel: 0,
	    	Civilian: 0,
	    }

	    room['aliveList'] = {
	    	Mafia: 0,
	    	Cop: 0,
	    	Angel: 0,
	    	Civilian: 0,
	    }

	    for(var i=0;i<users.length;i++){
	    	room['aliveList'][users[i].role] += 1
	    }

        emitAliveDead(data.roomId);
    })
}
