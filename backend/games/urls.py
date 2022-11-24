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
    path('games_table/', views.game_table, name='games_table'),
    path('kingdomino', views.kingdomino, name='kingdomino'),
    path('test', views.test, name='test')
]
