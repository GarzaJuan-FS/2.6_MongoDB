import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Game API functions
export const gameAPI = {
  // Get all games
  getAllGames: async () => {
    const response = await api.get("/games");
    return response.data;
  },

  // Get a single game by ID
  getGameById: async (id) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Create a new game
  createGame: async (gameData) => {
    const response = await api.post("/games", gameData);
    return response.data;
  },

  // Update a game
  updateGame: async (id, gameData) => {
    const response = await api.put(`/games/${id}`, gameData);
    return response.data;
  },

  // Delete a game
  deleteGame: async (id) => {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },
};

// Rating API functions
export const ratingAPI = {
  // Get all ratings
  getAllRatings: async () => {
    const response = await api.get("/ratings");
    return response.data;
  },

  // Get ratings for a specific game
  getRatingsByGame: async (gameId) => {
    const response = await api.get(`/ratings/game/${gameId}`);
    return response.data;
  },

  // Create a new rating
  createRating: async (ratingData) => {
    const response = await api.post("/ratings", ratingData);
    return response.data;
  },

  // Update a rating
  updateRating: async (id, ratingData) => {
    const response = await api.put(`/ratings/${id}`, ratingData);
    return response.data;
  },

  // Delete a rating
  deleteRating: async (id) => {
    const response = await api.delete(`/ratings/${id}`);
    return response.data;
  },
};

export default api;
