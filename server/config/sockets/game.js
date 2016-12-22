module.exports = function(io, socket, rooms){
    function emitAliveDead(roomId){
        //CHANGE TO EMIT ALIVE AND DEAD
        var room = rooms[roomId];
        var users = room.users;
        var players = [];
        for(var i=0; i < users.length; i++){
            if(users[i].alive){
                players.push(users[i].name);
            }
        }
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('players_sent', {players: players, aliveList: rooms[roomId].aliveList, deadList: rooms[roomId].deadList});
            }
        }
    }

    function tally(vote){
        var executed = "";
        var tie = false;
        for(var i in vote){
            if(executed === "" || vote[i] > vote[executed]){
                executed = i;
                tie = false;
            }
            else if (vote[i] === vote[executed]){
                tie = true;
            }
        }
        if(tie || executed === ""){
            return "";
        }
        else{
            return executed;
        }
    }

    function changeToDay(roomId){
        rooms[roomId].vote = {};
        var users = rooms[roomId].users;
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('set_daytime', {});
            }
        }
        rooms[roomId].vote = {}
    }

    function changeToNight(roomId){
        var users = rooms[roomId].users;
        rooms[roomId].mafiaexecute = "";
        rooms[roomId].saved = "";
        rooms[roomId].investigated = "";
        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('set_nighttime', {});
            }
        }

        rooms[roomId].mafiavote = {}
    }

    function mafiaDoneVoting(roomId){
        var voted, count = 0;
        for(var key in rooms[roomId].mafiavote){
            count++;
            if(voted === undefined){
                voted = rooms[roomId].mafiavote[key];
            }
            else{
                if(voted !== rooms[roomId].mafiavote[key]){
                    return false;
                }
            }
        }
        if(count !== rooms[roomId].aliveList['Mafia']){
            return false;
        }
        return true;
    }

    function gameEnd(roomId){
        var room = rooms[roomId]
        var users = rooms[roomId].users
        if(room.aliveList.Mafia > (Math.ceil(room.numUsersAlive/2))){
            console.log('Mafia Won')
            var endMSG = 'GAME OVER --- MAFIA has Won!'
            for(var i = 0; i < users.length; i++){
                if(io.sockets.connected[users[i].socketID]){
                    io.sockets.connected[users[i].socketID].emit('game_over', {end: endMSG});
                }
            }
            return true;
        }
        else if(room.aliveList.Mafia == 0){
            console.log('Village Won')
            var endMSG = 'GAME OVER --- CITIZENS have Won!'
            for(var i = 0; i < users.length; i++){
                if(io.sockets.connected[users[i].socketID]){
                    io.sockets.connected[users[i].socketID].emit('game_over', {end: endMSG});
                }
            }
            return true;
        }
        return false;
    }

    socket.on('day_vote', function(data){
        if(!rooms[data.roomId]){
            socket.emit('boot',{})
            return;
        }
        var vote = rooms[data.roomId].vote;

        if(rooms[data.roomId].numVoted){
            rooms[data.roomId].numVoted++;
        }
        else{
            rooms[data.roomId].numVoted = 1;
        }
        var users = rooms[data.roomId].users;
        if(vote[data['votedfor']]){
            vote[data['votedfor']] += 1
        }
        else{
            vote[data['votedfor']] = 1
        }

        for(var i=0; i < users.length; i++){
            if(io.sockets.connected[users[i].socketID]){
                io.sockets.connected[users[i].socketID].emit('vote_cast', {user: data['user'], vote: data['votedfor'] });
            }
        }

        if(rooms[data.roomId].numVoted === rooms[data.roomId].numUsersAlive){
            var executed = tally(vote);
            if (executed === ""){
                for(var i=0; i < users.length; i++){
                    if(io.sockets.connected[users[i].socketID]){
                        io.sockets.connected[users[i].socketID].emit('nooneexecuted', {});
                    }
                }
                setTimeout(function(){ changeToNight(data.roomId); }, 5000);
            }
            else{ //kill the user who won the vote
                var index;
                for(var i=0; i < users.length; i++){
                    if(users[i].name === executed){
                        index = i;
                    }
                }

                //update Alive and Dead List
                var aliveList = rooms[data.roomId].aliveList;
                var deadList = rooms[data.roomId].deadList;
                aliveList[users[index].role] -= 1
                deadList[users[index].role] += 1

                for(var i=0; i < users.length; i++){
                    if(io.sockets.connected[users[i].socketID]){
                        io.sockets.connected[users[i].socketID].emit('executed', {user: executed, role: users[index].role});
                    }
                }

                if(io.sockets.connected[users[index].socketID]){
                    users[index].alive = false;
                    io.sockets.connected[users[index].socketID].emit('set_dead', {});
                }
                emitAliveDead(data.roomId);
                if(gameEnd(data.roomId)){
                    return;
                }
                setTimeout(function(){ changeToNight(data.roomId); }, 5000);
            }
        }

    }); // end day vote

    socket.on('night_vote', function(data){
        if(!rooms[data.roomId]){
            socket.emit('boot',{})
            return;
        }
        console.log(data);
        var room = rooms[data.roomId];
        if(data.role == 'Mafia'){
            var users = room.users;
            for(var i = 0; i < users.length; i++){
                if(io.sockets.connected[users[i].socketID] && users[i].role === 'Mafia'){
                    io.sockets.connected[users[i].socketID].emit('mafia_votecast', {user: data.user, vote: data.votedfor });
                }
            }
            room.mafiavote[data.user] = data.votedfor;
            if(mafiaDoneVoting(data.roomId)){
                room.mafiaexecute = data.votedfor;
                //disable mafia voting
                for(var i = 0; i < users.length; i++){
                    if(io.sockets.connected[users[i].socketID] && users[i].role === 'Mafia'){
                        io.sockets.connected[users[i].socketID].emit('mafia_votedone', {});
                    }
                }
            }
        }
        else if(data.role == 'Angel'){
            room.saved = data.votedfor;
        }
        else if(data.role == 'Cop'){
            var users = room.users;
            room.investigated = data.votedfor;
            var cind, role;
            for(var i=0; i < user.length; i++){
                if(users[i].role === 'Cop'){
                    cind = i;
                }
                else if (users[i].name === room.investigated){
                    role = users[i].role;
                }
            }
            if(io.sockets.connected[users[cind].socketID]){
                var result;
                if(role === 'Mafia'){
                    result = ', (s)he is a Mafia';
                }
                else{
                    result = ', (s)he is not a Mafia';
                }
                io.sockets.connected[users[cind].socketID].emit('investigated', {user: room.investigated, result: result});
            }

        }

        if(room.mafiaexecute && (room.aliveList['Angel'] === 0 || room.saved) && (room.aliveList['Cop'] === 0 || room.investigated)){
            //all the night voting is done
            var users = room.users;
            if(room.saved === room.mafiaexecute){
                for(var i=0; i < users.length; i++){
                    if(io.sockets.connected[users[i].socketID]){
                        io.sockets.connected[users[i].socketID].emit('night_event', {user: room.saved, status: 'saved'});
                    }
                }
            }
            else{
                //someone died
                room.numUsersAlive--;
                var role, index;
                for(var i=0; i < users.length; i++){
                    if(users[i].name === room.mafiaexecute){
                        role = users[i].role;
                        users[i].alive = false;
                        index = i;
                    }
                }
                for(var i=0; i < users.length; i++){
                    if(io.sockets.connected[users[i].socketID]){
                        io.sockets.connected[users[i].socketID].emit('night_event', {user: room.mafiaexecute, status: 'died', role: role});
                    }
                }

                if(io.sockets.connected[users[index].socketID]){
                    io.sockets.connected[users[index].socketID].emit('set_dead', {});
                }

                var aliveList = rooms[data.roomId].aliveList
                var deadList = rooms[data.roomId].deadList
                aliveList[users[index].role] -= 1
                deadList[users[index].role] += 1
                emitAliveDead(data.roomId);
                if(gameEnd(data.roomId)){
                    return;
                }

            }
            setTimeout(function(){changeToDay(data.roomId);}, 5000);
        } // end check for night voting done

    }) // end night vote

}
