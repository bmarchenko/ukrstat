from django.contrib import admin
from apps.regions.models import Region
class RegionAdmin(admin.ModelAdmin):
    list_display = ('title',)
admin.site.register(Region, RegionAdmin)