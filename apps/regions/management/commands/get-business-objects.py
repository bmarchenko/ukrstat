#!/usr/bin/env python
# -*- coding: utf-8 -*-
from decimal import Decimal
import urllib2
from bs4 import BeautifulSoup
import time, datetime
from regions.models import Region, Entreprenurship
from django.core.management.base import BaseCommand, CommandError
from apps.regions.models import Group


class Command(BaseCommand):
    def handle(self, *args, **options):
        year = int(args[0])
        group = Group.objects.get(title="Кількість суб’єктів господарювання за регіонами", year=year)
#        import ipdb; ipdb.set_trace()
        page = urllib2.urlopen(group.url).read()
        soup = BeautifulSoup(page)
        table = soup.body.find("table", { "id" : "table1" })
        for row in table.findAll('tr'):
            try:
                td = row.findAll('td')
                region_title = td[0].text.replace("\n", "")
                reg = Region.objects.get(title=region_title)
                import ipdb; ipdb.set_trace()
                obj, created = Entreprenurship.objects.get_or_create(group=group, region=reg)
                obj.enterprises=float(td[1].text.replace(",", "."))
                obj.companies=float(td[2].text.replace(",", "."))
                obj.save()
            except:
                pass


