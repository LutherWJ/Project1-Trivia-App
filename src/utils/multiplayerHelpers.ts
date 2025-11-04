import type {GameRoom} from "../../server/types/multiplayerTypes.ts";
import type {PlayerResult} from "../types";
import {QUESTION_TIME_LIMIT} from "./constants.ts";

const findOpponentName = (currentRoom: GameRoom): string => {
    if (currentRoom.player1.id === id) {
        return currentRoom.player2.name;
    }
    return currentRoom.player1.name;
}

const handleTimeout = () => {
    isQuestionAnswered.value = true;

    const playerResult: PlayerResult = {
        roomID: room.value!.id,
        playerID: id!,
        isCorrect: false,
        timeAnswered: QUESTION_TIME_LIMIT
    }

    emit('answerQuestion', playerResult);
}

