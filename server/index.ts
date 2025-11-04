import express from 'express';
import {createServer} from 'http';
import {Server as Engine} from '@socket.io/bun-engine';
import {Server} from 'socket.io';
import {
    addPlayerToQueue,
    destroyRoom, getRoom,
    makeRoom,
    makeStartTime,
    readyPlayer,
    removePlayerFromQueue
} from './matchmaking';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import {startMatch} from "./game";

const app = express();
const httpServer = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}));

app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const engine = new Engine;
io.bind(engine);

app.get('/health', (req, res) => {
    res.json({status: 'ok', message: 'Triviadle server is running'});
});

// Track which room each socket is in; key is playerID value is roomID.
const socketRooms = new Map<string, string>();
// Ensures we can call cleanup functions on disconnect; key is roomID.
const gameCleanup = new Map<string, () => void>;

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Put the user in queue and try to find them a match
    socket.on('findMatch', async (name: string) => {
        addPlayerToQueue(socket.id, name);
        const room = await makeRoom();

        if (room === null) {
            socket.emit('queueEntered');
            return;
        }

        socketRooms.set(room.player1.id, room.id);
        socketRooms.set(room.player2.id, room.id);

        io.sockets.sockets.get(room.player1.id)?.join(room.id);
        io.sockets.sockets.get(room.player2.id)?.join(room.id);

        io.to(room.player1.id).emit('matchFound');
        io.to(room.player2.id).emit('matchFound');
    });

    // Register that the user accepted the queue and
    socket.on('acceptMatch', () => {
        const roomID = socketRooms.get(socket.id);
        if (!roomID) {
            socket.emit('matchCancelled');
            return;
        }

        const room = getRoom(roomID);

        // Start game and send game info if both players are ready
        const isStarted = readyPlayer(roomID, socket.id);
        if (isStarted instanceof Error) {
            destroyRoom(roomID);
            socket.emit('matchCancelled');
        } else if (isStarted) {
            makeStartTime(room);
            gameCleanup.set(roomID, startMatch(room, io));
            io.to(roomID).emit('matchStarted', room);
        }
    });

    socket.on('cancelMatch', () => {
        removePlayerFromQueue(socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Lots of cleanup
        const roomID = socketRooms.get(socket.id);
        if (roomID) {
            const room = getRoom(roomID);
            io.to(room.player1.id).emit('matchCancelled', "Opponent disconnected");
            io.to(room.player2.id).emit('matchCancelled', "Opponent disconnected");

            gameCleanup.get(roomID)?.();
            socketRooms.delete(room.player1.id);
            socketRooms.delete(room.player2.id);
            gameCleanup.delete(roomID);
            destroyRoom(roomID);
        }

        removePlayerFromQueue(socket.id);
    });
});

// Serve static Vue build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    // Allow Vue to handle routing; Always give index.html.
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for connections`);
});

export {app, io};