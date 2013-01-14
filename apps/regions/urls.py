from django.conf.urls import *
from django.views import generic
from myproject.apps.blog import models as blog_models

urlpatterns = patterns('',
    url(r'^enterpreneurship/(?P<year>[-\d]+)/', generic.ListView.as_view(
        queryset=blog_models.Post.objects.filter(year=year),
        paginate_by=25),
        name='blog-list-view')
)
