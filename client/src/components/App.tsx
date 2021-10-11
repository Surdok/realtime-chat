import * as React from "react";
import { useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import io from "socket.io-client";
import { socket, userNameKey } from "../consts";
import { emitToSocket } from "../functions";
import moment from 'moment';
import "./../assets/scss/App.scss";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface chatMessage {
  date: string;
  message: string;
  userID: string;
}
interface User {
  userID: string;
  userName: string;
  socketID: string;
  connected: boolean;
}

interface IDNameMap { [key: string]: User }

const App = () => {

  const [chat, setChat] = useState<chatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [Username, setUsername] = useState('');
  const [IDUsersMap, setIDUsersMap] = useState<IDNameMap>({});
  const [users, setUsers] = useState<User[]>([]);

  const changeUsername = (username: string) => {
    emitToSocket('changeUsername', { data: { userName: username } });
    localStorage.setItem(userNameKey, username);
  };

  useEffect(() => {
    const currentUsername = localStorage.getItem(userNameKey) || '';
    setUsername(currentUsername);

    socket.on('chatHistory', (receivedChats: chatMessage[]) => {
      setChat(receivedChats);
    });

    socket.on('users', (users: User[]) => {
      const idNameMap = users.reduce<IDNameMap>((previous, current) => (previous[current.userID] = current, previous), {});
      setIDUsersMap(idNameMap);
      setUsers(users);
    });


  }, [])

  return (
    <div className="app">
      <div className="d-flex">
        <h1>Chattio</h1>
        <div className="connectedUsers">
          ({users.filter(v => v.connected === true).length}) users connected
        </div>
      </div>

      <form action="" onSubmit={(event) => {
        event.preventDefault();
        changeUsername(Username);
      }}>
        <div>
          <input type="text" value={Username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <button type="submit">
            Change Username
          </button>
        </div>
      </form>
      <br />
      <form action="" onSubmit={(event) => {
        event.preventDefault();
        // socket.emit('newMessage', { date: new Date().toISOString(), message: message } as chatMessage);
        emitToSocket('newMessage', { data: { date: new Date().toISOString(), message: message } });
        setMessage('');
      }}>
        <div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>

      <div>
        <p>
          Messages :
        </p>
        {
          chat.map((v, i) => (
            <div className="messageBlock" key={i}>
              <div className="d-flex">
                <div>
                  <b>
                    {IDUsersMap[v.userID]?.userName}
                  </b>
                </div>
                <div>
                  {moment(v.date).format('hh:mm A')}
                </div>
              </div>
              <div>
                {v.message}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

declare let module: Record<string, unknown>;

export default hot(module)(App);