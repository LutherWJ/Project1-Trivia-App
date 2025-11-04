import type {GameRoom, PlayerResult} from "./types/multiplayerTypes";
import {Server, Socket} from "socket.io";
import {MULTIPLAYER_QUESTION_COUNT} from "./constants";

const startMatch = (room: GameRoom, io: Server) => {
    const playerResults = new Map<string, PlayerResult>();
    // Array that contains the ID of the winner for each question, null means tie.
    let scoreHistory: Array<string | null> = [];
    let questionIdx = 1;
    const socket1 = io.sockets.sockets.get(room.player1.id);
    const socket2 = io.sockets.sockets.get(room.player2.id);

    const answerHandler = (result: PlayerResult) => {
        playerResults.set(result.playerID, result);

        const p1 = playerResults.get(room.player1.id);
        const p2 = playerResults.get(room.player2.id);

        if (p1 && p2) {
            scoreHistory.push(decideWinner(p1, p2));

            io.to(room.player1.id).emit('resultDecided', scoreHistory[scoreHistory.length - 1]);
            io.to(room.player2.id).emit('resultDecided', scoreHistory[scoreHistory.length - 1]);

            // Clear results for next question
            playerResults.delete(room.player1.id);
            playerResults.delete(room.player2.id);

            questionIdx++;
            if (questionIdx === MULTIPLAYER_QUESTION_COUNT) {
                socket1?.off('answerQuestion', answerHandler);
                socket2?.off('answerQuestion', answerHandler);
            }
        }
    };

    socket1?.on('answerQuestion', answerHandler);
    socket2?.on('answerQuestion', answerHandler);

    return () => {
        socket1?.off('answerQuestion', answerHandler);
        socket2?.off('answerQuestion', answerHandler);
    }
}

const decideWinner = (p1: PlayerResult, p2: PlayerResult) => {
    if (!p1.isCorrect && !p2.isCorrect) return null;
    if (p1.isCorrect && !p2.isCorrect) return p1.playerID;
    if (!p1.isCorrect && p2.isCorrect) return p2.playerID;
    if (p1.timeAnswered > p2.timeAnswered) return p1.playerID;
    if (p1.timeAnswered < p2.timeAnswered) return p2.playerID;
    return null; // Rare case where both players answered correct at the exact same millisecond
}

export { startMatch };