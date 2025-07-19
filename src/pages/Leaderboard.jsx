import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Leaderboard.css';

const medals = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      if (!gameId) return;
      const gameRef = doc(db, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      const data = gameSnap.data();
      if (data && data.players) {
        const playerList = Object.values(data.players).map(p => ({ name: p.name, score: p.score || 0 }));
        playerList.sort((a, b) => b.score - a.score);
        setPlayers(playerList);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, [gameId]);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <h1 className="leaderboard-title">Leaderboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="leaderboard-list">
            {players.map((p, idx) => (
              <li key={p.name + idx} className="leaderboard-player">
                <span className="leaderboard-player-medal">{medals[idx] || ''}</span>
                <span className="leaderboard-player-name">{p.name}</span>
                <span className="leaderboard-player-score">{p.score} pts</span>
              </li>
            ))}
          </ul>
        )}
        <button className="btn btn-primary leaderboard-home-btn" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </div>
  );
}

export default Leaderboard; 