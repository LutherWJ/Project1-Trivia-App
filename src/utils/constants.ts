// Map of category names and their associated ID in the Trivia API
export const CATEGORIES = new Map<string, number>([
  ["Random", 0],
  ["General Knowledge", 9],
  ["Entertainment: Books", 10],
  ["Entertainment: Film", 11],
  ["Entertainment: Music", 12],
  ["Entertainment: Musicals & Theatres", 13],
  ["Entertainment: Television", 14],
  ["Entertainment: Video Games", 15],
  ["Entertainment: Board Games", 16],
  ["Science & Nature", 17],
  ["Science: Computers", 18],
  ["Science: Mathematics", 19],
  ["Mythology", 20],
  ["Sports", 21],
  ["Geography", 22],
  ["History", 23],
  ["Politics", 24],
  ["Art", 25],
  ["Celebrities", 26],
  ["Animals", 27],
  ["Vehicles", 28],
  ["Entertainment: Comics", 29],
  ["Science: Gadgets", 30],
  ["Entertainment: Japanese Anime & Manga", 31],
  ["Entertainment: Cartoon & Animations", 32],
]);
export const CATEGORY_NAMES = Array.from(CATEGORIES.keys());

export const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"] as const;

export const QUANTITIES = ["1", "3", "5", "7", "10", "15", "20"] as const;
