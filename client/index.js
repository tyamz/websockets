$(() => {
    var socket = null;
    var name = '';

    var tag = () => {
        console.log(name);
    }

    var scrollToBottom = () => {
        $('html, body').animate({scrollTop:$(document).height()}, 'slow');
    }

    var connect = () => {
        name = $('#name').val();
        socket = new WebSocket('ws://localhost:8080/?name=' + name);
        socket.onopen = (e) => {
            console.log(e);
            $('#connect-button').hide();
            $('#name-box').hide();
            $('#send-button').show();
            $('#disconnect-button').show();
            $('#message-box').show();
            $('#alert').hide();
        };
        socket.onclose = (e) => {
            console.log(e);
            $('#connect-button').show();
            $('#name-box').show();
            $('#send-button').hide();
            $('#disconnect-button').hide();
            $('#message-box').hide();
        };
        socket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            if(data.error) {
                $('#alert').html(data.message).show();
            } else {
                $('#alert').hide();
                $('#chatbox').append('<div class="card my-1' + (data.private ? ' border-secondary' : '') + '"><div class="card-body"><h5 class="card-title text-info name">' + data.name + '</h5>' + (data.private ? ' <small class="text-muted">private</small>' : '') + '<p class="card-text' + (data.private ? ' text-secondary' : '') + '">' + data.message + '</p></div></div>');
            }
            scrollToBottom();
        };
        socket.onerror = (e) => {
            console.log(e);
        };
    }

    var disconnect = () => {
        socket.close(1000, "Closing.");
    }

    var send = (message) => {
        $('#message').val('');
        $('#chatbox').append('<div class="card my-1"><div class="card-body"><h5 class="card-title">' + name + '</h5><p class="card-text">' + message + '</p></div></div>');
        socket.send(message);
        scrollToBottom();
    }

    $('#send-button').click(() => {
        send($('#message').val());
    });

    $('#connect-button').click(() => {
        connect();
    });

    $('#disconnect-button').click(() => {
        disconnect();
    });

    $('#message').on('keypress', function (e) {
        if(e.which === 13) {
            e.preventDefault();
            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            send($('#message').val());

            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
        }
   });

    $('#chatbox').on('click', '.name', function() {
        var message = $('#message').val();
        $('#message').val('@' + $(this).html() + ' ' + message);
        $('#message').focus();
    });
});
