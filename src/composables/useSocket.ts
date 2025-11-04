import { ref, readonly } from 'vue';
import { io, Socket } from "socket.io-client";
import type {GameRoom} from "../../server/types/multiplayerTypes.ts";

let socket: Socket | null = null;
const isConnected = ref<boolean>(false);
const room = ref<GameRoom | null>(null);

const useSocket = () => {
    if (!socket) {
        const serverUrl = 'http://localhost:3000';
        socket = io(serverUrl, {
            autoConnect: true,
        });

        socket.on('connect', () => {
            isConnected.value = true;
            console.log(`Connected as ${socket!.id}`);
        });

        socket.on('disconnect', () => {
            isConnected.value = false;
            console.log('Disconnected from server');
        });
    }

    const on = <T = any>(event: string, handler: (data: T) => void) => {
        socket!.on(event, handler);

        // Return a cleanup function
        return () => {
            socket?.off(event, handler);
        };
    };

    const emit = (event: string, ...args: any[]) => {
        socket!.emit(event, ...args);
    };

    return {
        socket,
        isConnected: readonly(isConnected),
        room,
        on,
        emit,
        get id() {
            return socket?.id;
        }
    };
}

const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        isConnected.value = false;
        room.value = null;
    }
}

export {useSocket, disconnectSocket};
