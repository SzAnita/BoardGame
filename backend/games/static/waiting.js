myInterval = setInterval(check_pl, '5000');

 function check_pl() {
     $(document).ready(function() {
            $id = $("#game").attr('class');
            $.ajax({
                type: "GET",
                url: "../checking_pl",
                data: {
                    game_id : $id
                },
                success: function(data) {
                    $test1 = $("#missing");
                    $test1.text(data);
                    if (data == "0") {
                        $link = $("<a href='../playing'><button type='button'>Start game</button></a>");
                        $(".box-body").append($link);
                        clearInterval(myInterval);
                    }
                }
            });
     });
 }
