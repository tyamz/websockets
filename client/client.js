$(() => {
    var socket = null;
    var name = '';

    function tag() {
        console.log(name);
    }

    var connect = () => {
        name = $('#name').val();
        socket = new WebSocket('ws://206.189.235.182:8080/?name=' + name);
        socket.onopen = (e) => {
            console.log(e);
            $('#connect-button').hide();
            $('#name').hide();
            $('#send-button').show();
            $('#message').show();
        };
        socket.onclose = (e) => {
            console.log(e);
        };
        socket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            $('#chatbox').append('<div class="card mb-2' + (data.private ? ' border-secondary' : '') + '"><div class="card-body"><h5 class="card-title text-primary name">' + data.name + '</h5>' + (data.private ? ' <small class="text-muted">private</small>' : '') + '<p class="card-text' + (data.private ? ' text-secondary' : '') + '">' + data.message + '</p></div></div>');
        };
        socket.onerror = (e) => {
            console.log(e);
        };
    }

    var send = (message) => {
        $('#message').val('');
        $('#chatbox').append('<div class="card mb-2"><div class="card-body"><h5 class="card-title">' + name + '</h5><p class="card-text">' + message + '</p></div></div>');
        socket.send(message);
    }

    $('#send-button').click(() => {
        send($('#message').val());
    });

    $('#connect-button').click(() => {
        connect();
    });

    $('#chatbox').on('click', '.name', function() {
        var message = $('#message').val();
        $('#message').val('@' + $(this).html() + ' ' + message);
        $('#message').focus();
    });
});
