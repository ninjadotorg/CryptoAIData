# Generated by Django 2.0.4 on 2018-05-03 11:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_image_created'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='status',
            field=models.CharField(choices=[('VERIFYING', 'VERIFYING'), ('DONE', 'Done')], default='VERIFYING', max_length=30),
        ),
    ]
