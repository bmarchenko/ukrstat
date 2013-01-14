# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Region.title_unicode'
        db.add_column('regions_region', 'title_unicode',
                      self.gf('django.db.models.fields.CharField')(default=2, max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Region.title_unicode'
        db.delete_column('regions_region', 'title_unicode')


    models = {
        'regions.entreprenurship': {
            'Meta': {'object_name': 'Entreprenurship'},
            'enterprises': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Region']"})
        },
        'regions.region': {
            'Meta': {'object_name': 'Region'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'short_title': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'title_unicode': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['regions']