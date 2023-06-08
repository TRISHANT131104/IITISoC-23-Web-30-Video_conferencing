# websocket_app/consumers.py

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.userID = None
        self.room_group_name = 'room_group'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_disconnected',
                    'userID': self.userID,
                }
            )

        await super().disconnect(close_code)

    async def receive_json(self, text_data):
        text_data_json = text_data
        event = text_data_json['event']
        print(text_data_json)
        if event == 'join-room':
            self.userID = text_data_json['userID']
            print(self.userID)
            await self.join_room(text_data_json['roomID'], text_data_json['userID'])
        elif event == 'sent-connection':
            await self.send_type(text_data_json['roomID'])

    async def join_room(self, roomID, userID):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_connected',
                'roomID': roomID,
                'userID': userID,
                
                
            }
        )
        await self.channel_layer.group_add(roomID, self.channel_name)

    async def user_connected(self, event):
        await self.send_json({
            'event': 'user-connected',
            'userID': event['userID'],
            
            
        })

    
    async def user_disconnected(self, event):
        print('user diconnected called')
        await self.send_json({
            'event': 'user-disconnected',
            'userID': self.userID,
        })
