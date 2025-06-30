import { useState, useEffect } from "react";
import { gameAPI } from "../services/api";
import "./GameForm.css";

const GameForm = ({ game, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    platform: "",
    releaseDate: "",
    developer: "",
    publisher: "",
    rating: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || "",
        genre: game.genre || "",
        platform: game.platform?.join(", ") || "",
        releaseDate: game.releaseDate
          ? new Date(game.releaseDate).toISOString().split("T")[0]
          : "",
        developer: game.developer || "",
        publisher: game.publisher || "",
        rating: game.rating || "",
        description: game.description || "",
      });
    }
  }, [game]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const gameData = {
        ...formData,
        platform: formData.platform
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        releaseDate: formData.releaseDate
          ? new Date(formData.releaseDate)
          : undefined,
      };

      if (game) {
        await gameAPI.updateGame(game._id, gameData);
      } else {
        await gameAPI.createGame(gameData);
      }

      onSave();
    } catch (err) {
      setError(game ? "Failed to update game" : "Failed to create game");
      console.error("Error saving game:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-form-overlay">
      <div className="game-form-container">
        <div className="game-form-header">
          <h2>{game ? "Edit Game" : "Add New Game"}</h2>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="game-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Genre *</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating (0-10)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platforms (comma separated)</label>
            <input
              type="text"
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              placeholder="e.g. PC, PlayStation 5, Xbox"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="developer">Developer</label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="publisher">Publisher</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="releaseDate">Release Date</label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving..." : game ? "Update Game" : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameForm;
