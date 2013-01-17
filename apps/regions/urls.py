from django.conf.urls.defaults import patterns
from django.template.defaulttags import url
from django.views import generic
from django.conf.urls import *
from django.views.generic.list_detail import object_detail
from apps.regions.models import Group

urlpatterns = patterns('',
    (r'^business/(?P<slug>[-\w]+)/', object_detail,
        dict(queryset=Group.objects.filter(year=2011), slug_field='year', template_name="regions/business.html"))
)
