import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import './Leaderboard.css';

const medals = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const playerId = sessionStorage.getItem('playerId');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add player to viewers on mount, remove on unmount or beforeunload
  useEffect(() => {
    if (!gameId || !playerId) return;
    const gameRef = doc(db, 'games', gameId);
    
    // Add to viewers
    updateDoc(gameRef, { viewers: arrayUnion(playerId) });
    
    // Remove from viewers and delete doc if empty
    const removeViewerAndMaybeDelete = async () => {
      try {
        await updateDoc(gameRef, { viewers: arrayRemove(playerId) });
        // Check if viewers is now empty
        const snap = await getDoc(gameRef);
        const data = snap.data();
        if (!data || !data.viewers || data.viewers.length === 0) {
          await deleteDoc(gameRef);
          console.log('Game doc deleted');
        }
      } catch (error) {
        console.error('Error removing viewer:', error);
      }
    };
    
    // For beforeunload, we can't use async, so we'll just remove the viewer
    const handleBeforeUnload = () => {
      updateDoc(gameRef, { viewers: arrayRemove(playerId) });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      removeViewerAndMaybeDelete();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameId, playerId]);

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
            {(() => {
              let lastScore = null;
              let medalIdx = 0;
              let count = 0;
              return players.map((p, idx) => {
                count++;
                if (lastScore === null || p.score !== lastScore) {
                  medalIdx = count - 1;
                }
                lastScore = p.score;
                let medal = '';
                if (medalIdx < medals.length) {
                  medal = medals[medalIdx];
                }
                return (
                  <li key={p.name + idx} className="leaderboard-player">
                    <span className="leaderboard-player-medal">{medal}</span>
                    <span className="leaderboard-player-name">{p.name}</span>
                    <span className="leaderboard-player-score">{p.score} pts</span>
                  </li>
                );
              });
            })()}
          </ul>
        )}
        <button className="btn btn-primary leaderboard-home-btn" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </div>
  );
}

export default Leaderboard; 