import { socket, userIDKey } from "./consts";

export function emitToSocket(event: string, data: { data: object }) {
    socket.emit(event, { ...data, userID: localStorage.getItem(userIDKey) });
};
