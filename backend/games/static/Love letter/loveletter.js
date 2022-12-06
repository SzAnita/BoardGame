var x = 0;
var card_id = 1;

function get_card_src(card_nr) {
    if (card_nr == "1") {
        return guard;
    } else if (card_nr == "2") {
        return priest;
    } else if (card_nr == "3") {
        return baron;
    } else if (card_nr == "4") {
        return handmaid;
    } else if (card_nr == "5") {
        return prince;
    } else if (card_nr == "6") {
        return king;
    } else if (card_nr == "7") {
        return countess;
    } else if (card_nr == "8") {
        return princess;
    }
}

function protected_players() {
    var x = ''
    $.ajax({
        type: 'GET',
        url: 'protected_players',
        success: function(data) {
            //alert(data);
            x = data;
        }
    });
    return parseInt(x);
}

function countess_f(card) {
    countess = false;
    curr_card = $('#my_cards img').attr('class');
    if(card == '7' && (curr_card == '6' || curr_card == '5')) {
        countess = true;
    } else if((card == '5' || card == '6') && curr_card == '7') {
        countess = true;
    }
    return countess;
}

function get_curr_pl() {
    you = true;
    $.ajax({
        type: 'GET',
        url: 'get_curr',
        success: function(data) {
            response = JSON.parse(data);
            if(data == '0') {
                you = false;
            }
        },
    });
    return you;
}

function card_action(card_nr, id) {
    if (card_nr == '1') {
        $('[name=players]').show();
        $('[name=cards]').show();
        $('#get_card').click(function(){
            var player_id = $('input[name=player]:checked').val();
            var player = $('label[for='+player_id+']').text();
            var card = $('input[name=card]:checked').val();
            $.ajax({
                type: 'GET',
                url: 'guard',
                data: {
                    'player': player_id,
                    'card': card
                },
                success: function(data) {
                    $('[name=players]').hide();
                    $('[name=card]').hide();
                    alert("this is testing with returned data:" +data);
                    if (data == '0') {
                        alert(player+" didn't have card "+card);
                    } else if (data == '1') {
                        alert("You have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').text('Eliminated');
                    }
                }
            });
        });
    } else if(card_nr == '2') {
        $('[name=players]').show();
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player = $('label[for='+player_id+']').text();
            $.ajax ({
                type: 'GET',
                url: 'priest',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('[name=players]').hide();
                    alert(player+" has card "+data);
                }
            });
        });
    } else if(card_nr == '3') {
        $('[name=players]').show();
        $('#get_player').click(function() {
            $.ajax ({
                type: 'GET',
                url: 'baron',
                data: {
                    'player': player
                },
                success: function(data) {
                    if(response[0] == '1') {
                        alert(player+" has card "+response[1]+" so you have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').html('Eliminated');
                    } else if(response[0] == '-1') {
                        alert(player+" has card"+response[1]+" so you have been eliminated by"+player);
                        $('#'+player+' #eliminated').attr('class', 'true');
                        $('#'+player+' #eliminated').html('Eliminated');
                    } else if(response[0] == '0') {
                        alert("Both of you have the same cards");
                    }
                }
            });
        });
    } else if(card_nr == '4') {
        $.ajax ({
            type: 'GET',
            url: 'handmaid',
        })
    } else if(card_nr == '5') {
        $('[name=players]').show();
        var me = $('<input>');
        me.attr({
            'type': 'radio',
            'id': 'me',
            'name': 'player',
            'value': $('#user').attr('id')
        });
        var label2 = $('<label for="me">You</label><br>');
        $('#get_player').before(me, label2);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player = $('label[for='+player_id+']').text();
            if (player == 'me') {
                $('#my_cards img').attr('draggable', 'true');
            }
            $.ajax({
                type: 'GET',
                url: 'prince',
                data: {
                    'player': player_id
                },
            });
            $('[name=players]').show();
            me.remove();
            label2.remove();
        });
    } else if(card_nr == '6') {                
        $('[name=players]').show();
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player = $('label[for='+player_id+']').text();
            $.ajax({
                type: 'GET',
                url: 'king',
                data: {
                    'my_card': $('#my_cards img').attr('class'),
                    'player': player_id
                },
                success: function(data) {
                    $('#my_cards img').remove();
                    $img = get_card_src(data);
                    $card = $('<img>');
                    $card.attr({
                        'src': $img,
                        'id': 'card'+card_id,
                        'height': '100px',
                        'class': data,
                        'draggable': 'true',
                        'ondragstart': 'drag(event)'
                    });
                    card_id++;
                    $('#my_cards').append($card);
                }
            });
        });
    } else if(card_nr == '8') {
        $.ajax({
            type: 'GET',
            url: 'princess',
        });
        $('#eliminateyou').attr('class', 'true');
        $('#eliminateyou').html('Eliminated');
    }
}

function draw_card() {
    $('#'+x).remove();
    var id = $('#user').attr('class');
    $.ajax ({
        type: 'GET',
        url: 'draw_card',
        data: {
            user: id
        },
        success: function(data) {
            countess = false;
            if (data == '7' || data == '5' || data == '6') {
                countess = countess_f(data);
            }
            if (data != "0") {
                $img = get_card_src(data);
                $card = $('<img>');
                $card.attr({
                    'src': $img,
                    'id': 'card'+card_id,
                    'height': '100px',
                    'class': data,
                    'draggable': 'true',
                    'ondragstart': 'drag(event)'
                });
                card_id++;
                $('#my_cards').append($card);
                
            } 
            if (countess == true) {
                alert("You have to discard the card countess");
            }
        }
    })
    $('#my_cards img').attr('draggable', 'true');
    x++;
}
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    if(get_curr_pl() == true || $('#'+data).attr('class') == '8') {
        card_action($('#'+data).attr('class'), data);
        if ($('#'+data).attr('class') == '8') {
            $('#eliminateyou').attr('class') = 'true';
            $('#eliminateyou').html('Eliminated');
        }
        $.ajax ({
            type: 'GET',
            url: 'update_game',
            data: {
                'src': $('#'+data).attr('src'),
                'user': $('#user').attr('class'),
                'card_nr':$('#'+data).attr('class')
            },
            success: function() {
               $('.box_body').append('<p>Ajax request succeeded</p>');
            }
        });
    }
    $('#my_cards img').attr('draggable', 'false');
}

$(document).ready(function() {
    $nr_players = $('#nr_pl').attr('class');
    var card_nr = $('#card_nr').attr('class');

    if ($nr_players == "2") {
        $("#cards").before('<div id="Player1"><span>Player 1</span><span id="eliminate1" class="false"></span><div class="discarded"></div></div>');
        $img_src = get_card_src(card_nr);
        $you = $('<div id="you"><div id="discarded_you" ondrop="drop(event)" ondragover="allowDrop(event)"></div><span>You<br></span><span id="eliminateyou" class="false"></span></div>');
        $('.box-body').append($you);
        $div = $('<div id="my_cards"></div>');
        $card = $('<img>');
        $card.attr({
            'src': $img_src,
            'id': 'card'+card_id,
            'height': '100px',
            'class': card_nr,
            'draggable': "false",
            'ondragstart': 'drag(event)'
        });
        card_id++;
        $div.append($card);
        $('#you').append($div);
        var form1 = $('<form name="players" id="player"></form>');
        var player1_id = $('#player1').attr('class');
        var player1 = $('<input>');
        player1.attr({
            'type': 'radio',
            'id': 'player1',
            'name': 'player',
            'value': player1_id
        })
        var label1 = $('<label for="player1">Player 1</label><br>');
        var submit = $('<input type="button" value="Submit" id="get_player">');
        form1.append(player1, label1, submit);
        $('#popup_form').append(form1)
        $('[name=players]').hide();
        $('[name=cards]').hide();
    }
})
myInterval = setInterval(check_discarded, '5000');
function check_discarded() {
    $(document).ready(function() {
        $nr_players = $('#nr_pl').attr('class');

        var player1_discarded = $('#Player1 .discarded img').length;
        $.ajax ({
            type: 'GET',
            url: 'get_discarded',
            data: {
                'player1_discarded': player1_discarded,
                'user': $('#user').attr('class'),
                'player1': $('#player1').attr('class'),
                'eliminated': $('#eliminateyou').attr('class')
            },
            success: function(data) {
                response = JSON.parse(data)
                if (response[0] != "0") {
                    for (let x in response[0]) {
                        var card = $("<img>");
                        card.attr({
                        'src': response[0][x],
                        'height': '100px',
                        })
                        $('#Player1 .discarded').append(card);
                    }
                } 
                if (response[1] != '') {
                    if (response[1] == 'guard') {
                        alert("The current player chose to perform the effect of the card guard on you. S/He chose the card "+response[2]+", so you've been eliminated. Please discard your card.");
                        $('#my_cards img').attr('draggable', 'true');
                        $('#eliminateyou').attr('class', 'true');
                        $('#eliminateyou').html('Eliminated');
                    } else if (response[1] == 'priest') {
                        alert("The current player performed the effect of the card priest on you.");
                    } else if(response[1] == 'baron') {
                        if(response[3] == 'eliminate') {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[2]+" and you've been eliminated");
                            $('#eliminateyou').attr('class', 'true');
                            $('#eliminateyou').html('Eliminated');
                        } else if(response[3] == '0') {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[2]+" and you'd eliminated him/her");
                            $('#eliminate1').attr('class', 'true');
                            $('#eliminate1').html('Eliminated');
                        } else {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[2]+" so neither of you'd been eliminated");
                        }
                    } else if(response[1] == 'prince') {
                        alert("The current player has chosen to perform the effect of the card prince on you. Please discard your card, and draw a new card");
                        $('#my_cards img').attr('draggable', 'true')
                    } else if(response[1] == 'king') {
                        alert("The current player has chosen to perform on you the effect of the card king, so your cards have been traded");
                        $img = get_card_src(response[4]);
                        var card = "<img>";
                        card.attr({
                            'src': $img,
                            'height': '100px',
                            'draggable': 'false',
                            'ondragstart': 'drag(event)',
                            'id':'card'+card_id,
                            'class': response[4]
                        });
                        $('#my_cards').append(card);
                    }
                }
            }
        })
    })
}