import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // Your Firebase config/init

export async function createGame(playerId, playerName) {
  const gameId = generateJoinCode(); // e.g. a 6-letter string like "X7KP2F"
  const gameRef = doc(db, "games", gameId);

  const gameData = {
    hostId: playerId,
    status: "lobby",
    round: 0,
    prompt: "",
    players: {
      [playerId]: {
        name: playerName,
        score: 0,
        answers: [],
        hasSubmitted: false,
        isHost: true
      }
    },
    createdAt: serverTimestamp()
  };

  await setDoc(gameRef, gameData);
  return gameId;
}

// You can add this simple helper here too
function generateJoinCode(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
