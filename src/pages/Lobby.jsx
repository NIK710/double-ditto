import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { joinGame, removePlayer } from '../services/gameService';
import './Lobby.css';

function Lobby() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const playerId = sessionStorage.getItem('playerId');
  const playerName = sessionStorage.getItem('playerName');

  // Join game if not already present
  useEffect(() => {
    if (!playerId || !playerName || !gameId) {
      navigate('/');
      return;
    }
    // Only join if we haven't already joined and the player is not in the list
    if (!hasJoined) {
      const isPlayerInGame = players.some(p => p.name === playerName);
      if (!isPlayerInGame) {
        joinGame(gameId, playerId, playerName);
        setHasJoined(true);
      } else {
        setHasJoined(true);
      }
    }
    // Remove player only when closing the tab
    const handleBeforeUnload = async () => {
      await removePlayer(gameId, playerId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line
  }, [gameId, playerId, playerName, hasJoined, players]);

  // Listen for player list updates and game status
  useEffect(() => {
    if (!gameId) return;
    const gameRef = doc(db, 'games', gameId);
    const unsub = onSnapshot(gameRef, (docSnap) => {
      const data = docSnap.data();
      if (!data) {
        setPlayers([]);
        setLoading(false);
        return;
      }
      // Redirect to game page if status is 'playing'
      if (data.status === 'playing') {
        navigate(`/game/${gameId}`);
        return;
      }
      const playerList = data.players ? Object.values(data.players) : [];
      setPlayers(playerList);
      // Check if current player is host by looking up their specific playerId
      const currentPlayer = data.players?.[playerId];
      setIsHost(currentPlayer?.isHost || false);
      setLoading(false);
    });
    return () => unsub();
  }, [gameId, playerId, navigate]);

  const handleStartGame = async () => {
    if (!isHost) return;
    setStartingGame(true);
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'playing'
      });
      // Host will be redirected by the listener
    } catch (error) {
      console.error('Error starting game:', error);
      setStartingGame(false);
    }
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">Game Lobby</h1>
        <p className="lobby-subtitle">Game Code: <b>{gameId}</b></p>
        <div className="lobby-players-section">
          <h2 className="lobby-players-title">Players</h2>
          {loading ? (
            <div>Loading players...</div>
          ) : players.length === 0 ? (
            <div>No players in the lobby.</div>
          ) : (
            <ul className="lobby-players-list">
              {players.map((p, idx) => (
                <li key={p.name + idx} className="lobby-player">
                  {p.name}
                  {p.isHost && <span className="lobby-player-host"> (Host)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isHost && (
          <div className="lobby-start-section">
            <button 
              onClick={handleStartGame}
              disabled={startingGame}
              className="btn btn-primary"
            >
              {startingGame ? 'Starting Game...' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby; 