# Generated by Django 2.0.4 on 2018-05-03 08:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20180503_0756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='link',
            field=models.FileField(upload_to='img'),
        ),
    ]
