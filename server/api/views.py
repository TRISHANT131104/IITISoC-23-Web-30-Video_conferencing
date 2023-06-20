from django.shortcuts import render
from rest_framework.generics import *
from .models import *
from rest_framework.permissions import IsAuthenticated
from .helpers import *
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import *
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import datetime
from rest_framework.response import Response
from .models import User
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from .emails import send_otp_via_email
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
# Create your views here.


class VerifyOTP(APIView):  # Making a Class Based View Called Verify OTP
    def post(self, request):  # making a post reuqest
        data = request.data  # collecting the data sent by the frontend
        # Using the Serializer Class VerifyOTPSerializer and sending in the data to the serializer
        serializer = VerifyOTPSerializer(data=data)
        if serializer.is_valid():  # checing is serializer accepts the data
            # obtaining the email of the person from the serialized data
            email = serializer.data["email"]
            # obtaining the otp from the serialized data
            otp = serializer.data["otp"]
            # getting or filtering the user with email equal to the email sent by the frontend
            user = User.objects.filter(email=email)
            if not user.exists():  # if the user is not present in the database then he is unauthorized
                return Response("UnAuthorized", status=status.HTTP_401_UNAUTHORIZED)
            # if otp is wrong then asking the user to retry thus sending a http response of a bad request
            if user[0].otp != otp:
                return Response("Wrong Otp Please Retry", status=status.HTTP_400_BAD_REQUEST)
            user = user.first()  # since filter gives list of objects so we filter out the first element from the list using the .first()
            # since otp is verified as it had no obstacles so making the email_is_verified Field True
            user.email_is_verified = True
            user.save()  # saving the user instance
        # senidng a http response of 200 saying the user that his otp is verified
        return Response('OTP Succesfully Verified', status=status.HTTP_200_OK)


class Signup(APIView):  # making a class Based view using APIView
    def post(self, request):  # making a Post Reuqest
        data = request.data  # obtaining the data sent by the frontend
        # Serializing(converting objects into certain datatypes here its json and vice versa) data given by frontend
        serializer = UserSerializer(data=data)
        if serializer.is_valid():  # if serializer accepts the incomming data without any error
            serializer.save()  # saving the user instance with the serializer
            # sending the otp through a function called send_otp_via_email in the .emails file
            send_otp_via_email(serializer.data["email"])
            return Response({"email": serializer.data["email"]}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Login(APIView):  # making a class based view called Login Using APIView
    def post(self, request):  # creating a post request
        try:
            # extracting the username from the data sent by frontend
            username = request.data['username']
            # extracting the password from the data sent by frontend
            password = request.data['password']
            # extracting the email from the data sent by frontend
            email = request.data['email']

            # checking for errors
            # getting the user with the given username as he must have been signed up before and stored in the database
            user = User.objects.filter(username=username).first()

            if user is None:  # if the user is not found then he wasnt signed up and error is sent back to the frontend
                return Response({'error': 'invalid username or password'}, status=status.HTTP_404_NOT_FOUND)
            # if the user has entered wrong password then an error is sent to the frontend
            if not user.check_password(password):
                return Response({'error': 'invalid username or password'}, status=status.HTTP_404_NOT_FOUND)
            if user.email_is_verified == False:  # if the user has signed up but hasnt verified his email yet so again an error is sent to the frontend
                return Response({'error': 'invalid username or password'}, status=status.HTTP_404_NOT_FOUND)
            else:
                if email == user.email:  # checking if the email sent by the frontend is same as the email stored in the database
                    # providing a refresh token for the user
                    refresh = RefreshToken.for_user(user)
                    user.last_login = datetime.datetime.now()  # updating his last login time
                    user.save()  # saving the user instance
                    return Response({  # sending a resposne to the frontend,providing the frontend the access and refresh token along with users details without his password
                        'id':user.id,
                        'message': 'login successfull',
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'username': user.username,
                        'last_login_date': getdate(),
                        'last_login_time': gettime(),
                        'email': user.email},
                        status=status.HTTP_200_OK)

                else:  # if the email sent by the frontend is not equal to the email of the user stored in that database then send a error to the frontend
                    return Response({'errors': 'email not matched'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({'errors': 'Some Error Occured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetRoomDetails(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            user = self.request.user
            room_id = request.data['roomID']
            old_room = Room.objects.filter(room_id=room_id).filter(created_by = user).first()
            room = Room.objects.filter(room_id = room_id).first()
            if old_room is not None:
                serializer = RoomSerializer(old_room)
                return Response(serializer.data,status=status.HTTP_200_OK)
            else:
                if room is None:
                    return Response({'errors': 'Room Not Found'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    serializer = RoomSerializer(room)
                    return Response(serializer.data,status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'errors': 'Some Error Occured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)