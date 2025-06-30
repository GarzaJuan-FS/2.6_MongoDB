import { useState, useEffect } from "react";
import { gameAPI } from "../services/api";
import "./GameList.css";

const GameList = ({ onSelectGame, onCreateGame }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getAllGames();
      setGames(data.games || []);
    } catch (err) {
      setError("Failed to fetch games");
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gameAPI.deleteGame(gameId);
        setGames(games.filter((game) => game._id !== gameId));
      } catch (err) {
        setError("Failed to delete game");
        console.error("Error deleting game:", err);
      }
    }
  };

  if (loading) return <div className="loading">Loading games...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="game-list">
      <div className="game-list-header">
        <h2>Game Reviews</h2>
        <button className="create-btn" onClick={onCreateGame}>
          Add New Game
        </button>
      </div>

      {games.length === 0 ? (
        <div className="no-games">
          <p>No games found. Create your first game review!</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <div key={game._id} className="game-card">
              <div className="game-header">
                <h3 className="game-title">{game.title}</h3>
                <div className="game-rating">
                  ⭐ {game.rating ? game.rating.toFixed(1) : "No rating"}
                </div>
              </div>

              <div className="game-details">
                <p>
                  <strong>Genre:</strong> {game.genre}
                </p>
                <p>
                  <strong>Platform:</strong>{" "}
                  {game.platform?.join(", ") || "Not specified"}
                </p>
                <p>
                  <strong>Developer:</strong> {game.developer || "Unknown"}
                </p>
                {game.releaseDate && (
                  <p>
                    <strong>Release Date:</strong>{" "}
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {game.description && (
                <p className="game-description">{game.description}</p>
              )}

              <div className="game-actions">
                <button className="view-btn" onClick={() => onSelectGame(game)}>
                  View Details
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(game._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;
