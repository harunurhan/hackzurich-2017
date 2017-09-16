import io from 'socket';

io.on('feed', data => {
    console.log(data);
});