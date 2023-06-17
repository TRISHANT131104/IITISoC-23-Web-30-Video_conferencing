from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    email_is_verified = models.BooleanField(null=True,default=False,blank=True)
    otp = models.CharField(max_length=10,null=True,blank=True,default=None)
    
    REQUIRED_FIELDS = []