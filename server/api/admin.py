from django.contrib import admin
from .models import User
# Register your models here.
@admin.register(User)
class ContestAdmin(admin.ModelAdmin):
    list_display = ['id',"username","email","otp"]