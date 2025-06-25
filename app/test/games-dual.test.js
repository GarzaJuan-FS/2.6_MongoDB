// Dual-mode test setup - works with both mocked and real database
const request = require("supertest");
const mongoose = require("mongoose");

const USE_MOCKS = process.env.USE_MOCKS === "true";

let app, Game;

if (USE_MOCKS) {
  // Mock setup (your current approach)
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/test";

  jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "mocked-id"),
  }));

  jest.mock("../db/config", () => {
    const mockConnectDB = jest.fn(() => Promise.resolve());
    return {
      connectDB: mockConnectDB,
      __esModule: true,
      default: mockConnectDB,
    };
  });

  const createMockQuery = (finalResult = []) => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(finalResult),
    exec: jest.fn().mockResolvedValue(finalResult),
  });

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

  app = require("../app");
  Game = require("../models/Game");
} else {
  // Real database setup
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/test_games_real";
  app = require("../app");
  Game = require("../models/Game");
}

describe("Games API - Dual Mode Tests", () => {
  // Test data
  const testGames = [
    {
      title: "Test Game 1",
      genre: "Action",
      rating: 9.5,
      platform: ["PC"],
      developer: "Test Studio",
    },
    {
      title: "Test Game 2",
      genre: "RPG",
      rating: 8.0,
      platform: ["Console"],
      developer: "Another Studio",
    },
    {
      title: "Test Game 3",
      genre: "Action",
      rating: 7.5,
      platform: ["Mobile"],
      developer: "Mobile Studio",
    },
  ];

  beforeAll(async () => {
    if (!USE_MOCKS) {
      // Wait for database connection in real mode
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  beforeEach(async () => {
    if (USE_MOCKS) {
      // Setup mocks
      jest.clearAllMocks();
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(testGames),
        exec: jest.fn().mockResolvedValue(testGames),
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

  describe("GET /api/games - Basic Functionality", () => {
    it("should return games", async () => {
      const response = await request(app).get("/api/games").expect(200);

      expect(response.body.games).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it("should filter games by genre", async () => {
      if (USE_MOCKS) {
        const filteredGames = testGames.filter(
          (game) => game.genre === "Action"
        );
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(filteredGames),
        };
        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(filteredGames.length);
      }

      const response = await request(app)
        .get("/api/games?genre=Action")
        .expect(200);

      expect(response.body.games.length).toBeGreaterThan(0);

      if (USE_MOCKS) {
        expect(Game.find).toHaveBeenCalledWith({
          genre: { $regex: "Action", $options: "i" },
        });
      } else {
        response.body.games.forEach((game) => {
          expect(game.genre.toLowerCase()).toContain("action");
        });
      }
    });

    it("should sort games by rating descending", async () => {
      if (USE_MOCKS) {
        const sortedGames = [...testGames].sort((a, b) => b.rating - a.rating);
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(sortedGames),
        };
        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(testGames.length);
      }

      const response = await request(app)
        .get("/api/games?sort=-rating")
        .expect(200);

      const ratings = response.body.games.map((game) => game.rating);

      if (USE_MOCKS) {
        expect(mockQuery.sort).toHaveBeenCalledWith({ rating: -1 });
      } else {
        // Verify actual sorting worked
        for (let i = 1; i < ratings.length; i++) {
          expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
        }
      }
    });

    it("should filter by minimum rating", async () => {
      const minRating = 8;

      if (USE_MOCKS) {
        const filteredGames = testGames.filter(
          (game) => game.rating >= minRating
        );
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(filteredGames),
        };
        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(filteredGames.length);
      }

      const response = await request(app)
        .get(`/api/games?minRating=${minRating}`)
        .expect(200);

      if (USE_MOCKS) {
        expect(Game.find).toHaveBeenCalledWith({ rating: { $gte: minRating } });
      } else {
        // Verify actual filtering worked
        response.body.games.forEach((game) => {
          expect(game.rating).toBeGreaterThanOrEqual(minRating);
        });
      }
    });
  });
});
