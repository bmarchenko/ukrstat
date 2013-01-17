from django.db import models


class Region(models.Model):
    title = models.CharField(max_length=50)
    short_title = models.CharField(max_length=10)

    def __unicode__(self):
        return self.title


class Group(models.Model):
    year = models.IntegerField()
    url = models.CharField(max_length=255)
    title = models.CharField(max_length=50)

    def __unicode__(self):
        return self.title


class Entreprenurship(models.Model):
    region = models.ForeignKey(Region)
    group = models.ForeignKey(Group)
    enterprises = models.FloatField(null=True, blank=True)
    companies = models.FloatField(null=True, blank=True)

    def __unicode__(self):
        return "%s, %s" %(self.region.title, self.group.year)