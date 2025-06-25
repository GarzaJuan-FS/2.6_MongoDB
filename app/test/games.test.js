// Simplified dual-mode test - works with both mocked and real database
const request = require("supertest");
const mongoose = require("mongoose");

// Determine mode from environment variable
const USE_MOCKS = process.env.USE_MOCKS !== "false"; // Default to mocks

// Setup based on mode
if (USE_MOCKS) {
  // Mock mode setup
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/test";

  jest.mock("nanoid", () => ({ nanoid: jest.fn(() => "mocked-id") }));
  jest.mock("../db/config", () => ({
    connectDB: jest.fn(() => Promise.resolve()),
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
  }));

  jest.mock("../models/Game", () => ({
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  }));
} else {
  // Real database mode
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/test_games";
}

const app = require("../app");
const Game = require("../models/Game");

describe(`Games API - ${USE_MOCKS ? "Mocked" : "Real"} Database`, () => {
  const testGames = [
    {
      title: "Action Game",
      genre: "Action",
      rating: 9.5,
      platform: ["PC"],
      developer: "Studio A",
    },
    {
      title: "RPG Game",
      genre: "RPG",
      rating: 8.0,
      platform: ["Console"],
      developer: "Studio B",
    },
    {
      title: "Indie Game",
      genre: "Action",
      rating: 7.5,
      platform: ["Mobile"],
      developer: "Studio C",
    },
  ];

  beforeAll(async () => {
    if (!USE_MOCKS) {
      // Wait for real database connection
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  beforeEach(async () => {
    if (USE_MOCKS) {
      // Setup mocks for each test
      jest.clearAllMocks();

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(testGames),
      };

      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(testGames.length);
    } else {
      // Clean and seed real database
      await Game.deleteMany({});
      await Game.create(testGames);
    }
  });

  afterAll(async () => {
    if (!USE_MOCKS) {
      await Game.deleteMany({});
      await mongoose.connection.close();
    }
  });

  // Helper function to setup mocks for specific tests
  const setupMockQuery = (result) => {
    if (USE_MOCKS) {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
      };
      Game.find.mockReturnValue(mockQuery);
      Game.countDocuments.mockResolvedValue(result.length);
      return mockQuery;
    }
    return null;
  };

  it("should get all games", async () => {
    setupMockQuery(testGames);

    const response = await request(app).get("/api/games").expect(200);

    expect(response.body.games).toHaveLength(3);
    expect(response.body.pagination).toBeDefined();
  });

  it("should filter games by genre", async () => {
    const actionGames = testGames.filter((g) => g.genre === "Action");
    const mockQuery = setupMockQuery(actionGames);

    const response = await request(app)
      .get("/api/games?genre=Action")
      .expect(200);

    if (USE_MOCKS) {
      expect(Game.find).toHaveBeenCalledWith({
        genre: { $regex: "Action", $options: "i" },
      });
      expect(response.body.games).toEqual(actionGames);
    } else {
      expect(response.body.games.length).toBeGreaterThan(0);
      response.body.games.forEach((game) => {
        expect(game.genre.toLowerCase()).toContain("action");
      });
    }
  });

  it("should sort games by rating descending", async () => {
    const sortedGames = [...testGames].sort((a, b) => b.rating - a.rating);
    const mockQuery = setupMockQuery(sortedGames);

    const response = await request(app)
      .get("/api/games?sort=-rating")
      .expect(200);

    if (USE_MOCKS) {
      expect(mockQuery.sort).toHaveBeenCalledWith({ rating: -1 });
    } else {
      const ratings = response.body.games.map((g) => g.rating);
      for (let i = 1; i < ratings.length; i++) {
        expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
      }
    }
  });

  it("should filter by minimum rating", async () => {
    const highRatedGames = testGames.filter((g) => g.rating >= 8);
    const mockQuery = setupMockQuery(highRatedGames);

    const response = await request(app)
      .get("/api/games?minRating=8")
      .expect(200);

    if (USE_MOCKS) {
      expect(Game.find).toHaveBeenCalledWith({ rating: { $gte: 8 } });
    } else {
      response.body.games.forEach((game) => {
        expect(game.rating).toBeGreaterThanOrEqual(8);
      });
    }
  });

  it("should select specific fields", async () => {
    const selectedFields = testGames.map((g) => ({
      _id: g._id,
      title: g.title,
      rating: g.rating,
    }));
    const mockQuery = setupMockQuery(selectedFields);

    const response = await request(app)
      .get("/api/games?select=title,rating")
      .expect(200);

    if (USE_MOCKS) {
      expect(mockQuery.select).toHaveBeenCalledWith("title rating");
    } else {
      response.body.games.forEach((game) => {
        expect(game.title).toBeDefined();
        expect(game.rating).toBeDefined();
        expect(game.developer).toBeUndefined(); // Should be excluded
      });
    }
  });
});
