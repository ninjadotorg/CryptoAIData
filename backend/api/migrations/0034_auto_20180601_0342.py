# Generated by Django 2.0.5 on 2018-06-01 03:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_auto_20180531_0400'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='imageprofile',
            name='type',
        ),
        migrations.AddField(
            model_name='imageprofile',
            name='classify',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.Classify'),
        ),
    ]