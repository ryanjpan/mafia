module.exports = function(io, socket, rooms){
    function emitAlive(roomId){
        room = rooms[roomId];
        users = room.users;
        players = [];
        for(var i=0; i < users.length; i++){
            if(users[i].alive){
                players.push(users[i].name);
            }
        }
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('players_sent', {players: players});
            }
        }
    }

    socket.on('start_game', function(data){
        room = rooms[data.roomId];
	    var Rulebook = {
	            1:['Mafia'],
	            5:['Mafia', 'Angel', 'Civilian', 'Civilian', 'Civilian'],
	            6:['Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian'],
	            7:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian'],
	            8:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            9:['Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            10:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            11:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	            12:['Mafia', 'Mafia', 'Mafia', 'Angel', 'Cop', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian', 'Civilian'],
	    }
        var numRoles = {
            1: {'Mafia': 1},
            5: {'Mafia': 1, 'Angel': 1, 'Civilian': 3},
            6: {'Mafia': 1, 'Angel': 1, 'Civilian': 3, 'Cop': 1},
            7: {'Mafia': 2, 'Angel': 1, 'Civilian': 3, 'Cop': 1},
            8: {'Mafia': 2, 'Angel': 1, 'Civilian': 4, 'Cop': 1},
            9: {'Mafia': 2, 'Angel': 1, 'Civilian': 5, 'Cop': 1},
            10: {'Mafia': 3, 'Angel': 1, 'Civilian': 5, 'Cop': 1},
            11: {'Mafia': 3, 'Angel': 1, 'Civilian': 6, 'Cop': 1},
            12: {'Mafia': 3, 'Angel': 1, 'Civilian': 7, 'Cop': 1},
        }

	    // SHUFFLE
	    var users = room.users;
	    var roles = Rulebook[users.length];
	    for (var x=0; x<users.length;x++){
            users[x].role = roles[x];
            users[x].alive = true;
            if(io.sockets.connected[users[x].socketID]){
                io.sockets.connected[users[x].socketID].emit('update_roles', {role: users[x].role});
            }
	    }
        room.numUsersAlive = room.users.length;
        room.numRoles = numRoles[users.length];
        emitAlive(data.roomId);
        for (var x=0; x<users.length;x++){
            if(io.sockets.connected[users[x].socketID]){
                io.sockets.connected[users[x].socketID].emit('game_start', {});
            }
	    }

	    console.log(users);
    })
}
