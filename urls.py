from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from apps import regions

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ukrstat.views.home', name='home'),
    # url(r'^ukrstat/', include('ukrstat.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^regions/', include(regions.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
