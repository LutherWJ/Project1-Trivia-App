import type {Preferences, Result, TriviaAPIResponse} from "../types";
import {err, ok} from "../types";

// Dynamically generate API link based on user preferences
export const generateAPILink = (p: Preferences): string => {
    const params = new URLSearchParams();
    params.append('amount', p.quantity.toString());
    params.append('type', 'multiple');
    if (p.category !== 0) {
        params.append('category', p.category.toString());
    }
    if (p.difficulty !== "Any") {
        params.append('difficulty', p.difficulty.toLowerCase());
    }
    return `https://opentdb.com/api.php?${params.toString()}`;
}

// Make a request to the API for the questions
export const fetchQuestions = async (p: Preferences): Promise<Result<TriviaAPIResponse, string>> => {
    const apiLink = generateAPILink(p);
    try {
        const res = await fetch(apiLink);
        if (!res.ok) {
            return err(res.statusText);
        }
        const data: TriviaAPIResponse = await res.json();

        // Check API response code
        if (data.response_code !== 0) {
            const errorMessages: Record<number, string> = {
                1: 'No results found for the given parameters',
                2: 'Invalid parameter in request',
                3: 'Session token not found',
                4: 'Session token has returned all possible questions',
                5: 'Rate limit exceeded'
            };
            return err(errorMessages[data.response_code] || 'Unknown API error');
        }

        return ok(data);
    } catch (e) {
        return err(e instanceof Error ? e.message : 'Unknown error');
    }
}
