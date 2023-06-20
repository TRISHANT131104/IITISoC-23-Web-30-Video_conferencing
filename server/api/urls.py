

from django.urls import path
from .views import Login,Signup,VerifyOTP,GetRoomDetails
urlpatterns = [
    path('Login/', Login.as_view()),
    path('Signup/', Signup.as_view()),
    path('VerifyOTP/', VerifyOTP.as_view()),
    path('GetRoomDetails/',GetRoomDetails.as_view())
]
