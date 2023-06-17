# myapp/consumers.py

import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
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
        print(text_data)
        
        data = text_data['data']
        if text_data['type'] == 'create-new-room':
            await self.create_new_room(data)
        elif text_data['type'] == 'join-room':
            await self.join_user_to_room(data)

    async def create_new_room(self, data):
        identity = data['identity']
        room_id = data['roomID']
        is_room_host = data['isRoomHost']

        
        newUser = {
            "identity":identity,
            "id":"user-" + str(uuid4()),
            "socketId":self.channel_name,
            "isRoomHost":is_room_host,
            "roomID":room_id
        }

        connectedUsers.append(newUser)
        
        print('connectedUsers',connectedUsers)
        self.test.append(newUser)
        newRoom = {
            "id":room_id,
            "connectedUsers":self.test
        }
        await self.join_room(room_id)

        rooms.append(newRoom)


        response = {
            'type': 'room-id',
            'roomID': room_id,
        }
        await self.send_json(response)

        # connected_users = await self.get_connected_users(room_id)
        # print(connected_users)
        response = {
            'type': 'room-update',
            'connectedUsers': newRoom["connectedUsers"],
        }
        await self.send_json(response)

    async def join_user_to_room(self, data):
        print(rooms)
        identity = data['identity']
        room_id = data['roomID']
        is_room_host = data['isRoomHost']
        newUser = {
            "identity":identity,
            "id":"user-" + str(uuid4()),
            "socketId":self.channel_name,
            "isRoomHost":is_room_host,
            "roomID":room_id
        }
        room = list(filter(lambda room:room['id']==room_id,rooms))[0]
        print('room',room)
        if room:
            room['connectedUsers'].append(newUser)
            await self.join_room(room_id)
            connectedUsers.append(newUser)

        
        
        # connected_users = await self.get_connected_users(room_id)
            response = {
                'type': 'room-update',
                'connectedUsers': room["connectedUsers"],
            }
            await self.send_json(response)

    async def leave_room(self):
        if self.room_id is not None:
            
            user = list(filter(lambda user:user['socketId']==self.channel_name,connectedUsers))[0]
            if user:
                room = list(filter(lambda room:room['id']==user['roomID']))[0]
                room['connectedUsers'] = list(filter(lambda user:user["socketId"]!=self.channel_name,room['connectedUsers']))
                await self.channel_layer.group_discard(self.room_id, self.channel_name)
                response = {
                    'type': 'room-update',
                    'connectedUsers': connectedUsers,
                }
                await self.send_json(response)

    @database_sync_to_async
    def get_connected_users(self, room_id):
        # Perform database operations or any other async operations here
        return []

    async def join_room(self, room_id):
        print(room_id)
        self.room_name = room_id
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def room_update(self, event):
        connected_users = event['connectedUsers']
        response = {
            'type': 'room-update',
            'connectedUsers': connected_users,
        }
        await self.send_json(response)
