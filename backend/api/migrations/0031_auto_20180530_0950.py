# Generated by Django 2.0.5 on 2018-05-30 09:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_auto_20180528_0842'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='created',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='category',
            name='desc',
            field=models.CharField(default=None, max_length=255, null=True),
        ),
    ]
