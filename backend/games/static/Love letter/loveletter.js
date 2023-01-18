var x = 0;
var card_id = 1;

function get_card_src(card_nr) {
    if (card_nr == "1") {
        return Guard;
    } else if (card_nr == "2") {
        return Priest;
    } else if (card_nr == "3") {
        return Baron;
    } else if (card_nr == "4") {
        return Handmaid;
    } else if (card_nr == "5") {
        return Prince;
    } else if (card_nr == "6") {
        return King;
    } else if (card_nr == "7") {
        return Countess;
    } else if (card_nr == "8") {
        return Princess;
    }
}

function players_form(prince) {
    var choose = false;
    var div = $('<div id="popup_form"></div>');
    var form = $('<form name="players" id="player">Choose a player:<br></form>');
    var player1_id = $('#player1').attr('class');
    $.ajax({
        type:'GET',
        url:'protected_players',
        data: {
            'player':player1_id
        },
        success:function(data) {
            if(JSON.parse(data) == 0) {
                var player1 = $('<input>');
                player1.attr({
                    'type': 'radio',
                    'id': '_player1',
                    'name': 'player',
                    'value': player1_id,
                    'checked': 'false'
                });
                var label1 = $('<label for="_player1">Player 1</label><br>');
                form.append(player1, label1);
                choose = true;
            }
        }
    });
    
    if (parseInt($('#nr_pl').attr('class')) > 2) {
        var player2_id = $('#player2').attr('class');
        $.ajax({
            type:'GET',
            url:'protected_players',
            data: {
                'player':player2_id
            },
            success:function(data) {
                if(JSON.parse(data) == 0) {
                    var player2 = $('<input>');
                    player2.attr({
                        'type': 'radio',
                        'id': '_player2',
                        'name': 'player',
                        'value': player2_id,
                    });
                    var label2 = $('<label for="_player2">Player 2</label><br>');
                    form.append(player2, label2);
                    choose = true;
                }
            }
        });
    }
    if (parseInt($('#nr_pl').attr('class')) == 4) {
        var player3_id = $('#player3').attr('class');
        $.ajax({
            type:'GET',
            url:'protected_players',
            data: {
                'player':player3_id
            },
            success:function(data) {
                if(JSON.parse(data) == 0) {
                     var player3 = $('<input>');
                    player3.attr({
                        'type': 'radio',
                        'id': '_player3',
                        'name': 'player',
                        'value': player3_id,
                        'checked': 'false'
                    });
                    var label3 = $('<label for="_player3">Player 3</label><br>');
                    form.append(player3, label3);
                    choose = true;
                }
            }
        });
    }
    if (prince == 1) {
        var me = $('<input>');
        me.attr({
            'type': 'radio',
            'id': 'me',
            'name': 'player',
            'value': $('#user').attr('id')
        });
        var labelme = $('<label for="me">You</label><br>');
        form.append(me, labelme); 
    }
    var submit = $('<input type="button" value="Submit" id="get_player">');
    form.append(submit);
    $(div).append(form);
    $('#popup_guard').after(div);
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

function guard() {
    players_form(0);
        $('#popup_guard').show();
        $('#get_player').click(function(){
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            var card = $('input[name=card]:checked').val();
            $.ajax({
                type: 'GET',
                url: 'guard',
                data: {
                    'player': player_id,
                    'card': card
                },
                success: function(data) {
                    $('#popup_form').remove();
                    $('#popup_guard').hide();
                    if (data == '0') {
                        alert(player+" didn't have card "+card);
                    } else if (data == '1') {
                        alert("You have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').text('Eliminated');
                    }
                    $("#"+player_nr).prop("checked", "false");
                    $("#"+card).prop("checked", "false");
                    $.ajax({
                        type: 'GET',
                        url: 'end_turn'
                    });
                }
            });
        });
}

function priest() {
    players_form(0);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            $.ajax ({
                type: 'GET',
                url: 'priest',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    alert(player+" has card "+data);
                    $.ajax({
                        type: 'GET',
                        url: 'end_turn'
                    });
                }
            });
        });
}

function baron() {
    players_form(0);
        var player_id = $('input[name=player]:checked').val();
        var player_nr = $('input[name=player]:checked').attr('id');
        var player = $('label[for='+player_nr+']').html();
        $('#get_player').click(function() {
            $.ajax ({
                type: 'GET',
                url: 'baron',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    response = JSON.parse(data);
                    if(response[0] == 1) {
                        alert(player+" has card "+data[1]+" so you have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').html('Eliminated');
                    } else if(response[0] == -1) {
                        alert(player+" has card"+data[1]+" so you have been eliminated by"+player);
                        $('#eliminateyou').attr('class', 'true');
                        $('#eliminateyou').html('Eliminated');
                    } else if(response[0] == 0) {
                        alert("Both of you have the same cards");
                    } else {
                        alert(data);
                        alert("Data is not of type string");
                    }
                    $.ajax({
                        type: 'GET',
                        url: 'end_turn'
                    });
                }
            });
        });
}

function handmaid() {
    alert('handmaid');
    $.ajax ({
        type: 'GET',
        url: 'handmaid',
        success: function() {
            $.ajax({
                type: 'GET',
                url: 'end_turn'
            });
        }
    });
}

function prince() {
    players_form(1);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            if (player == 'me') {
                $('#my_cards img').attr('draggable', 'true');
            }
            $.ajax({
                type: 'GET',
                url: 'prince',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    $.ajax({
                        type: 'GET',
                        url: 'end_turn'
                    });
                }
            });
        });
}

function king() {
    players_form(0);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            $.ajax({
                type: 'GET',
                url: 'king',
                data: {
                    'my_card': $('#my_cards img').attr('class'),
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    $('#my_cards img').remove();
                    $img = get_card_src(data);
                    $card = $('<img>');
                    $card.attr({
                        'src': $img,
                        'id': 'card'+card_id,
                        'height': '90px',
                        'class': data,
                        'draggable': 'true',
                        'ondragstart': 'drag(event)'
                    });
                    card_id++;
                    $('#my_cards').append($card);
                    $.ajax({
                        type: 'GET',
                        url: 'end_turn'
                    });
                }
            });
        });
}

function countess() {
    $.ajax({
        type: 'GET',
        url: 'round_over'
    });
}

function princess() {
    $.ajax({
        type: 'GET',
        url: 'princess',
        success: function() {
            $.ajax({
                type: 'GET',
                url: 'end_turn'
            });
            $.ajax({
                type: 'GET',
                url: 'round_over'
            })
        }
    });
    $('#eliminateyou').attr('class', 'true');
    $('#eliminateyou').html('Eliminated');
}

function card_action(card_nr) {
    if (card_nr == '1') {
        players_form(0);
        $('#popup_guard').show();
        $('#get_player').click(function(){
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            var card = $('input[name=card]:checked').val();
            $.ajax({
                type: 'GET',
                url: 'guard',
                data: {
                    'player': player_id,
                    'card': card
                },
                success: function(data) {
                    $('#popup_form').remove();
                    $('#popup_guard').hide();
                    if (data == '0') {
                        alert(player+" didn't have card "+card);
                    } else if (data == '1') {
                        alert("You have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').text('Eliminated');
                    }
                    alert("This is playernr: "+player_nr);
                    $("#"+player_nr).prop("checked", "false");
                    $("#"+card).prop("checked", "false");
                }
            });
        });
    } 
    else if(card_nr == '2') {
        players_form(0);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            $.ajax ({
                type: 'GET',
                url: 'priest',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    alert("This is playernr: "+player_nr);
                    $('#popup_form').remove();
                    alert(player+" has card "+data);
                }
            });
        });
    } 
    else if(card_nr == '3') {
        players_form(0);
        var player_id = $('input[name=player]:checked').val();
        var player_nr = $('input[name=player]:checked').attr('id');
        var player = $('label[for='+player_nr+']').html();
        $('#get_player').click(function() {
            $.ajax ({
                type: 'GET',
                url: 'baron',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    response = JSON.parse(data);
                    if(response[0] == 1) {
                        alert(player+" has card "+data[1]+" so you have eliminated "+player);
                        $('#eliminate1').attr('class', 'true');
                        $('#eliminate1').html('Eliminated');
                    } else if(response[0] == -1) {
                        alert(player+" has card"+data[1]+" so you have been eliminated by"+player);
                        $('#'+player+' #eliminated').attr('class', 'true');
                        $('#'+player+' #eliminated').html('Eliminated');
                    } else if(response[0] == 0) {
                        alert("Both of you have the same cards");
                    } else {
                        alert(data);
                        alert("Data is not of type string");
                    }
                }
            });
        });
    } 
    else if(card_nr == '4') {
        alert('handmaid');
        $.ajax ({
            type: 'GET',
            url: 'handmaid',
        });
    } 
    else if(card_nr == '5') {
        players_form(1);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            if (player == 'me') {
                $('#my_cards img').attr('draggable', 'true');
            }
            $.ajax({
                type: 'GET',
                url: 'prince',
                data: {
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                }
            });
        });
    } 
    else if(card_nr == '6') {               
        players_form(0);
        $('#get_player').click(function() {
            var player_id = $('input[name=player]:checked').val();
            var player_nr = $('input[name=player]:checked').attr('id');
            var player = $('label[for='+player_nr+']').text();
            $.ajax({
                type: 'GET',
                url: 'king',
                data: {
                    'my_card': $('#my_cards img').attr('class'),
                    'player': player_id
                },
                success: function(data) {
                    $('#popup_form').remove();
                    $('#my_cards img').remove();
                    $img = get_card_src(data);
                    $card = $('<img>');
                    $card.attr({
                        'src': $img,
                        'id': 'card'+card_id,
                        'height': '90px',
                        'class': data,
                        'draggable': 'true',
                        'ondragstart': 'drag(event)'
                    });
                    card_id++;
                    $('#my_cards').append($card);
                }
            });
        });
    } 
    else if(card_nr == '8') {
        $.ajax({
            type: 'GET',
            url: 'princess',
        });
        $('#eliminateyou').attr('class', 'true');
        $('#eliminateyou').html('Eliminated');
    }
}

function draw_card() {
    $('#'+x).hide();
    var id = $('#user').attr('class');
    $.ajax ({
        type: 'GET',
        url: 'draw_card',
        success: function(data) {
            if (data != "0") {
                $img = get_card_src(data);
                var card = $('<img>');
                card.attr({
                    'src': $img,
                    'id': 'card'+card_id,
                    'height': '90px',
                    'class': data,
                    'draggable': 'true',
                    'ondragstart': 'drag(event)'
                });
                card_id++;
                $('#my_cards').append(card);
            } 
            var countess = false;
            if (data == '7' || data == '5' || data == '6') {
                countess = countess_f(data);
            }
            if (countess == true) {
                alert("You have to discard the card countess");
            }
        }
    });
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
    if(get_curr_pl() == true || $('#prince').attr('class') == 'false') {
        /*if ($('#'+data).attr('class') == '8') {
            $('#eliminateyou').attr('class', 'true');
            $('#eliminateyou').html('Eliminated');

        }*/
        $.ajax ({
            type: 'GET',
            url: 'discard_card',
            data: {
                'src': $('#'+data).attr('src'),
                'card_nr':$('#'+data).attr('class')
            },
            success: function(data) {
                response = JSON.parse(data);
                parseInt(response);
                if (response != 0) {
                    alert("This should be the winner's id: "+data+ " "+response);
                    var player = $('#data span .'+data).attr('id');
                    alert(player+" has won");
                }
               $('.box_body').append('<p>Ajax request succeeded</p>');
            }
        });
        if ($('#prince').attr('class') == 'false' && $('#round_over').attr('class') == 'false') {
            var card_number = parseInt($('#'+data).attr('class'));
            if(card_number == 1) {
                guard();
            } else if(card_number == 2) {
                priest();
            } else if(card_number == 3) {
                baron();
            } else if(card_number == 4) {
                handmaid();
            } else if(card_number == 5) {
                prince();
            } else if(card_number == 6) {
                king();
            } else if(card_number == 8) {
                princess();
            }
            //card_action($('#'+data).attr('class'));
            
        } else  if ($('#prince').attr('class') == 'true'){
            $('#prince').attr('class', 'false');
        }
        if($('#round_over').attr('class') == 'true') {
            $('#Player1 .discarded').empty();
            $('#my_cards').empty();
            for (var i = 0; i <= x; i++) {
                $('#'+i).show();
            }
            $('#round_over').attr('class', 'false');
        } 
    }
    $('#my_cards img').attr('draggable', 'false');
}

$(document).ready(function() {
    $nr_players = $('#nr_pl').attr('class');
    var card_nr = $('#card_nr').attr('class');
    if ($nr_players == "2") {
        $("#cards").before('<div id="Player1"><span>Player 1</span><span id="eliminate1" class="false"></span><div class="discarded"></div></div>');
        var img_src = get_card_src(card_nr);
        var you = $('<div id="you"><div id="discarded_you" ondrop="drop(event)" ondragover="allowDrop(event)"></div><span>You<br></span><span id="eliminateyou" class="false"></span></div>');
        $('#cardlist').before(you);
        var div = $('<div id="my_cards"></div>');
        var card = $('<img>');
        card.attr({
            'src': img_src,
            'id': 'card'+card_id,
            'height': '90px',
            'class': card_nr,
            'draggable': "false",
            'ondragstart': 'drag(event)'
        });
        card_id++;
        div.append(card);
        $('#you').append(div);
        /*var form1 = $('<form name="cards" id="guard">Choose a card:<br></form>');
        var priest = $('<input>');
        priest.attr({
            'type': 'radio',
            'id': '2',
            'name': 'card',
            'value': '2'
        });
        var priest_label = $('<label for="2">Priest</label><br>');
        var baron = $('<input>');
        baron.attr({
            'type': 'radio',
            'id': '3',
            'name': 'card',
            'value': '3'
        });
        var baron_label = $('<label for="3">Baron</label><br>');
        var handmaid = $('<input>');
        handmaid.attr({
            'type': 'radio',
            'id': '4',
            'name': 'card',
            'value': '4'
        });
        var handmaid_label = $('<label for="4">Handmaid</label><br>');
        var prince = $('<input>');
        prince.attr({
            'type': 'radio',
            'id': '5',
            'name': 'card',
            'value': '5'
        });
        var prince_label = $('<label for="5">Prince</label><br>');
        var king = $('<input>');
        king.attr({
            'type': 'radio',
            'id': '6',
            'name': 'card',
            'value': '6'
        });
        var king_label = $('<label for="6">King</label><br>');
        var countess = $('<input>');
        countess.attr({
            'type': 'radio',
            'id': '7',
            'name': 'card',
            'value': '7'
        });
        var countess_label = $('<label for="7">Countess</label><br>');
        var princess = $('<input>');
        princess.attr({
            'type': 'radio',
            'id': '8',
            'name': 'card',
            'value': '8'
        });
        var princess_label = $('<label for="8">Princess</label><br>');
        form1.append(priest, priest_label, baron, baron_label, handmaid, handmaid_label, prince, prince_label, king, king_label, countess, countess_label, princess, princess_label);
      */
        $('#popup_guard').hide();
        $('#popup_form').hide();
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
                        'height': '90px',
                        })
                        $('#Player1 .discarded').append(card);
                    }
                } 
                if (response[2] == 1) {
                    if (response[3] == 'guard') {
                        alert("The current player chose to perform the effect of the card guard on you. S/He chose the card "+response[4]+", so you've been eliminated. Please discard your card.");
                        $('#my_cards img').attr('draggable', 'true');
                        $('#eliminateyou').attr('class', 'true');
                        $('#eliminateyou').html('Eliminated');
                    } else if (response[3] == 'priest') {
                        alert("The current player performed the effect of the card priest on you.");
                    } else if(response[3] == 'baron') {
                        if(response[5] == 'eliminate') {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[4]+" and you've been eliminated");
                            $('#eliminateyou').attr('class', 'true');
                            $('#eliminateyou').html('Eliminated');
                            $('my_cards img').attr('draggable', 'true');
                        } else if(response[5] == '0') {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[4]+" and you'd eliminated him/her");
                            $('#eliminate1').attr('class', 'true');
                            $('#eliminate1').html('Eliminated');
                        } else {
                            alert("The current player performed the effect of the card baron on you, s/he had the card "+response[3]+" so neither of you'd been eliminated");
                        }
                    } else if(response[3] == 'prince') {
                        alert("The current player has chosen to perform the effect of the card prince on you. Please discard your card, and draw a new card");
                        $('#my_cards img').attr('draggable', 'true')
                        $('#prince').attr('class', 'true');
                    } else if(response[3] == 'king') {
                        alert("The current player has chosen to perform on you the effect of the card king, so your cards have been traded");
                        $('#my_cards img').remove();
                        $img = get_card_src(response[4]);
                        var card = $("<img>");
                        card.attr({
                            'src': $img,
                            'height': '90px',
                            'draggable': 'false',
                            'ondragstart': 'drag(event)',
                            'id':'card'+card_id,
                            'class': response[4]
                        });
                        $('#my_cards').append(card);
                    }
                }
                if ((response[1] == 0 ) && $('#round_over').attr('class') == 'false') {
                    alert("This round has ended. Please discard your card");
                    $('#Player1 .discarded').empty();
                    $('#my_cards').empty();
                    $('#discarded_you').empty();
                    $('#round_over').attr('class', 'false')
                    for (var i = 0; i <= x; i++) {
                        $('#'+i).show();
                    }
                    $.ajax({
                        type: 'GET',
                        url: 'round_winner',
                        success: function(data) {
                            alert("The winner of the round is "+data);
                        }
                    })
                    $.ajax({
                        type: 'GET',
                        url: 'check_tokens',
                        success: function(data) {
                            var response = JSON.parse(data);
                            var tokens = response[0];
                            for(p in tokens) {
                                $('#token'+p).text('p: '+tokens[p]);
                            }  
                            if(response[1] == 1) {
                                alert("The winner of the game is: "+$('#'+response[2]).attr('class'));
                            } 
                        }
                    });
                    $('#Player1 #eliminate1').attr('class', 'false');
                    $('#Player1 #eliminate1').empty();
                    $('#you #eliminateyou').attr('class', 'false');
                    $('#you #eliminateyou').empty();
                    draw_card();
                } /*else if(response[1] == -1 && $('#round_over').attr('class') == 'true') {
                    $.ajax({
                        type: 'GET',
                        url: 'round_over',
                        success: function(data) {
                            var response = JSON.parse(data);
                            if (response == 0) {
                                $('#round_over').attr('class', 'false');
                            }
                        }
                    });
                }
                /*if(response[2] == 0 && response[4] + 1 == parseInt($('#nr_pl').attr('class'))) {
                    if ($('#round_over').attr('class') == "true" && response[5] == 0) {
                        $('#Player1 .discarded').empty();
                        $('#my_cards').empty();
                        $('#discarded_you').empty();
                        $('#round_over').attr('class', 'false')
                        for (var i = 0; i <= x; i++) {
                            $('#'+i).show();
                        }
                        $.ajax({
                            type: 'GET',
                            url: 'check_tokens',
                            success: function(data) {
                                var response = JSON.parse(data);
                                var tokens = response[0];
                                for(p in tokens) {
                                    $('#token'+p).text(tokens[p]);
                                }  
                                if(response[1] == 1) {
                                    alert("The winner of the game is: "+$('#'+response[2]).attr('class'));
                                } 
                            }
                        });
                    } else if(response[6] == 1) {
                        $('#Player1 #eliminate1').attr('class', 'false');
                        $('#Player1 #eliminate1').empty();
                        $('#you #eliminateyou').attr('class', 'false');
                        $('#you #eliminateyou').empty();
                        draw_card();
                        $('#round_over').attr('class', 'false');
                    }
                }*/
            }
        });
    });
}