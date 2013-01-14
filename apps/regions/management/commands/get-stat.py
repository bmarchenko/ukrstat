#!/usr/bin/env python
# -*- coding: utf-8 -*-
import urllib2
from bs4 import BeautifulSoup
import time, datetime
from regions.models import Region, Entreprenurship
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    def handle(self, *args, **options):
        page = urllib2.urlopen('http://www.ukrstat.gov.ua/operativ/operativ2012/fin/osp/osp_reg/ksg_reg/ksg_reg_u_11.htm').read()
        soup = BeautifulSoup(page)
        table = soup.body.find("table", { "id" : "table1" })
        for row in table.findAll('tr'):
            try:
                td = row.findAll('td')
                region_title = td[0].text
                for i in Region.objects.all():
                    print "title", i.title
                    print region_title
                    if i.title in region_title:
                        print "yes"
                        reg = i
                        import ipdb; ipdb.set_trace()

                Entreprenurship(region=reg, enterprises=int(td[1].text)).save()
            except:
                pass


