import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// tslint:disable-next-line: class-name
interface User {
    userID: string;
    userName: string;
    socketID: string;
    connected: boolean;
}

interface ChatMessage {
    date: string;
    message: string;
    userID: string;
}

interface EmitRequest<T> {
    data: T;
    userID: string;
}

const app = express();
app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    exposedHeaders: '*',
    methods: '*',
    preflightContinue: true
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const port = 8080; // default port to listen
const ip = '0.0.0.0';

// define a route handler for the default home page
app.get('/', (req, res) => {
    // render the index template
    res.json({
        status: res.statusCode,
        message: 'Success! Server runing on ' + ip + ':' + port,
    });
});

const chat: ChatMessage[] = [];
let users: User[] = [];
io.on('connection', (socket) => {
    const emitHistory = () => {
        io.emit('chatHistory', chat);
    };

    const emitUsers = () => {
        io.emit('users', users);
    };

    emitHistory();

    socket.on('disconnect', (data) => {

        const disconnectedUser: User = users.find(v => v.socketID === socket.id);
        if (disconnectedUser) {
            disconnectedUser.connected = false;
        }

        console.log(`User ${disconnectedUser.userName} with Id ${disconnectedUser.userID}, SocketID : ${disconnectedUser.socketID} has disconnected`);

        emitUsers();
    });

    socket.on('sendUserID', (request: { userID: string; userName: string; }) => {
        const { userID, userName } = request;
        const userFound = users.find(v => v.userID === userID);

        if (userFound === undefined) {

            users.push({
                userID,
                userName,
                socketID: socket.id,
                connected: true,
            });
            console.log(`Registered new user ${userName} with id : ${userID}, SocketID : ${socket.id}`);
        } else {

            userFound.connected = true;
            userFound.socketID = socket.id;

            console.log(`User ${userName} with id ${userID} is already registered. Connected`);

        }
        emitUsers();

    });

    socket.on('newMessage', (receivedMessage: EmitRequest<ChatMessage>) => {
        // console.log('New Message!', receivedMessage);
        chat.unshift({ userID: receivedMessage.userID, ...receivedMessage.data });

        emitHistory();
    });

    socket.on('changeUsername', (usernameChangeRequest: EmitRequest<{ userName: string }>) => {

        const userIndex = users.findIndex(v => v.userID === usernameChangeRequest.userID);

        if (userIndex > -1) {
            users[userIndex].userName = usernameChangeRequest.data.userName;
        } else {
            console.error('User not found with id : ' + usernameChangeRequest.userID);
        }

        emitUsers();
    });
});


// start the express server
server.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://${ip}:${port}`);
});
