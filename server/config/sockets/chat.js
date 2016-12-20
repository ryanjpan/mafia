module.exports = function(io, socket, rooms){
    function updateUsers(roomId){
        var users = [];
        var roomUsers = rooms[roomId].users;
        for(var i=0; i < roomUsers.length; i++){
            users.push(roomUsers[i].name);
        }
        for(var i=0; i < roomUsers.length; i++){
            if(io.sockets.connected[roomUsers[i].socketID]){
                io.sockets.connected[roomUsers[i].socketID].emit('users_received', {users: users});
            }
        }
    }

    socket.on('chat_send', function(data){
        var users = rooms[data.roomId].users;
        var flag = false;
        for (var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('update_chat', {user:data.user, message: data.message});
            }
            else{
                users.splice(i, 1);
                i--;
                flag = true;
            }
        }
        if(flag){
            updateUsers(data.roomId);
        }
    })

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
            }
        }
        console.log(users);
    })
}
