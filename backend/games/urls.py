from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('loveletter/', views.loveletter, name='loveletter'),
    path('loveletter/instructions/', views.loveletter_instructions, name='instructions'),
    path('loveletter/get_nr_players/', views.get_nr_players, name='get_nr_players'),
    path('loveletter/get_players/', views.get_players_loveletter, name='get_players'),
    path('loveletter/waiting/', views.waiting_loveletter, name='waiting'),
    path('loveletter/playing/', views.play_loveletter, name='playing'),
    path('loveletter/checking_pl', views.checking_pl, name='checking_pl'),
    path('loveletter/playing/draw_card', views.draw_card, name='draw_card'),
    path('loveletter/playing/update_game', views.update_game, name='update_game'),
    path('loveletter/playing/get_discarded', views.update_discarded, name='get_discarded'),
    path('loveletter/playing/guard', views.guard, name='guard'),
    path('loveletter/playing/priest', views.priest, name='priest'),
    path('loveletter/playing/baron', views.baron, name='baron'),
    path('games_table/', views.game_table, name='games_table'),
    path('kingdomino', views.kingdomino, name='kingdomino'),
]
