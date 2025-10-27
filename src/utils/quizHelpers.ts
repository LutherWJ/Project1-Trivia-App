import type {AnswerChoice, Question, Result} from "../types";
import {err, ok} from "../types";

// Refactor notes: Too many side effects in these functions made them hard to reuse and track changes
// From now on I'm taking a more functional approach to keep my head clear.

export const shuffleAnswers = (question: Question): Result<AnswerChoice[], Error> => {
  if (!question) {
    return err(new Error("Question was not found."));
  }

  const choices: AnswerChoice[] = [
    ...question.incorrect_answers.map(answer => ({ answer, isCorrect: false })),
    { answer: question.correct_answer, isCorrect: true }
  ];

  // Fisher-Yates shuffle algorithm that showed up when I googled simple sort algorithm
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-ignore shut up, I already null checked
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return ok(choices);
}

export const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export const decodeAnswerChoices = (choices: AnswerChoice[]): AnswerChoice[] => {
  return choices.map(choice => ({
    answer: decodeHtml(choice.answer),
    isCorrect: choice.isCorrect
  }));
}
