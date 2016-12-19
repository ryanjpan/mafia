module.exports = function(socket, rooms){
    function isIn(userArr, name){
        for(var i=0; i < userArr.length; i++){
            if(userArr[i].name === name){
                return true;
            }
        }
        return false;
    }

    socket.on('create_room', function(data){
        if(rooms[data.room]){
            console.log('room exists');
            socket.emit('room_response', {valid: false});
        }
        else{
            rooms[data.room] = {};
            rooms[data.room].users = [];
            socket.emit('room_response', {valid: true});
        }
    });

    socket.on('join_room', function(data){
        if(rooms[data.room]){
            socket.emit('room_response', {valid: true});
        }
        else{
            socket.emit('room_response', {valid: false});
        }
    });

    socket.on('set_user', function(data){
        console.log('user name', data.user);
        if(isIn(rooms[data.room].users, data.user)){
            socket.emit('user_response', {valid: false});
        }
        else{
            rooms[data.room].users.push({name: data.user});
            console.log(rooms[data.room].users);
            socket.emit('user_response', {valid: true});
        }
    });
}
