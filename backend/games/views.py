import json
import random
from typing import Any
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.template import loader
from .models import Users, LoveLetter


class Player:
    def __init__(self, pl_id):
        self.id = pl_id
        self.cards = {
            'curr': [],
            'discarded': []
        }
        self.draw_card = True
        self.discard_card = False
        self.next = ''
        self.eliminate = False
        self.handmaid = False
        self.msg = ''
        self.card_sel = ''
        self.tokens = 0
        self.change = 0
        self.round_over = 0


class LoveLetterGame:
    def __init__(self, game):
        self.game_id = game
        self.cards = [1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8]
        self.game = LoveLetter.objects.get(game_nr=self.game_id)
        self.players = {
            self.game.player1: Player(self.game.player1)
        }
        self.action = self.players[self.game.player1].id
        self.rounds = 0
        self.curr_round = True
        self.eliminated = 0
        self.round_win = ''

    def get_new_card(self, player):
        rand = random.randint(0, len(self.cards) - 1)
        card = self.cards[rand]
        self.cards.pop(rand)
        self.players[player].cards['curr'].append(card)
        return card


global ll
ll = {}


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
    nr_game: str | Any = user.game_nr
    player1 = request.session.get('user_id')
    player2 = ''
    player3 = ''
    player4 = ''
    state = 'waiting'
    if len(waiting_games) == 0:
        love_letter = LoveLetter(nr_players, player1, player2, player3, player4, nr_game, 'waiting', nr_players - 1)
        love_letter.save()
        ll[nr_game] = LoveLetterGame(user.game_nr)
    else:
        if get_players.count() == 1:
            player1 = LoveLetter.objects.get(game_nr=nr_game).player1
            player2 = request.session.get('user_id')
            ll[nr_game].players[player2] = Player(player2)
            ll[nr_game].players[player1].next = player2
            if nr_players == 2:
                try:
                    user1 = Users.objects.filter(user_nr=player1)[0]
                    user1.state = 'playing'
                    user1.save()
                    user2 = Users.objects.get(user_nr=player2)
                    user2.state = 'playing'
                    user2.save()
                    state = 'playing'
                    ll[nr_game].players[player2].next = player1
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
            ll[nr_game].players[player3] = Player(player3)
            ll[nr_game].players[player2].next = player3
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
                ll[nr_game].players[player3].next = player1
        elif get_players.count() == 3 and nr_players == 4:
            player1 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player1')
            player2 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player2')
            player3 = LoveLetter.objects.filter(game_nr=user.game_nr).values_list('player3')
            player4 = request.session.get('user_id')
            ll[nr_game].players[player4] = Player(player4)
            ll[nr_game].players[player3].next = player4
            ll[nr_game].players[player4].next = player1
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
        'x': LoveLetter.objects.get(game_nr=nr_game).miss_pl,
        'nr': nr_players,
        'gameid': nr_game,
        'userid': request.session.get("user_id"),
        'game': ll[nr_game]
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
    card_nr = ll[user.game_nr].get_new_card(user.user_nr)
    nr_tokens = 7
    player1 = LoveLetter.objects.get(game_nr=user.game_nr).player1
    player2 = LoveLetter.objects.get(game_nr=user.game_nr).player2
    player3 = LoveLetter.objects.get(game_nr=user.game_nr).player3
    player4 = LoveLetter.objects.get(game_nr=user.game_nr).player4
    players = {
        'user': request.session.get('user_id')
    }
    tokens = {
        'user': 0,
        'player1': 0
    }
    context = {
        'nr_players': user.nr_players,
        'card_nr': card_nr,
    }
    if user.nr_players == 2:
        if player1 == request.session.get('user_id'):
            players['player1'] = player2
        else:
            players['player1'] = player1
        context['nr_cards'] = range(16 - user.nr_players - 4)
    elif user.nr_players == 3:
        nr_tokens = 5
        if player1 == request.session.get('user_id'):
            players['player1'] = player2
            players['player2'] = player3
        elif player2 == request.session.get('user_id'):
            players['player1'] = player1
            players['player2'] = player3
        else:
            players['player1'] = player1
            players['player2'] = player2
        tokens['player2'] = 0
        context['nr_cards'] = range(16 - user.nr_players - 1)
    elif user.nr_players == 4:
        nr_tokens = 4
        if player1 == request.session.get('user_id'):
            players['player1'] = player2
            players['player2'] = player3
            players['player3'] = player4
        elif player2 == request.session.get('user_id'):
            players['player1'] = player1
            players['player2'] = player3
            players['player3'] = player4
        elif player3 == request.session.get('user_id'):
            players['player1'] = player1
            players['player2'] = player2
            players['player3'] = player4
        else:
            players['player1'] = player1
            players['player2'] = player2
            players['player3'] = player3
            tokens['player3'] = 0
        context['nr_cards'] = range(16 - user.nr_players - 4)
    context['nr_tokens'] = nr_tokens
    context['players'] = players
    context['tokens'] = tokens
    return HttpResponse(template.render(context, request))


def checking_pl(request):
    miss_pl = LoveLetter.objects.get(game_nr=request.GET.get('game_id')).miss_pl
    if miss_pl == 0:
        love_l = LoveLetter.objects.get(game_nr=request.GET.get('game_id'))
        love_l.state = 'playing'
        love_l.save()
    response = miss_pl
    return HttpResponse(json.dumps(response))


def draw_card(request):
    user = str(request.session.get('user_id'))
    game_id = Users.objects.get(user_nr=user).game_nr
    if (ll[game_id].action == user and ll[game_id].players[user].draw_card and not ll[game_id].players[user].eliminate) or ll[game_id].players[user].msg == 'prince':
        card_nr = ll[game_id].get_new_card(user)
    else:
        card_nr = 0
    if ll[game_id].players[user].msg != 'prince':
        ll[game_id].players[user].draw_card = False
    else:
        ll[game_id].players[user].msg = ''
    return HttpResponse(json.dumps(card_nr))


def discard_card(request):
    src = request.GET.get('src')
    user = str(request.session.get('user_id'))
    card = int(request.GET.get('card_nr'))
    game_id = Users.objects.get(user_nr=user).game_nr
    ll[game_id].players[user].cards['discarded'].append(src)
    ll[game_id].players[user].cards['curr'].remove(card)
    response = 0
    if not ll[game_id].curr_round:
        response = ll[game_id].round_win
    if card == 8:
        ll[game_id].players[user].eliminate = True
    return HttpResponse(json.dumps(response))


def end_turn(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    ll[game_id].action = ll[game_id].players[user].next
    ll[game_id].players[ll[game_id].action].draw_card = True
    if ll[game_id].players[user].handmaid:
        ll[game_id].players[user].handmaid = False
    return HttpResponse(json.dumps('success'))


def update_discarded(request):
    user = str(request.GET.get('user'))
    nr_discarded = int(request.GET.get('player1_discarded'))
    player1 = str(request.GET.get('player1'))
    game_id = Users.objects.get(user_nr=user).game_nr
    p = ll[game_id].players[user]
    response = []
    discarded = len(ll[game_id].players[player1].cards['discarded'])
    if discarded > nr_discarded:
        cards = []
        for x in range(nr_discarded, discarded):
            cards.append(ll[game_id].players[player1].cards['discarded'][x])
        response.append(cards)
    else:
        response.append(nr_discarded - discarded)
    if (len(ll[game_id].cards) == 0 or ll[game_id].eliminated == ll[game_id].game.nr_players - 1) and ll[game_id].round_win == '':
        ll[game_id].rounds += 1
        ll[game_id].curr_round = False
        max_card = 0
        winner = ''
        for pl in ll[game_id].players:
            if not ll[game_id].players[pl].eliminate and ll[game_id].players[pl].cards['curr'][0] > max_card:
                max_card = ll[game_id].players[pl].cards['curr'][0]
                winner = pl
        ll[game_id].round_win = winner
        ll[game_id].players[winner].tokens += 1
        ll[game_id].active = winner

        response.append(0)
    elif ll[game_id].round_win != '' :
        response.append(-1)
    else:
        response.append(1)
    response.append(ll[game_id].players[user].change)
    if ll[game_id].players[user].change == 1:
        response.append(p.msg)
        response.append(p.card_sel)
        ll[game_id].players[user].change = 0
    if p.msg == 'king':
        response.append(p.cards['curr'][0])
    if p.msg != 'prince':
        p.msg = ''
    p.card_sel = ''
    if (p.eliminate and request.GET.get('eliminated') == 'false'):
        response.append('eliminate')
    elif not p.eliminate and request.GET.get('eliminated') == 'true':
        response.append('0')
        p.eliminate = True
    else:
        response.append('tie')
    response.append(ll[game_id].eliminated)
    return HttpResponse(json.dumps(response))


def protected_players(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    response = 0
    for x in ll[game_id].players:
        if x != user and not ll[game_id].players[x].handmaid:
            response = 1
            break
    return HttpResponse(json.dumps(response))


def curr_pl(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    if ll[game_id].action == user:
        return HttpResponse(json.dumps(1))
    else:
        return HttpResponse(json.dumps(0))


def round_over(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    roundover = 0
    ll[game_id].players[user].round_over = 1
    if ll[game_id].round_win != '':
        for pl in ll[game_id].players:
            if ll[game_id].players[pl].round_over == 1:
                roundover += 1
        if roundover == LoveLetter.objects.get(game_nr=game_id).nr_players:
            ll[game_id].round_win = ''
            for pl in ll[game_id].players:
                ll[game_id].players[pl].round_over = 0
        return HttpResponse(json.dumps(1))
    else:
        return HttpResponse(json.dumps(0))

def guard(request):
    user = str(request.session.get('user_id'))
    game_id = Users.objects.get(user_nr=user).game_nr
    player = str(request.GET.get('player'))
    card = int(request.GET.get('card'))
    hit = 0
    if ll[game_id].players[player].cards['curr'][0] == card and not ll[game_id].players[player].handmaid:
        hit = 1
        ll[game_id].players[player].change = 1
        ll[game_id].players[player].msg = 'guard'
        ll[game_id].players[player].card_sel = card
        ll[game_id].players[player].eliminate = True
        ll[game_id].eliminated += 1
        next_ = ll[game_id].players[user].next
        ll[game_id].players[user].next = ll[game_id].players[next_].next
        ll[game_id].active = ll[game_id].players[user].next
    return HttpResponse(json.dumps(hit))


def priest(request):
    player = str(request.GET.get('player'))
    user = str(request.session.get('user_id'))
    game_id = Users.objects.get(user_nr=user).game_nr
    player_card = ll[game_id].players[player].cards['curr'][0]
    ll[game_id].players[player].change = 1
    ll[game_id].players[player].msg = 'priest'
    return HttpResponse(json.dumps(player_card))


def baron(request):
    player = str(request.GET.get('player'))
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    player_card = ll[game_id].players[player].cards['curr'][0]
    you_card = ll[game_id].players[user].cards['curr'][0]
    response = []
    if player_card < you_card and not ll[game_id].players[player].handmaid and not ll[game_id].players[
        player].eliminate:
        ll[game_id].players[player].eliminate = True
        ll[game_id].eliminated += 1
        next_ = ll[game_id].players[user].next
        ll[game_id].players[user].next = ll[game_id].players[next_].next
        ll[game_id].active = ll[game_id].players[user].next
        response.append(1)
        response.append(player_card)
    elif you_card < player_card and not ll[game_id].players[player].handmaid and not ll[game_id].players[
        player].eliminate:
        ll[game_id].players[user].eliminate = True
        ll[game_id].eliminated += 1
        next_ = ll[game_id].players[user].next
        for p in ll[game_id].players:
            if ll[game_id].players[p].next == user:
                ll[game_id].players[p].next = next_
                break
        response.append(-1)
        response.append(player_card)
    else:
        ll[game_id].players[player].eliminate = 'tie'
        response.append(0)
    ll[game_id].players[player].msg = 'baron'
    ll[game_id].players[player].card_sel = you_card
    ll[game_id].players[player].change = 1
    return HttpResponse(json.dumps(response))


def handmaid(request):
    user = str(request.session.get('user_id'))
    game_id = Users.objects.get(user_nr=user).game_nr
    ll[game_id].players[user].handmaid = True
    msg = "You'll be protected until your next turn"
    return HttpResponse(json.dumps(msg))


def prince(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    player = str(request.GET.get('player'))
    if player != user and not ll[game_id].players[player].handmaid and not ll[game_id].players[player].eliminate:
        ll[game_id].players[player].change = 1
        ll[game_id].players[player].msg = "prince"
    elif player == user:
        ll[game_id].players[user].draw_card == True
    msg = "You've been successful"
    card = ll[game_id].players[player].cards['curr'][0]
    return HttpResponse(json.dumps(msg))



def king(request):
    player = request.GET.get('player')
    my_card = int(request.GET.get('my_card'))
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    p = ll[game_id].players[player]
    player_card = 0
    if not p.handmaid and not p.eliminate:
        player_card = p.cards['curr'][0]
        ll[game_id].players[user].cards['curr'][0] = player_card
        p.cards['curr'][0] = my_card
        p.msg = "king"
        p.card_sel = my_card
        ll[game_id].players[player].change = 1
    return HttpResponse(json.dumps(player_card))


def princess(request):
    user = request.session.get('user_id')
    game_id = Users.objects.get(user_nr=user).game_nr
    ll[game_id].players[user].eliminate = True
    ll[game_id].eliminated += 1
    next_ = ll[game_id].players[user].next
    for p in ll[game_id].players:
        if ll[game_id].players[p].next == user:
            ll[game_id].players[p].next = next_
            break
    msg = "You've been eliminated"
    return HttpResponse(json.dumps(msg))


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
    template = loader.get_template("game's table.html")
    return HttpResponse(template.render(context, request))
