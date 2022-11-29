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
                $('#msg').remove();
            } else {
                $('.box_body').append("<span id='msg'>You can't draw a card now</span>");
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
  $('.box-body').append($(data).attr('src'));
  $.ajax ({
    type: 'GET',
    url: 'update_game',
    data: {
        'src': $(data).attr('src'),
        'user': $('#user').attr('class')
    },
    success: function() {
       $('.box_body').append('<p>Ajax request succeeded</p>');
    }
  })
  $('#my_cards img').attr('draggable', 'false');
}

$(document).ready(function() {
    $nr_players = $('#nr_pl').attr('class');
    var card_nr = $('#card_nr').attr('class');

    if ($nr_players == "2") {
        $("#cards").before('<div id="2_player1"><span>Player 1</span><div class="discarded"></div></div>');
        $img_src = get_card_src(card_nr);
        $you = $('<div id="2_you"><div id="discarded_you" ondrop="drop(event)" ondragover="allowDrop(event)"></div><span>You<br></span></div>');
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
        $('#2_you').append($div);
    }
})
myInterval = setInterval(check_discarded, '10000');
function check_discarded() {
    $(document).ready(function() {
        $nr_players = $('#nr_pl').attr('class');

        var player1_discarded = $('#2_player1 .discarded img').length;
        $.ajax ({
            type: 'GET',
            url: 'get_discarded',
            data: {
                'player1': player1_discarded,
                'user': $('#user').attr('class')
            },
            success: function(data) {
                if (data != "0") {
                    const obj = JSON.parse(data);
                    /*for (let x in obj) {
                        var card = $("<img>").attr('src', obj[x]);
                        $('#2_player1 .discarded').append(card);
                    }*/
                    $('#2_player1 .discarded').append(data);
                } else if(data == "0") {
                    $('.box-body').append("There's nothing to update");
                } else {
                    $('.box-body').append("I don't know what's returned");
                }
            }
        })
    })
}