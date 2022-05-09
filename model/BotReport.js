const mongoose = require("mongoose");

const botReportSchema = new mongoose.Schema({
  botName: {
    type: String,
    required: true,
    immutable: true,
    minlength: 3,
    maxlength: 21,
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
  usersIds: {
    type: [Number],
  },
});

module.exports = mongoose.model("BotReport", botReportSchema);
