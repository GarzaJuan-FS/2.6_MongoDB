import { useState, useEffect } from "react";
import { ratingAPI } from "../services/api";
import "./GameDetail.css";

const GameDetail = ({ game, onBack, onEdit }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (game) {
      fetchRatings();
    }
  }, [game]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingAPI.getRatingsByGame(game._id);
      setRatings(data.ratings || []);
    } catch (err) {
      setError("Failed to fetch ratings");
      console.error("Error fetching ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (!game) return null;

  return (
    <div className="game-detail">
      <div className="game-detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Games
        </button>
        <button className="edit-btn" onClick={() => onEdit(game)}>
          Edit Game
        </button>
      </div>

      <div className="game-detail-content">
        <div className="game-info">
          <div className="game-title-section">
            <h1>{game.title}</h1>
            <div className="game-rating-display">
              <span className="rating-score">
                ⭐{" "}
                {game.rating
                  ? game.rating.toFixed(1)
                  : calculateAverageRating()}
              </span>
              <span className="rating-count">
                ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          <div className="game-details-grid">
            <div className="detail-item">
              <strong>Genre:</strong>
              <span>{game.genre}</span>
            </div>

            <div className="detail-item">
              <strong>Platform:</strong>
              <span>{game.platform?.join(", ") || "Not specified"}</span>
            </div>

            <div className="detail-item">
              <strong>Developer:</strong>
              <span>{game.developer || "Unknown"}</span>
            </div>

            <div className="detail-item">
              <strong>Publisher:</strong>
              <span>{game.publisher || "Unknown"}</span>
            </div>

            {game.releaseDate && (
              <div className="detail-item">
                <strong>Release Date:</strong>
                <span>{new Date(game.releaseDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {game.description && (
            <div className="game-description-section">
              <h3>Description</h3>
              <p>{game.description}</p>
            </div>
          )}
        </div>

        <div className="ratings-section">
          <h3>User Reviews</h3>

          {loading ? (
            <div className="loading">Loading reviews...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : ratings.length === 0 ? (
            <div className="no-ratings">
              <p>No reviews yet. Be the first to review this game!</p>
            </div>
          ) : (
            <div className="ratings-list">
              {ratings.map((rating) => (
                <div key={rating._id} className="rating-card">
                  <div className="rating-header">
                    <div className="rating-score-badge">{rating.rating}/10</div>
                    <div className="rating-user">
                      {rating.user || "Anonymous"}
                    </div>
                  </div>

                  {rating.ratingText && (
                    <div className="rating-review">"{rating.ratingText}"</div>
                  )}

                  {rating.createdAt && (
                    <div className="rating-date">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
