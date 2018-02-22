Player.list = {};
Player.onConnect = function (socket, username) {
    var map = 'forest';
    if (Math.random() < 0.5) {
        map = 'field';
    }

    // This is where we actually CREATE the player
    var player = Player({
        username: username,
        // CLASS: ??
        id: socket.id,
        map: map
    });

    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });

    socket.on('changeMap', function (data) {
        if (player.map === 'field') {
            player.map = 'forest';
        } else {
            player.map = 'field';
        }
        console.log(player.map);
    });

    socket.on('sendMsgToServer', function (data) {
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', player.username + ': ' + data);
        }
    });

    socket.on('sendPmToServer', function (data) {
        var recipientSocket = null;
        for (var i in Player.list) {
            if (Player.list[i].username === data.username) {
                recipientSocket = SOCKET_LIST[i];
            }
        }
        if (recipientSocket === null) {
            socket.emit('addToChat', 'SORRY! ' + data.username + ' is OFFLINE.');
        } else {
            recipientSocket.emit('addToChat', 'PM from ' + player.username + ': ' + data.message);
            socket.emit('addToChat', 'PM to: ' + data.username + ': ' + data.message);
        }


    });

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllInitPack(),
        bullet: Bullet.getAllInitPack()
    });

}

Player.getAllInitPack = function () {

    var players = [];
    for (var i in Player.list) {
        players.push(Player.list[i].getInitPack());
    }
    return players;

}

Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}

Player.update = function () {
    var pack = [];
    for (var i in Player.list) {
        var player = Player.list[i];
        // Changes movement speed
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
};