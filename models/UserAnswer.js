const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  botName: {
    type: String,
    required: true,
    immutable: true,
    minlength: 3,
    maxlength: 30,
  },
  userId: {
    type: Number,
    required: true,
    immutable: true,
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
  firstFinishedSurvey: {
    type: Date,
    immutable: true,
  },
  lastFinishedSurvey: {
    type: Date,
  },
  countFinishedSurvey: {
    type: Number,
    required: true,
    default: 0,
  },
  userData: {
    userName: String,
    firstName: String,
    lastName: String,
  },
  userAnswers: [
    {
      reportedInd: {
        type: Number,
        required: true,
        immutable: true,
      },
      questionSum: {
        type: String,
        required: true,
        immutable: true,
      },
      userAnswer: {
        type: String,
        required: true,
        // immutable: isQuiz
      },
    },
  ],
});

module.exports = mongoose.model("user_answer", schema);
