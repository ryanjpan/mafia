var rooms = {};

console.log('setting up sockets');
module.exports = function(server){

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function(socket){
        console.log('using sockets');
        console.log(socket.id);
        require('./sockets/join.js')(socket, rooms);
        require('./sockets/chat.js')(io, socket, rooms);
    });
}
