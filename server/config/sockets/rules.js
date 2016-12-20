module.exports = function(io, socket, rooms){
    socket.on('start_game', function(data){
	    Rulebook = {
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
	    
	    // SHUFFLE
	    var users = rooms[data.roomId].users;
	    var roles = Rulebook[users.length];
	    for (var x=0; x<users.length;x++){
	        for (i in roles){
	            users[x].role = roles[i];
	            users[x].alive = true;
	            if(io.sockets.connected[users[i].socketID]){
	                io.sockets.connected[users[i].socketID].emit('update_roles', {role: users[x].role});
	            }             
	        }
	    }
	    console.log(users);
    })
}