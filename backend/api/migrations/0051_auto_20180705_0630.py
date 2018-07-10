# Generated by Django 2.0.7 on 2018-07-05 06:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0050_auto_20180705_0605'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='contract_address',
        ),
        migrations.AlterField(
            model_name='category',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_by', to='api.Profile'),
        ),
    ]