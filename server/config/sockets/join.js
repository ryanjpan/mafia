module.exports = function(io, socket, rooms){
    function isIn(userArr, name){
         for(var i=0; i < userArr.length; i++){
             if(userArr[i].name === name){
                return {valid:true, index:i}
            }
        }
        return {valid:false};
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
        if(!rooms[data.roomId]){
            socket.emit('boot',{})
            return;
        }
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
        console.log("logging join room data");
        console.log(data);
      // console.log(rooms[data.room]['users'][0]['socketID']);
        if(rooms[data.room] && !rooms[data.room].started){
            socket.emit('room_response', {valid: true});
        }
        else{
          console.log("in else statement");
          // console.log(io.sockets.connected[rooms[data.room]['users'][i]['socketID']]);

          if(rooms[data.room]){ // room exists and game started
            for(var i = 0; i<rooms[data.room]['users'].length;i++){
              if(rooms[data.room]['users'][i]['name']===data.user){ // if user is in room already
                console.log(io.sockets.connected[rooms[data.room]['users'][i]['socketID']]);
                if(io.sockets.connected[rooms[data.room]['users'][i]['socketID']]){ //if user is connected
                  rooms[data.room]['users'][i]['socketID'] = socket.id //update user id
                  socket.emit('user_response', {valid: true})

                  return;
                }
              }
            }
          }
            socket.emit('room_response', {valid: false});
        }
    });

    socket.on('set_user', function(data){
        var info = isIn(rooms[data.room].users, data.user)
        if(info.valid){
          if(!io.sockets.connected[rooms[data.room]['users'][info.index]['socketID']]){ //if user is  not connected
            rooms[data.room]['users'][info.index]['socketID'] = socket.id //update user id
            socket.emit('user_response', {valid: true})
            updateUsers(data.room)
            return;
          }
            socket.emit('user_response', {valid: false});
        }
        else{
            rooms[data.room].users.push({name: data.user, socketID: socket.id});
            socket.emit('user_response', {valid: true});
        }
    });
}
