const mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
  points: {
    type: String,
  },
  badges: {
    type: Array,
  },
  streaks: {
    type: Array,
  },
  avatars: {
    type: Array,
  },
  rewards: {
    type: Array,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});
module.exports = mongoose.model("Leaderboard", leaderBoardSchema);
