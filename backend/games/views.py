import json
import mimetype
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.template import loader
from .models import Users, LoveLetter
import simplejson


def checks(user_id):
    try:
        user = Users.objects.filter(user_nr=user_id)[0]
        if user.state == 'playing' or user.state == 'waiting':
            game = LoveLetter.objects.filter(game_nr=user.game_nr)[0]
            if game.player1 == user.user_nr:
                game.player1 = ''
            elif game.player2 == user.user_nr:
                game.player2 = ''
            elif game.player3 == user.user_nr:
                game.player3 = ''
            elif game.player4 == user.user_nr:
                game.player4 = ''
            user.state = 'browsing'
            user.nr_players = 0
            user.game_name = ''
            user.game_nr = ''
            user.save()
            game.state = 'waiting'
            game.miss_pl = game.miss_pl + 1
            if game.miss_pl == game.nr_players:
                game.delete()
            game.save()
    except IndexError:
        user = Users(user_id, 'browsing', '', 0, '')
        user.save()


# Create your views here.
def index(request):
    template = loader.get_template('index.html')
    my_users = Users.objects.all()
    if 'user_id' not in request.session:
        request.session['user_id'] = "{}".format(my_users.count() + 1)
        user = Users(request.session.get('user_id'), 'browsing', '', 0, '')
        user.save()
    else:
        checks(request.session.get('user_id'))
    return HttpResponse(template.render({}, request))


def loveletter(request):
    checks(request.session.get('user_id'))
    template = loader.get_template('loveletter.html')
    return HttpResponse(template.render({}, request))


def kingdomino(request):
    template = loader.get_template('kingdomino.html')
    return HttpResponse(template.render({}, request))


def loveletter_instructions(request):
    checks(request.session.get('user_id'))
    template = loader.get_template('instructions_loveletter.html')
    return HttpResponse(template.render({}, request))


def get_nr_players(request):
    checks(request.session.get('user_id'))
    template = loader.get_template('get_nr_players.html')
    return HttpResponse(template.render({}, request))


def get_players_loveletter(request):
    nr_players = int(request.GET['nr_players'])
    user = Users.objects.get(user_nr=request.session.get('user_id'))
    user.nr_players = nr_players
    user.game_name = 'Love Letter'
    user.state = 'waiting'
    get_players = Users.objects.filter(game_name='Love Letter', nr_players=nr_players, state='waiting')
    waiting_games = []
    if nr_players > get_players.count() > 0:
        for x in get_players:
            if x.game_nr not in waiting_games:
                waiting_games.append(x.game_nr)
        user.game_nr = waiting_games[0]
    else:
        user.game_nr = "ll{}".format(LoveLetter.objects.all().count() + 1)
    user.save()
    request.session['game_id'] = user.game_nr
    nr_game = user.game_nr
    player1 = request.session.get('user_id')
    player2 = ''
    player3 = ''
    player4 = ''
    state = 'waiting'
    if len(waiting_games) == 0:
        love_letter = LoveLetter(nr_players, player1, player2, player3, player4, nr_game, 'waiting', nr_players - 1)
        love_letter.save()
    else:
        if get_players.count() == 1:
            player1 = LoveLetter.objects.get(game_nr=nr_game).player1
            player2 = request.session.get('user_id')
            if nr_players == 2:
                try:
                    user1 = Users.objects.filter(user_nr=player1)[0]
                    user1.state = 'playing'
                    user1.save()
                    user2 = Users.objects.get(user_nr=player2)
                    user2.state = 'playing'
                    user2.save()
                    state = 'playing'
                except IndexError:
                    template = loader.get_template('get_players_loveletter.html')
                    context = {
                        'player1': player1,
                        'player2': player2
                    }
                    return HttpResponse(template.render(context, request))
        elif get_players.count() == 2 and nr_players >= 3:
            player1 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player1')
            player2 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player2')
            player3 = request.session.get('user_id')
            if nr_players == 3:
                state = 'playing'
                user1 = Users.objects.get(user_nr=player1)
                user1.state = 'playing'
                user1.save()
                user2 = Users.objects.get(user_nr=player2)
                user2.state = 'playing'
                user2.save()
                user3 = Users.objects.get(user_nr=player3)
                user3.state = 'playing'
                user3.save()
        elif get_players.count() == 3 and nr_players == 4:
            player1 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player1')
            player2 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player2')
            player3 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player3')
            player4 = request.session.get('user_id')
            state = 'playing'
            user1 = Users.objects.get(user_nr=player1)
            user1.state = 'playing'
            user1.save()
            user2 = Users.objects.get(user_nr=player2)
            user2.state = 'playing'
            user2.save()
            user3 = Users.objects.get(user_nr=player3)
            user3.state = 'playing'
            user3.save()
            user4 = Users.objects.get(user_nr=player4)
            user4.state = 'playing'
            user4.save()
        wait_pl = Users.objects.filter(game_nr=nr_game).count()
        missing_pl = nr_players - wait_pl - 1
        if nr_players - wait_pl == 0:
            missing_pl = 0
        love_letter = LoveLetter(nr_players, player1, player2, player3, player4, nr_game, state, missing_pl)
        love_letter.save()

    template = loader.get_template('waiting_loveletter.html')
    context = {
        'x': LoveLetter.objects.get(game_nr=nr_game, state='waiting').miss_pl,
        'nr': nr_players,
        'gameid': nr_game,
        'userid': request.session.get("user_id")
    }
    return HttpResponse(template.render(context, request))


def waiting_loveletter(request):
    template = loader.get_template('waiting_loveletter.html')
    context = {
        'y': LoveLetter.objects.filter(game_nr=request.session.get('game_id'), state='waiting').values_list('miss_pl')
    }
    return HttpResponse(template.render(context, request))


def play_loveletter(request):
    template = loader.get_template('playloveletter.html')
    user = Users.objects.get(user_nr=request.session.get('user_id'))
    nr_tokens = 7
    if user.nr_players == 3:
        nr_tokens = 5
    elif user.nr_players == 4:
        nr_tokens = 4
    context = {
        'nr_players': user.nr_players,
        'nr_tokens': nr_tokens,
        'tokens': 0
    }
    return HttpResponse(template.render(context, request))


def test(request):
    template = loader.get_template('test.html')
    return HttpResponse(template.render({}, request))


def checking_pl(request):
    miss_pl = LoveLetter.objects.get(game_nr=request.GET.get('game_id')).miss_pl
    if miss_pl == 0:
        ll = LoveLetter.objects.get(game_nr=request.GET.get('game_id'))
        ll.state = 'playing'
        ll.save()
    response = miss_pl
    return HttpResponse(simplejson.dumps(response), mimetype.MimeType("text", None, None, None))


def game_table(request):
    context = {
        'games': LoveLetter.objects.all().values(),
        'users': Users.objects.all().values()
    }
    for games in LoveLetter.objects.all():
        if games.miss_pl == games.nr_players:
            games.delete()
            for user in Users.objects.all():
                if user.game_nr == games.game_nr:
                    user.game_nr = ''
                    user.state = 'browsing'
                    user.nr_players = 0
                    user.game_name = ''
                    user.save()
        # if games.game_nr == 'll1': #  or games.game_nr == 'll2':
        #    games.delete()
    template = loader.get_template("game's table.html")
    return HttpResponse(template.render(context, request))
