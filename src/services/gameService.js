import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
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

export async function joinGame(gameId, playerId, playerName) {
  const gameRef = doc(db, "games", gameId);
  
  // Check if player is already in the game and preserve their host status
  const gameDoc = await getDoc(gameRef);
  const gameData = gameDoc.data();
  const existingPlayer = gameData?.players?.[playerId];
  
  const isHost = existingPlayer?.isHost || false;
  
  // Add player to the players map (merge: true)
  await setDoc(
    gameRef,
    {
      players: {
        [playerId]: {
          name: playerName,
          score: 0,
          answers: [],
          hasSubmitted: false,
          isHost: isHost
        }
      }
    },
    { merge: true }
  );
}

export async function removePlayer(gameId, playerId) {
  const gameRef = doc(db, "games", gameId);
  // Remove player from the players map
  await updateDoc(gameRef, {
    [`players.${playerId}`]: deleteField()
  });
}

// You can add this simple helper here too
function generateJoinCode(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

import { deleteField } from "firebase/firestore";
