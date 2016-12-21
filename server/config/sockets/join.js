module.exports = function(io, socket, rooms){
    function isIn(userArr, name){
        for(var i=0; i < userArr.length; i++){
            if(userArr[i].name === name){
                return true;
            }
        }
        return false;
    }

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

    socket.on('receive_users', function(data){
        updateUsers(data.roomId);
    })


    socket.on('create_room', function(data){
        if(rooms[data.room]){
            socket.emit('room_response', {valid: false});
        }
        else{
            rooms[data.room] = {};
            rooms[data.room].users = [];
            rooms[data.room].started = false;
            socket.emit('room_response', {valid: true});
        }
    });

    socket.on('join_room', function(data){
        if(rooms[data.room] && !rooms[data.room].started){
            socket.emit('room_response', {valid: true});
        }
        else{
            socket.emit('room_response', {valid: false});
        }
    });

    socket.on('set_user', function(data){
        if(isIn(rooms[data.room].users, data.user)){
            socket.emit('user_response', {valid: false});
        }
        else{
            rooms[data.room].users.push({name: data.user, socketID: socket.id});
            socket.emit('user_response', {valid: true});
        }
    });
}
