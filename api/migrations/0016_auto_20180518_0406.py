# Generated by Django 2.0.5 on 2018-05-18 04:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_auto_20180517_0909'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='order_id',
        ),
        migrations.RemoveField(
            model_name='product',
            name='type',
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]
