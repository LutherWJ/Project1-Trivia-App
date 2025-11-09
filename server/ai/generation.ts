import {MODEL, OLLAMA_API_URL} from "../constants";
import {err, ok, Question, Result} from "../../src/types";

const generateSingleQuestion = async (topic: string, questionNumber: number): Promise<Result<Question, any>> => {
    const prompt = `Generate ONE trivia question about ${topic}.

Return in this EXACT JSON format:
{
  "category": "${topic}",
  "type": "multiple",
  "difficulty": "medium",
  "question": "Your question here?",
  "correct_answer": "Short answer",
  "incorrect_answers": ["Wrong 1", "Wrong 2", "Wrong 3"]
}

RULES:
- Keep ALL answers SHORT (1-5 words max)
- Provide exactly 3 incorrect answers
- Return ONLY valid JSON, no extra text`;

    try {
        const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.8,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            return err(new Error(`HTTP ${response.status}`));
        }

        const data = await response.json();
        const question = JSON.parse(data.response);

        // Validate single question
        if (
            typeof question.category === 'string' &&
            typeof question.type === 'string' &&
            typeof question.difficulty === 'string' &&
            typeof question.question === 'string' &&
            typeof question.correct_answer === 'string' &&
            Array.isArray(question.incorrect_answers) &&
            question.incorrect_answers.length === 3
        ) {
            console.log(`Generated question ${questionNumber}: "${question.question.substring(0, 50)}..."`);
            return ok(question);
        }

        return err(new Error('Question validation failed'));
    } catch (error) {
        return err(error);
    }
};

// For some reason our model hates arrays and only returns one question at time, don't use this.
const generateQuestions = async (topic: string, count: number): Promise<Result<Question[], any>> => {
    const questions: Question[] = [];
    const maxRetries = 2;

    for (let i = 0; i < count; i++) {
        let success = false;
        let lastError: any = null;

        // Try to generate this question with retries
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const result = await generateSingleQuestion(topic, i + 1);

            if (result.ok) {
                questions.push(result.value);
                success = true;
                break;
            } else {
                lastError = result.value;
                if (attempt < maxRetries) {
                    console.log(`  Retry ${attempt}/${maxRetries} for question ${i + 1}...`);
                }
            }
        }

        if (!success) {
            console.error(`Failed to generate question ${i + 1} after ${maxRetries} attempts`);
            return err(lastError || new Error(`Failed to generate question ${i + 1}`));
        }
    }

    console.log(`Successfully generated all ${count} questions`);
    return ok(questions);
}

// Returns bool indicating whether the shape of the object is valid
const validateQuestions = (questions: any, count: number): boolean => {
    if (!Array.isArray(questions)) {
        console.error('Questions is not an array:', typeof questions);
        return false;
    }

    if (questions.length !== count) {
        console.error(`Expected ${count} questions, got ${questions.length}`);
        return false;
    }

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (
            typeof q.category !== 'string' ||
            typeof q.type !== 'string' ||
            typeof q.difficulty !== 'string' ||
            typeof q.question !== 'string' ||
            typeof q.correct_answer !== 'string' ||
            !Array.isArray(q.incorrect_answers) ||
            q.incorrect_answers.length !== 3
        ) {
            console.error(`Question ${i} failed validation:`, q);
            return false;
        }
    }

    return true;
}


export { generateQuestions, validateQuestions };
