// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";

// Mock the database connection
jest.mock("../db/config", () => ({
  connectDB: jest.fn(() => {
    console.log("Mocked database connection");
    return Promise.resolve();
  }),
}));

// Mock nanoid to avoid ES module issues
jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "mocked-id"),
}));
