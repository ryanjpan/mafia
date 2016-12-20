module.exports = function(io, socket, rooms){
    socket.on('chat_send', function(data){
        var users = rooms[data.roomId].users;
        for (var i=0; i < users.length; i++){
            io.sockets.connected[users[i].socketID].emit('update_chat', {user:data.user, message: data.message});
        }
    })
}
