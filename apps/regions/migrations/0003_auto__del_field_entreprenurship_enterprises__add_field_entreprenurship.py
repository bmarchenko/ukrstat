# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Entreprenurship.enterprises'
        db.delete_column('regions_entreprenurship', 'enterprises')

        # Adding field 'Entreprenurship.year'
        db.add_column('regions_entreprenurship', 'year',
                      self.gf('django.db.models.fields.IntegerField')(default=2),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Entreprenurship.enterprises'
        db.add_column('regions_entreprenurship', 'enterprises',
                      self.gf('django.db.models.fields.IntegerField')(default=2),
                      keep_default=False)

        # Deleting field 'Entreprenurship.year'
        db.delete_column('regions_entreprenurship', 'year')


    models = {
        'regions.entreprenurship': {
            'Meta': {'object_name': 'Entreprenurship'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Region']"}),
            'year': ('django.db.models.fields.IntegerField', [], {})
        },
        'regions.region': {
            'Meta': {'object_name': 'Region'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'short_title': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['regions']