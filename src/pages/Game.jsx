import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import './Game.css';

const maxRounds = 3;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function Game() {
  const { gameId } = useParams();
  const playerId = sessionStorage.getItem('playerId');
  const [prompt, setPrompt] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [answers, setAnswers] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notSubmittedPlayers, setNotSubmittedPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(false);

  // Listen to the game doc for the prompt, round, and host status
  useEffect(() => {
    if (!gameId) return;
    const gameRef = doc(db, 'games', gameId);
    const unsub = onSnapshot(gameRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setPrompt(data.prompt);
        setRound(data.round || 1);
        setGameOver(data.round > maxRounds);
        // Host detection
        const player = data.players?.[playerId];
        setIsHost(player?.isHost || false);
        setLoadingPrompt(false); // <-- always set to false when data exists
      } else {
        setPrompt(null);
        setRound(1);
        setGameOver(false);
        setIsHost(false);
        setLoadingPrompt(true);
      }
    });
    return () => unsub();
  }, [gameId, playerId]);

  // Fetch player's answers and hasSubmitted status on mount and on round change
  useEffect(() => {
    async function fetchPlayerAnswers() {
      if (!gameId || !playerId) return;
      const gameRef = doc(db, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      const player = gameSnap.data()?.players?.[playerId];
      if (player) {
        setAnswers(player.answers || []);
        setHasSubmitted(!!player.hasSubmitted);
      } else {
        setAnswers([]);
        setHasSubmitted(false);
      }
    }
    fetchPlayerAnswers();
  }, [gameId, playerId, round]);

  // Real-time listener for players who haven't submitted
  useEffect(() => {
    if (!gameId) return;
    const gameRef = doc(db, 'games', gameId);
    const unsub = onSnapshot(gameRef, (docSnap) => {
      const data = docSnap.data();
      if (!data || !data.players) {
        setNotSubmittedPlayers([]);
        setAllSubmitted(false);
        return;
      }
      const notSubmitted = Object.values(data.players).filter(p => !p.hasSubmitted);
      setNotSubmittedPlayers(notSubmitted);
      setAllSubmitted(notSubmitted.length === 0);
    });
    return () => unsub();
  }, [gameId, round]);

  // Handle answer submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || answers.length >= 2 || hasSubmitted) return;
    setSubmitting(true);
    const newAnswers = [...answers, answerInput.trim()];
    setAnswers(newAnswers);
    setAnswerInput('');
    // Update Firestore
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      [`players.${playerId}.answers`]: newAnswers,
      [`players.${playerId}.hasSubmitted`]: newAnswers.length === 2
    });
    if (newAnswers.length === 2) setHasSubmitted(true);
    setSubmitting(false);
  };

  // Host: go to next round
  const handleNextRound = async () => {
    if (!isHost || !allSubmitted || round >= maxRounds) return;
    // Fetch all prompts
    const promptsRef = collection(db, 'prompts');
    const snapshot = await getDocs(promptsRef);
    const promptDocs = snapshot.docs;
    if (promptDocs.length === 0) return;
    // Pick a random prompt
    const randomDoc = promptDocs[getRandomInt(promptDocs.length)];
    const promptData = randomDoc.data();
    // Reset all players' answers and hasSubmitted
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    const players = gameSnap.data()?.players || {};
    const resetPlayers = {};
    Object.keys(players).forEach(pid => {
      resetPlayers[`players.${pid}.answers`] = [];
      resetPlayers[`players.${pid}.hasSubmitted`] = false;
    });
    await updateDoc(gameRef, {
      ...resetPlayers,
      prompt: promptData,
      round: round + 1
    });
  };

  return (
    <div className="game-container">
      <div className="game-card">
        <div className="game-content">
          <h1 className="game-title">Double Ditto</h1>
          <div className="game-round">{gameOver ? 'Game Over!' : `Round ${round} of ${maxRounds}`}</div>
          {loadingPrompt ? (
            <p>Loading prompt...</p>
          ) : (
            <div className="game-prompt">
              <span className="game-prompt-label">Prompt:</span>
              <span className="game-prompt-text">{prompt?.text}</span>
            </div>
          )}
          {!gameOver && (
            <form className="game-answer-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="game-answer-input"
                value={answerInput}
                onChange={e => setAnswerInput(e.target.value)}
                placeholder={hasSubmitted ? 'You have submitted both answers!' : 'Enter your answer'}
                disabled={hasSubmitted || answers.length >= 2 || submitting}
                maxLength={40}
              />
              <button
                type="submit"
                className="btn btn-primary game-answer-btn"
                disabled={hasSubmitted || answers.length >= 2 || !answerInput.trim() || submitting}
              >
                Submit
              </button>
            </form>
          )}
          <div className="game-answers-section">
            <h2 className="game-answers-title">Your Answers</h2>
            <ul className="game-answers-list">
              {answers.map((ans, idx) => (
                <li key={idx} className="game-answer-item">{ans}</li>
              ))}
            </ul>
          </div>
          <div className="game-not-submitted-section">
            <h2 className="game-answers-title">Players Yet to Submit</h2>
            <ul className="game-answers-list">
              {notSubmittedPlayers.length === 0 ? (
                <li className="game-answer-item">All players have submitted!</li>
              ) : (
                notSubmittedPlayers.map((p, idx) => (
                  <li key={p.name + idx} className="game-answer-item">{p.name}</li>
                ))
              )}
            </ul>
          </div>
          {isHost && !gameOver && allSubmitted && (
            <div className="game-next-round-section">
              <button
                className="btn btn-primary game-next-round-btn"
                onClick={handleNextRound}
                disabled={round >= maxRounds}
              >
                {round < maxRounds ? 'Next Round' : 'Finish Game'}
              </button>
            </div>
          )}
          {gameOver && (
            <div className="game-over-message">Game Over! Thanks for playing.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game; 