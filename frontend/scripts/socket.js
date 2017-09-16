const socket = io('localhost:3000');


socket.on('feed', data => {
    console.log(data);
});