export type BotMessage = { id: string; role: 'user' | 'assistant'; text: string };

export type BotFeedbackState = Record<string, 'like' | 'dislike'>;
