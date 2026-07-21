# Socket Events Documentation

## Client → Server Events

### `join_admin_dashboard`
- **Payload**: None
- **Description**: Subscribes client to admin live users updates.

### `create_room`
- **Payload**: None
- **Description**: Creates a new anonymous chat room.

### `join_room`
- **Payload**: `{ "roomCode": "...", "username": "..." }`
- **Description**: Joins an existing anonymous room.

### `send_message`
- **Payload**: `{ "roomCode": "...", "text": "...", "username": "...", "replyTo": null }`
- **Description**: Sends a message to a room.

### `typing`
- **Payload**: `{ "roomCode": "...", "username": "...", "isTyping": true }`
- **Description**: Broadcasts typing status in a room.

### `dm_send`
- **Payload**: `{ "conversationId": "...", "content": "...", "type": "text", "messageId": "..." }`
- **Description**: Sends a direct message.

### `dm_typing`
- **Payload**: `{ "conversationId": "...", "isTyping": true }`
- **Description**: Indicates typing in a DM.

### `dm_seen`
- **Payload**: `{ "conversationId": "..." }`
- **Description**: Marks DM as seen.

### `dm_reaction`
- **Payload**: `{ "conversationId": "...", "messageId": "...", "emoji": "👍" }`
- **Description**: Reacts to a DM.

### `send_notification`
- **Payload**: `{ "receiverId": "...", "type": "...", "message": "..." }`
- **Description**: Triggers a notification for a user.

## Server → Client Events

### `live_users_update`
- **Payload**: `["userId1", "userId2"]`
- **Description**: List of currently online user IDs.

### `admin_live_users`
- **Payload**: `["userId1", "userId2"]`
- **Description**: List of currently online user IDs for admin.

### `room_created`
- **Payload**: `"ROOMCODE"`
- **Description**: Returns the generated room code.

### `user_list`
- **Payload**: `[{ "id": "...", "username": "..." }]`
- **Description**: Current users in an anonymous room.

### `receive_message`
- **Payload**: `{ "username": "...", "text": "...", "timestamp": "...", "type": "..." }`
- **Description**: A message received in an anonymous room.

### `display_typing`
- **Payload**: `{ "username": "...", "isTyping": true }`
- **Description**: Someone is typing in an anonymous room.

### `dm_receive`
- **Payload**: `{ "_id": "...", "senderId": { ... }, "content": "...", "createdAt": "..." }`
- **Description**: Received a direct message.

### `dm_typing`
- **Payload**: `{ "userId": "...", "isTyping": true, "conversationId": "..." }`
- **Description**: Partner is typing in a DM.

### `dm_seen`
- **Payload**: `{ "conversationId": "...", "userId": "..." }`
- **Description**: Partner saw the messages.

### `dm_reaction`
- **Payload**: `{ "messageId": "...", "emoji": "...", "userId": "...", "conversationId": "..." }`
- **Description**: Partner reacted to a DM.

### `notification`
- **Payload**: `{ "type": "...", "message": "..." }`
- **Description**: Received a system notification (e.g. friend request).
