const socket = io('http://localhost:3000');
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InZTLUMtbkw2aiIsImlhdCI6MTU2NjgxNDU1ODk0NiwiZXhwIjoxNTY2OTAwOTU4LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJhdWtzQ2hhdCIsImRhdGEiOnsidXNlcklkIjoiMXFxbVZnd2Q4IiwiZmlyc3ROYW1lIjoiTmltaXNoIiwibGFzdE5hbWUiOiJWYWxpeWF2ZWV0dGlsIiwiZW1haWwiOiJuaW1pc2gudmFAZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjowfX0._YNLe-H3wGZQUWKe4vRqKca_l_tbjIx9a5R1KSdYrI0";
const userId = '1qqmVgwd8';

let chatMessage = {

    createdOn       : Date.now(),
    receiverId      : 'rEu8yh8cx',
    receiverName    : 'Test User',
    senderId        : userId,
    senderName      : 'Nimish V A'
}


let chatSocket = () =>{

    socket.on('verifyUser',(data)=>{
        console.log('Verifying user ' +data);
        socket.emit('set-user',authToken);
    })

    socket.on(userId,(data)=>{
        console.log("You have recieved a message");
        console.log(data);
    })


    socket.on('online-user-list',(data)=>{
        console.log("Online user list is updated")
        console.log(data);
    }) // Updating users ... Broadcasting method


    socket.on('typing',data => {
        console.log(data +" is typing");
    })
    

} // Main event handler;




$('#sendBtn').on('click',function(){

    let chatText = $('#messageText').val();
    chatMessage.message = chatText;
    socket.emit('chat-msg',chatMessage);

});

$('#messageText').on('keypress',function(){ 
    socket.emit('typing','Nimish');
}) // Keypress event


chatSocket();