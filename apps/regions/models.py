from django.db import models

class Region(models.Model):
    title = models.CharField(max_length=50)
    title_unicode = models.CharField(max_length=100)
    short_title = models.CharField(max_length=10)

class Entreprenurship(models.Model):
    region = models.ForeignKey(Region)
    enterprises = models.IntegerField()