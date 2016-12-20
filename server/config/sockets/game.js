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

    
}
