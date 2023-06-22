# myapp/consumers.py

import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from .models import Room, User
from uuid import uuid4
connectedUsers = []
rooms = []


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.test = []
        self.room_id = None
        await self.accept()

    async def disconnect(self, close_code):
        await self.leave_room()

    async def receive_json(self, text_data):
        

        data = text_data['data']
        if text_data['type'] == 'create-new-room':
            await self.create_new_room(data)
        elif text_data['type'] == 'join-room':
            await self.join_user_to_room(data)
        elif text_data['type'] == "conn-signal":
            await self.SignallingHandler(data)
        elif text_data['type'] == "conn-init":
            await self.InitialConnectionHandler(data)

    async def create_new_room(self, data):
        
        username = data['username']
        user = self.get_user(username)
        if user is not None:
            userInstance = await self.get_user_instance(username)
            room_id = data['roomID']
            room_name = data['title']

            newUser = {
                "identity": username,
                "id": userInstance.id,
                "socketId": self.channel_name,
                "isRoomHost": True,
                "roomID": room_id
            }

            connectedUsers.append(newUser)

            
            self.test.append(newUser)
            newRoom = {
                "id": room_id,
                "connectedUsers": self.test
            }
            await self.join_room(room_id)

            rooms.append(newRoom)

            response = {
                'type': 'room-id',
                'roomID': room_id,
            }
            await self.send_json_to_room(room_id,response)

            
            response = {
                'type': 'room-update',
                'connectedUsers': newRoom["connectedUsers"],
            }
            room = await self.save_room_and_user(room_id, room_name, userInstance)
            await database_sync_to_async(room.save)()
            await self.send_json_to_room(room_id,response)

    

    async def join_user_to_room(self, data):
       
        username = data['username']
        user = self.get_user(username)
        if user is not None:
            room_id = data['roomID']
            userInstance = await self.get_user_instance(username)
            old_room = await self.get_old_room(userInstance, room_id)
            if old_room is not None:
                newUser = {
                    "identity": username,
                    "id":  userInstance.id,
                    "socketId": self.channel_name,
                    "isRoomHost": True,
                    "roomID": room_id
                }
            else:
                newUser = {
                    "identity": username,
                    "id":  userInstance.id,
                    "socketId": self.channel_name,
                    "isRoomHost": False,
                    "roomID": room_id
                }
            room = next((r for r in rooms if r['id'] == room_id), None)
            
            if room:
                created_room = await self.get_created_room(room_id)
                room['connectedUsers'].append(newUser)
                await self.join_room(room_id)
                for user in room['connectedUsers']:
                    if user['socketId'] != self.channel_name:
                        data = {
                            "type":"conn-prepare",
                            'connUserSocketId': self.channel_name,
                            'connUserIdentity': newUser['identity'],
                            'connUserId': newUser['id']
                        }
                        await self.send_json_to_user(user['socketId'], data)
                connectedUsers.append(newUser)

                
            if old_room is None:
                room = await self.save_room_and_user(room_id, created_room.title, userInstance)
                await database_sync_to_async(room.save)()
            response = {
                    'type': 'room-update',
                    'connectedUsers': room["connectedUsers"],
            }
            await self.send_json_to_room(room_id,response)

    @database_sync_to_async
    def get_created_room(self, room_id):
        return Room.objects.filter(room_id=room_id).first()

    @database_sync_to_async
    def get_old_room(self, userInstance, room_id):
        return Room.objects.filter(created_by=userInstance).filter(room_id=room_id).first()

    async def leave_room(self):
        if self.room_id is not None:

            user = list(
                filter(lambda user: user['socketId'] == self.channel_name, connectedUsers))[0]
            if user:
                room = list(
                    filter(lambda room: room['id'] == user['roomID']))[0]
                room['connectedUsers'] = list(filter(
                    lambda user: user["socketId"] != self.channel_name, room['connectedUsers']))
                await self.channel_layer.group_discard(self.room_id, self.channel_name)
                response = {
                    'type': 'room-update',
                    'connectedUsers': connectedUsers,
                }
                await self.send_json(response)

    async def SignallingHandler(self, data):
        signal = data['signal']
        connUserSocketId = data['connUserSocketId']
        response = {
            "type": "conn-signal",
            "signal": signal,
            "connUserSocketId": self.channel_name
        }
        await self.send_json_to_user(connUserSocketId,response)

    async def InitialConnectionHandler(self, data):
        connUserSocketId = data['connUserSocketId']
        response = {
            "type":"conn-init",
            "connUserSocketId": self.channel_name
        }
        await self.send_json_to_user(connUserSocketId,response)

    @database_sync_to_async
    def get_connected_users(self, room_id):
        # Perform database operations or any other async operations here
        return []

    @database_sync_to_async
    def get_user(self, username):
        return User.objects.filter(username=username).first()

    @database_sync_to_async
    def get_user_instance(self, username):
        return User.objects.get(username=username)

    @database_sync_to_async
    def save_room_and_user(self, room_id, room_name, user):
        room = Room.objects.create(
            room_id=room_id,
            name=room_name,
            capacity=10,
            is_active=True,
            created_by=user
        )
        return room

    @database_sync_to_async
    def get_connectedUsers(self, room_id):
        pass

    @database_sync_to_async
    def get_rooms(self, room_id):
        pass

    async def join_room(self, room_id):
        
        self.room_name = room_id
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def room_update(self, event):
        connected_users = event['connectedUsers']
        response = {
            'type': 'room-update',
            'connectedUsers': connected_users,
        }
        await self.send_json(response)

    async def send_json_to_room(self, room_id, data):
        await self.channel_layer.group_send(
            room_id,
            {
                'type': 'send_json',
                'data': data
            }
        )


    async def send_json_to_user(self, socket_id, data):
        await self.channel_layer.send(
            socket_id,
            {
                'type': 'send_json',
                'data': data
            }
        )


    async def send_json(self, event):
        data = event['data']
        await self.send(text_data=json.dumps(data))
