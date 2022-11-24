from django.db import models


# Create your models here.
class Users(models.Model):
    user_nr = models.CharField(max_length=255, primary_key=True, unique=True, blank=True)
    state = models.CharField(max_length=255)
    game_name = models.CharField(max_length=255)
    nr_players = models.IntegerField(null=True)
    game_nr = models.CharField(max_length=255)


class LoveLetter(models.Model):
    nr_players = models.IntegerField()
    player1 = models.CharField(max_length=255)
    player2 = models.CharField(max_length=255)
    player3 = models.CharField(max_length=255)
    player4 = models.CharField(max_length=255)
    game_nr = models.CharField(max_length=255, primary_key=True, blank=True, unique=True)
    state = models.CharField(max_length=255)
    miss_pl = models.IntegerField()


