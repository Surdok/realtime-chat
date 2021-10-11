import { io } from "socket.io-client";
import { v4 as uuid4 } from 'uuid';

export const userIDKey = 'userID';
export const userNameKey = 'userName';

export const socket = io("ws://172.30.216.74:8080", {
    reconnectionDelayMax: 10000,
}).on('connect', () => {
    const currentUsername = localStorage.getItem(userNameKey) || '';
    const storedUserID = localStorage.getItem(userIDKey);
    let userID = '';

    if (!storedUserID) {
        userID = uuid4();
        localStorage.setItem(userIDKey, userID);
    } else {
        userID = storedUserID;
    }

    socket.emit('sendUserID', { userID, userName: currentUsername });
});
