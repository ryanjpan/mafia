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

    var vote = {}

    socket.on('day_vote', function(data){
        var users = rooms[data.roomId].users
        if(vote[data['votedfor']]){
            vote[data['votedfor']] += 1
            console.log(vote)
        }
        else{
            vote[data['votedfor']] = 1
            console.log(vote)
        }
        console.log(data['user'])
        console.log(data['votedfor'])
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('vote_cast', {user: data['user'], vote: data['votedfor'] });
            }
        }
    })
    
}
