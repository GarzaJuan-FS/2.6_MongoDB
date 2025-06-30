require("dotenv").config();
const mongoose = require("mongoose");
const Game = require("./app/models/Game");
const Rating = require("./app/models/Rating");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const sampleGames = [
  {
    title: "The Legend of Zelda: Breath of the Wild",
    genre: "Action-Adventure",
    platform: ["Nintendo Switch", "Wii U"],
    releaseDate: new Date("2017-03-03"),
    developer: "Nintendo EPD",
    publisher: "Nintendo",
    rating: 9.7,
    description:
      "An open-world action-adventure game set in the kingdom of Hyrule.",
  },
  {
    title: "God of War",
    genre: "Action",
    platform: ["PlayStation 4", "PC"],
    releaseDate: new Date("2018-04-20"),
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    rating: 9.5,
    description:
      "Kratos embarks on a new adventure with his son Atreus in Norse mythology.",
  },
  {
    title: "Cyberpunk 2077",
    genre: "RPG",
    platform: [
      "PC",
      "PlayStation 4",
      "Xbox One",
      "PlayStation 5",
      "Xbox Series X/S",
    ],
    releaseDate: new Date("2020-12-10"),
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    rating: 7.8,
    description: "An open-world cyberpunk RPG set in Night City.",
  },
];

async function seedDatabase() {
  try {
    // Clear existing data
    await Game.deleteMany({});
    await Rating.deleteMany({});

    console.log("Creating sample games...");
    const games = await Game.create(sampleGames);

    console.log("Creating sample ratings...");
    const sampleRatings = [
      {
        gameId: games[0]._id,
        rating: 10,
        ratingText: "Absolutely amazing! Best game I've ever played.",
      },
      {
        gameId: games[0]._id,
        rating: 9,
        ratingText: "Great open-world experience with beautiful graphics.",
      },
      {
        gameId: games[1]._id,
        rating: 9,
        ratingText: "Emotional story with excellent combat mechanics.",
      },
      {
        gameId: games[2]._id,
        rating: 8,
        ratingText: "Good game despite the initial bugs. Much better now!",
      },
      {
        gameId: games[2]._id,
        rating: 7,
        ratingText: "Interesting story but needed more polish at launch.",
      },
    ];

    await Rating.create(sampleRatings);

    console.log("Sample data created successfully!");
    console.log(
      `Created ${games.length} games and ${sampleRatings.length} ratings`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
