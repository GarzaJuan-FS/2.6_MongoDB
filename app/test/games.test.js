// Mock environment variables
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";

// Mock nanoid first
jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "mocked-id"),
}));

// Mock database connection with both export styles
jest.mock("../db/config", () => {
  const mockConnectDB = jest.fn(() => {
    return Promise.resolve();
  });

  return {
    connectDB: mockConnectDB,
    __esModule: true,
    default: mockConnectDB,
  };
});

// Create a shared mock query object
const createMockQuery = (finalResult = []) => ({
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(finalResult),
  exec: jest.fn().mockResolvedValue(finalResult),
});

// Mock the Game model with proper methods
jest.mock("../models/Game", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  deleteOne: jest.fn(),
}));

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Game = require("../models/Game");

// Rest of your test code remains the same...
describe("Games API", () => {
  // Mock data
  const mockGames = [
    {
      _id: "game1",
      title: "Test Game 1",
      genre: "Action",
      rating: 9.5,
      platform: ["PC"],
      developer: "Test Studio",
    },
    {
      _id: "game2",
      title: "Test Game 2",
      genre: "RPG",
      rating: 8.0,
      platform: ["Console"],
      developer: "Another Studio",
    },
    {
      _id: "game3",
      title: "Test Game 3",
      genre: "Action",
      rating: 7.5,
      platform: ["Mobile"],
      developer: "Mobile Studio",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/games - Select Fields", () => {
    it("should return limited data based on select query", async () => {
      const expectedResult = mockGames.map((game) => ({
        _id: game._id,
        title: game.title,
        rating: game.rating,
      }));

      const mockQuery = createMockQuery(expectedResult);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(mockGames.length);

      const response = await request(app).get("/api/games?select=title,rating");

      expect(response.status).toBe(200);
      expect(Game.find).toHaveBeenCalledWith({});
      expect(mockQuery.select).toHaveBeenCalledWith("title rating");
      expect(response.body.games).toEqual(expectedResult);
    });

    it("should exclude specified fields when exclude query is used", async () => {
      const expectedResult = mockGames.map((game) => ({
        _id: game._id,
        title: game.title,
        genre: game.genre,
        rating: game.rating,
      }));

      const mockQuery = createMockQuery(expectedResult);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(mockGames.length);

      const response = await request(app).get(
        "/api/games?exclude=developer,platform"
      );

      expect(response.status).toBe(200);
      expect(mockQuery.select).toHaveBeenCalledWith("-developer -platform");
      expect(response.body.games).toEqual(expectedResult);
    });
  });

  describe("GET /api/games - Sorting", () => {
    it("should sort games by rating in descending order", async () => {
      const sortedGames = [...mockGames].sort((a, b) => b.rating - a.rating);

      const mockQuery = createMockQuery(sortedGames);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(mockGames.length);

      const response = await request(app).get("/api/games?sort=-rating");

      expect(response.status).toBe(200);
      expect(mockQuery.sort).toHaveBeenCalledWith({ rating: -1 });
      expect(response.body.games).toEqual(sortedGames);
    });

    it("should sort games by title in ascending order", async () => {
      const sortedGames = [...mockGames].sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      const mockQuery = createMockQuery(sortedGames);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(mockGames.length);

      const response = await request(app).get("/api/games?sort=title");

      expect(response.status).toBe(200);
      expect(mockQuery.sort).toHaveBeenCalledWith({ title: 1 });
      expect(response.body.games).toEqual(sortedGames);
    });
  });

  describe("GET /api/games - Query Operators", () => {
    it("should filter games by genre", async () => {
      const filteredGames = mockGames.filter((game) => game.genre === "Action");

      const mockQuery = createMockQuery(filteredGames);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(filteredGames.length);

      const response = await request(app).get("/api/games?genre=Action");

      expect(response.status).toBe(200);
      expect(Game.find).toHaveBeenCalledWith({
        genre: { $regex: "Action", $options: "i" },
      });
      expect(response.body.games).toEqual(filteredGames);
    });

    it("should filter games by minimum rating", async () => {
      const filteredGames = mockGames.filter((game) => game.rating >= 8);

      const mockQuery = createMockQuery(filteredGames);
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(filteredGames.length);

      const response = await request(app).get("/api/games?minRating=8");

      expect(response.status).toBe(200);
      expect(Game.find).toHaveBeenCalledWith({ rating: { $gte: 8 } });
      expect(response.body.games).toEqual(filteredGames);
    });
  });
});
