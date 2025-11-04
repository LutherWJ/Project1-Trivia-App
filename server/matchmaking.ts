import {Player, GameRoom} from "./types/multiplayerTypes";
import {fetchQuestions} from "../src/utils/api";
import {Preferences, Result, TriviaAPIResponse} from "../src/types";

let playerQueue: Player[] = [];
let rooms = new Map<string, GameRoom>();

// Makes and returns a room if 2 players are in queue, returns null otherwise.
const makeRoom = async (): Promise<GameRoom | null> => {
    if (playerQueue.length < 2) return null;

    const defaultPrefs: Preferences = {
        quantity: 10,
        category: 0,
        difficulty: 'Any',
    }
    const player1: Player = takePlayerFromQueue();
    const player2: Player = takePlayerFromQueue();
    const roomCode: string = Bun.MD5.hash(player1.id + player2.id, "hex");

    const questions: Result<TriviaAPIResponse, string> = await fetchQuestions(defaultPrefs);
    if (!questions.ok) {
        // TODO: CANCEL QUEUE FOR PLAYERS ON FAILURE
        console.error(`Failed to fetch questions: ${questions.error}`)
        return null;
    }

    player1.ready = false;
    player2.ready = false;

    const room: GameRoom = {
        id: roomCode,
        player1: player1,
        player2: player2,
        currentQuestionIndex: 0,
        questions: questions.value.results,
        startTime: null
    }
    rooms.set(roomCode, room);
    return room;
}

const readyPlayer = (roomID: string, playerID: string): boolean | Error => {
    const room = rooms.get(roomID);

    if (room.player1.id === playerID) {
        room.player1.ready = true;
    } else if (room.player2.id === playerID) {
        room.player2.ready = true;
    } else {
        destroyRoom(room.id);
        return Error(`Player ${playerID} is not in room ${room.id}`);
    }

    if (room.player1.ready === true && room.player2.ready === true) {
        return true;
    }
    return false;
}

const destroyRoom = (roomCode: string) => {
    rooms.delete(roomCode);
}

const addPlayerToQueue = (id: string, name: string) => {
    const player: Player = {
        id: id,
        name: name,
        score: 0,
        ready: false,
    }
    playerQueue.push(player);
}

const removePlayerFromQueue = (id: string) => {
    for (let i=0; i<playerQueue.length; i++) {
        if (playerQueue[i].id === id) {
            playerQueue.splice(i, 1);
        }
    }
}

const takePlayerFromQueue = (): Player => {
    return playerQueue.shift();
}

const getRoom = (id: string): GameRoom => {
    return rooms.get(id);
}

const makeStartTime = (room: GameRoom) => {
    room.startTime = Date.now() + 5000;
}

export {makeRoom, addPlayerToQueue, takePlayerFromQueue, removePlayerFromQueue, readyPlayer, destroyRoom, getRoom, makeStartTime};