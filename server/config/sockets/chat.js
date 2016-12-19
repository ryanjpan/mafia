module.exports = function(io, socket, rooms){
    socket.on('chat_send', function(data){
        io.emit('update_chat', {user: data.user, message: data.message});
    })
}
