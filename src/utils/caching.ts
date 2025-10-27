import type {ScoreHistoryEntry, PreferenceStrings} from '../types';
import {Mode} from "../types";

const SCORE_HISTORY_KEY = 'score_history';
const PREFERENCES_KEY = 'saved_preferences';

export const getScoreHistory = (): ScoreHistoryEntry[] => {
    try {
        const stored = localStorage.getItem(SCORE_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load score history:', error);
        return [];
    }
}

export const addScoreToHistory = (mode: Mode, score: number, totalQuestions: number): void => {
    try {
        const history = getScoreHistory();
        const newEntry: ScoreHistoryEntry = {
            score: score,
            totalQuestions: totalQuestions,
            mode: mode,
            timestamp: Date.now(),
            percentage: Math.round((score / totalQuestions) * 100)
        };
        history.push(newEntry);
        localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save score to history:', error);
    }
}

export const savePreferences = (preferences: PreferenceStrings): void => {
    sessionStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export const getPreferences = (): PreferenceStrings | null => {
    const stored = sessionStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : null;
}