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
    default: 1,
  },
  usersFinishedSurvey: {
    type: Number,
    required: true,
    default: 0,
  },
  firstInteractWithBot: {
    type: Date,
    immutable: true,
    required: true,
    default: Date.now,
  },
  lastInteractWithBot: {
    type: Date,
    required: true,
    default: Date.now,
  },
  idsOfUsersStarted: {
    type: [Number],
  },
  idsOfUsersFinished: {
    type: [Number],
  },
});

module.exports = mongoose.model("bot_stat", schema);
