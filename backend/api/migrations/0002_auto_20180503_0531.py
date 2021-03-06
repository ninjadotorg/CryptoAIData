# Generated by Django 2.0.4 on 2018-05-03 05:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='status',
            field=models.CharField(choices=[('VERIFYING', 'Verifying'), ('DONE', 'Done')], default='VERIFYING', max_length=30),
        ),
        migrations.AddField(
            model_name='image',
            name='type',
            field=models.CharField(choices=[('RECYCLE', 'Recycle'), ('NO-RECYCLE', 'Non-recycle')], max_length=30, null=True),
        ),
    ]
