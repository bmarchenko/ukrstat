# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Region'
        db.create_table('regions_region', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('short_title', self.gf('django.db.models.fields.CharField')(max_length=10)),
        ))
        db.send_create_signal('regions', ['Region'])

        # Adding model 'Group'
        db.create_table('regions_group', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('date', self.gf('django.db.models.fields.DateField')()),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50)),
        ))
        db.send_create_signal('regions', ['Group'])

        # Adding model 'Entreprenurship'
        db.create_table('regions_entreprenurship', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('region', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['regions.Region'])),
            ('group', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['regions.Group'])),
            ('enterprises', self.gf('django.db.models.fields.FloatField')()),
            ('companies', self.gf('django.db.models.fields.FloatField')()),
        ))
        db.send_create_signal('regions', ['Entreprenurship'])


    def backwards(self, orm):
        # Deleting model 'Region'
        db.delete_table('regions_region')

        # Deleting model 'Group'
        db.delete_table('regions_group')

        # Deleting model 'Entreprenurship'
        db.delete_table('regions_entreprenurship')


    models = {
        'regions.entreprenurship': {
            'Meta': {'object_name': 'Entreprenurship'},
            'companies': ('django.db.models.fields.FloatField', [], {}),
            'enterprises': ('django.db.models.fields.FloatField', [], {}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Group']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['regions.Region']"})
        },
        'regions.group': {
            'Meta': {'object_name': 'Group'},
            'date': ('django.db.models.fields.DateField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'regions.region': {
            'Meta': {'object_name': 'Region'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'short_title': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['regions']