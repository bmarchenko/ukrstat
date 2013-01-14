from django.db import models

class Region(models.Model):
    title = models.CharField(max_length=50)
    short_title = models.CharField(max_length=10)

    def __unicode__(self):
        return self.title

class Entreprenurship(models.Model):
    year = models.IntegerField()
    region = models.ForeignKey(Region)
    enterprises = models.FloatField()

    def __unicode__(self):
        return "%s, %s" %(self.region.title, self.year)