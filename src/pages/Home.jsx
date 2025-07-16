import { useState } from 'react';
import { createGame } from '../services/gameService';
import './Home.css';

function Home() {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Generate a simple player ID for now
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const gameId = await createGame(playerId, playerName.trim());
      
      // For now, just show the game code
      alert(`Game created! Share this code with others: ${gameId}`);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating game:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !joinCode.trim()) {
      setError('Please enter both your name and the game code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // TODO: Implement join game functionality
      alert(`Joining game: ${joinCode.toUpperCase()}`);
    } catch (err) {
      setError('Failed to join game. Please check the code and try again.');
      console.error('Error joining game:', err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        {/* Header */}
        <div className="home-header">
          <h1 className="home-title">Double Ditto</h1>
          <p className="home-subtitle">Create or join a game</p>
        </div>

        {/* Player Name Input */}
        <div className="input-group">
          <label htmlFor="playerName" className="input-label">
            Your Name
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="text-input"
            maxLength={20}
          />
        </div>

        {/* Create Game Section */}
        <div className="section">
          <h2 className="section-title">Create New Game</h2>
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="btn btn-primary"
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </button>
        </div>

        {/* Divider */}
        <div className="divider">
          <span className="divider-text">OR</span>
        </div>

        {/* Join Game Section */}
        <div className="section">
          <h2 className="section-title">Join Existing Game</h2>
          <div className="input-group">
            <label htmlFor="joinCode" className="input-label">
              Game Code
            </label>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter game code"
              className="text-input code-input"
              maxLength={6}
            />
          </div>
          <button
            onClick={handleJoinGame}
            disabled={isJoining}
            className="btn btn-secondary"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Game Rules Preview */}
        <div className="rules-section">
          <h3 className="rules-title">How to Play</h3>
          <ul className="rules-list">
            <li>• Create a game and share the code with friends</li>
            <li>• Players take turns writing answers to prompts</li>
            <li>• Match other players' answers to score points</li>
            <li>• The player with the most matches wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home; 