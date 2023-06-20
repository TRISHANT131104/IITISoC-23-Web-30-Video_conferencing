from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from .helpers import getdate
# Create your models here.
class User(AbstractUser):
    email_is_verified = models.BooleanField(null=True,default=False,blank=True)
    otp = models.CharField(max_length=10,null=True,blank=True,default=None)
    
    REQUIRED_FIELDS = []

class Room(models.Model):
    room_id = models.UUIDField(default = uuid.uuid4,editable = False)
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User,to_field="username",on_delete=models.CASCADE)
    created_at = models.CharField(max_length=100,default = getdate)