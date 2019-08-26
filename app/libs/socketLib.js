const socketio          = require('socket.io');
const mangoose          = require('mongoose');
const shortId           = require('shortid');
const logger            = require('./loggerLib');
const events            = require('events');
const tokenLib          = require('./tokenLib');
const check             = require('./checkLib');
const resposne          = require('./responseLib');
const redisLib          = require('./redisLib');

let setServer = (server) => {
    //let allOnlineUsers  = [];
    let io              = socketio.listen(server);
    let myIo            = io.of('');
    myIo.on('connection',(socket)=>{
        socket.emit('verifyUser'," ");

        socket.on('set-user',(authToken)=>{
            console.log('set user called');
            tokenLib.verifyclaimsWithoutToken(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error',{status:500,error:'Please provide coorect token data'});
                }else{
                    console.log('user id verified,setting user details');
                    let currentUserId      = user.data;
                    socket.userId          = currentUserId;   
                    let fullName           = `${currentUserId.firstName} ${currentUserId.lastName}`;
                    let key                = currentUserId.userId;
                    let value              = fullName;

                    let setUserOnline   = redisLib.setANewOnlineUserInHash('onlineUsers',key,value,(err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            redisLib.getAllUsersInHash('onlineUsers',(err,result)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(`${fullName} is online`);
                                    socket.room = 'auksChat';
                                    socket.join(socket.room);
                                    socket.to(socket.room).broadcast.emit('online-user-list',result);
                                }
                            })
                        }
                    })
                    console.log(fullName +" is online userID: "+currentUserId.userId);
                    socket.emit(currentUserId.userId,"you are online");
                    // let usrObj = {userId:currentUserId.userId,fullName : fullName};
                    // allOnlineUsers.push(usrObj);
                    // console.log(allOnlineUsers);

                    // socket.room = 'auksChat';
                    // socket.join(socket.room);
                    // socket.to(socket.room).broadcast.emit('online-user-list',setUserOnline);
                }
            })
        }) //set user ends here

        socket.on('disconnect',()=>{
            console.log("user is disconnected");
            console.log(socket.userId);
            //Remove user form allOnline user array
            // var removeIndex = allOnlineUsers.map(function(user){
            //     return user.userId.indexOf(socket.userId); 
            // }) // Map function ends here
            // allOnlineUsers.splice(removeIndex,1);
            // console.log("Online users: "+allOnlineUsers);
            if(socket.userId){
                redisLib.deleteUserFromHash('onlineUsers',socket.userId);
                redisLib.getAllUsersInHash('onlineUsers',(err,result)=>{
                    if(err){
                        console.log("Some error occured " +err);
                    }else{
                        console.log(result);
                        socket.leave(socket.room);
                        socket.to(socket.room).broadcast.emit('online-user-list',result);
                        
                    }
                })
            }

            
        }); //Diconnect event


        socket.on('chat-msg',(data)=>{
            console.log('Socket chat message called');
            console.log(data);
            myIo.emit(data.receiverId,data);
        })// Chat message


        //keyPress Event
        socket.on('typing',(fullName)=>{
            socket.to(socket.room).broadcast.emit('typing',fullName);
        })

    }) // sockt initialization
} // Main event handler ends here

module.exports = {
    setServer : setServer
}