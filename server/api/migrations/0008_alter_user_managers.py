# Generated by Django 4.2.2 on 2023-06-21 06:43

import api.manager
import django.contrib.auth.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_room_room_id_alter_room_id'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='user',
            managers=[
                ('object', api.manager.UserManager()),
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
