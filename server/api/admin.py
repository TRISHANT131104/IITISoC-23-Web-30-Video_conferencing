from django.contrib import admin
from .models import Room,User
# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id',"username","email","otp"]
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['id',"room_id","name","created_by"]