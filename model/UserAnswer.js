const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    immutable: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  userData: {
    userName: String,
    firstName: String,
    lastName: String,
  },
  userAnswers: [
    {
      question: {
        type: String,
        required: true,
        immutable: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("UserAnswer", userAnswerSchema);
