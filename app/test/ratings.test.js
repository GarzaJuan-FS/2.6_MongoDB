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

// Mock the Rating model with proper methods
jest.mock("../models/Rating", () => ({
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
const Rating = require("../models/Rating");

describe("Ratings API", () => {
  // Mock data
  const mockRatings = [
    {
      _id: "rating1",
      gameId: "game1",
      ratingText: "Great game!",
      rating: 9,
    },
    {
      _id: "rating2",
      gameId: "game2",
      ratingText: "Good but could be better",
      rating: 7,
    },
    {
      _id: "rating3",
      gameId: "game1",
      ratingText: null,
      rating: 8,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/ratings - Select Fields", () => {
    it("should return limited data based on select query", async () => {
      const expectedResult = mockRatings.map((rating) => ({
        _id: rating._id,
        rating: rating.rating,
        ratingText: rating.ratingText,
      }));

      const mockQuery = createMockQuery(expectedResult);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(mockRatings.length);

      const response = await request(app).get(
        "/api/ratings?select=rating,ratingText"
      );

      expect(response.status).toBe(200);
      expect(Rating.find).toHaveBeenCalledWith({});
      expect(mockQuery.select).toHaveBeenCalledWith("rating ratingText");
      expect(response.body.ratings).toEqual(expectedResult);
    });

    it("should exclude specified fields when exclude query is used", async () => {
      const expectedResult = mockRatings.map((rating) => ({
        _id: rating._id,
        rating: rating.rating,
        ratingText: rating.ratingText,
      }));

      const mockQuery = createMockQuery(expectedResult);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(mockRatings.length);

      const response = await request(app).get("/api/ratings?exclude=gameId");

      expect(response.status).toBe(200);
      expect(mockQuery.select).toHaveBeenCalledWith("-gameId");
      expect(response.body.ratings).toEqual(expectedResult);
    });
  });

  describe("GET /api/ratings - Sorting", () => {
    it("should sort ratings by rating in descending order", async () => {
      const sortedRatings = [...mockRatings].sort(
        (a, b) => b.rating - a.rating
      );

      const mockQuery = createMockQuery(sortedRatings);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(mockRatings.length);

      const response = await request(app).get("/api/ratings?sort=-rating");

      expect(response.status).toBe(200);
      expect(mockQuery.sort).toHaveBeenCalledWith({ rating: -1 });
      expect(response.body.ratings).toEqual(sortedRatings);
    });

    it("should sort ratings by rating in ascending order", async () => {
      const sortedRatings = [...mockRatings].sort(
        (a, b) => a.rating - b.rating
      );

      const mockQuery = createMockQuery(sortedRatings);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(mockRatings.length);

      const response = await request(app).get("/api/ratings?sort=rating");

      expect(response.status).toBe(200);
      expect(mockQuery.sort).toHaveBeenCalledWith({ rating: 1 });
      expect(response.body.ratings).toEqual(sortedRatings);
    });
  });

  describe("GET /api/ratings - Query Operators", () => {
    it("should filter ratings by minimum rating", async () => {
      const filteredRatings = mockRatings.filter(
        (rating) => rating.rating >= 8
      );

      const mockQuery = createMockQuery(filteredRatings);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(filteredRatings.length);

      const response = await request(app).get("/api/ratings?minRating=8");

      expect(response.status).toBe(200);
      expect(Rating.find).toHaveBeenCalledWith({ rating: { $gte: 8 } });
      expect(response.body.ratings).toEqual(filteredRatings);
    });

    it("should filter ratings that have text", async () => {
      const filteredRatings = mockRatings.filter(
        (rating) => rating.ratingText && rating.ratingText.trim() !== ""
      );

      const mockQuery = createMockQuery(filteredRatings);
      Rating.find.mockReturnValue(mockQuery);
      Rating.countDocuments.mockResolvedValue(filteredRatings.length);

      const response = await request(app).get("/api/ratings?hasText=true");

      expect(response.status).toBe(200);
      expect(Rating.find).toHaveBeenCalledWith({
        ratingText: { $exists: true, $ne: null, $ne: "" },
      });
      expect(response.body.ratings).toEqual(filteredRatings);
    });
  });
});
