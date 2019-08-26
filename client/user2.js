const socket = io('http://localhost:3000');
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InRSZXpqVXE5ViIsImlhdCI6MTU2NjgxNDQ0OTU0OCwiZXhwIjoxNTY2OTAwODQ5LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJhdWtzQ2hhdCIsImRhdGEiOnsidXNlcklkIjoickV1OHloOGN4IiwiZmlyc3ROYW1lIjoiTmltaXNoIiwibGFzdE5hbWUiOiJWYWxpeWF2ZWV0dGlsIiwiZW1haWwiOiJuQGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6MH19.k-igDx8rE0ln5pG6hGTW9IDhez3Qom43-3fXE6dYbVU";
const userId = 'rEu8yh8cx';

let chatMessage = {

    createdOn       : Date.now(),
    receiverId      : '1qqmVgwd8',
    receiverName    : 'Nimish V A',
    senderId        : userId,
    senderName      : 'Test User'
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

    socket.on('typing',data => {
        console.log(data +" is typing");
    })
    

} // Main event handler;


$('#sendBtn').on('click',function(){

    let chatText = $('#messageText').val();
    chatMessage.message = chatText;
    socket.emit('chat-msg',chatMessage);
    
});


chatSocket();