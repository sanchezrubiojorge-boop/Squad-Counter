import { GoogleGenAI } from "@google/genai";
import { Counter, LogEntry, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStats = async (
  users: User[],
  counters: Counter[],
  logs: LogEntry[]
): Promise<string> => {
  // Aggregate data
  const summary = counters.map(counter => {
    const counterLogs = logs.filter(l => l.counterId === counter.id);
    const userStats = users.map(user => {
      const count = counterLogs.filter(l => l.userId === user.id).length;
      return `${user.name}: ${count}`;
    }).join(', ');
    return `Counter "${counter.title}" (${counter.emoji}): [${userStats}]`;
  }).join('\n');

  const prompt = `
    You are a hilarious, high-energy sports commentator for a group of friends using a tracking app called SquadStats.
    The group is competing or tracking shared habits.
    
    Here is the current leaderboard data for the group:
    ${summary}

    Please provide a short, funny, and competitive commentary.
    - Mention specific users by name.
    - Highlight the winners and gently roast the slackers (those with 0 or low counts).
    - If there are multiple counters, mention the most active one.
    - Keep it under 150 words.
    - Use emojis generously.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not analyze stats right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The commentator is out for a snack (AI Error). Try again later!";
  }
};
