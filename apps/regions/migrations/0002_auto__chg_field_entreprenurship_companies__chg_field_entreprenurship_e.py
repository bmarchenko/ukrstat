# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Entreprenurship.companies'
        db.alter_column('regions_entreprenurship', 'companies', self.gf('django.db.models.fields.FloatField')(null=True))

        # Changing field 'Entreprenurship.enterprises'
        db.alter_column('regions_entreprenurship', 'enterprises', self.gf('django.db.models.fields.FloatField')(null=True))

    def backwards(self, orm):

        # Changing field 'Entreprenurship.companies'
        db.alter_column('regions_entreprenurship', 'companies', self.gf('django.db.models.fields.FloatField')(default=2))

        # Changing field 'Entreprenurship.enterprises'
        db.alter_column('regions_entreprenurship', 'enterprises', self.gf('django.db.models.fields.FloatField')(default=2))

    models = {
        'regions.entreprenurship': {
            'Meta': {'object_name': 'Entreprenurship'},
            'companies': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'enterprises': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Group']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Region']"})
        },
        'regions.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
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