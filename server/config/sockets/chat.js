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
}
