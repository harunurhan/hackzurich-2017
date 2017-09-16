(function () {
    const socket = io('localhost:8080');
    socket.on('feed', data => {
        console.log(data);
    });
})();
