const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  botName: {
    type: String,
    required: true,
    immutable: true,
    minlength: 3,
    maxlength: 30,
  },
  usersStartedSurvey: {
    type: Number,
    required: true,
    default: 0,
  },
  usersFinishedSurvey: {
    type: Number,
    required: true,
    default: 0,
  },
  botInitialized: {
    type: Date,
    immutable: true,
    required: true,
    default: Date.now,
  },
  lastInteractWithBot: {
    type: Date,
  },
  idsOfUsersStarted: {
    type: [Number],
    required: true,
    default: [],
  },
  idsOfUsersFinished: {
    type: [Number],
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("bot_stat", schema);
