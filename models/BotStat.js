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
  firstActivationOfBot: {
    type: Date,
    immutable: true,
    required: true,
    default: Date.now,
  },
  lastActivationOfBot: {
    type: Date,
    required: true,
    default: Date.now,
  },
  // !!! СОЗДАТЬ МАССИВ ID'S ТЕХ КТО ПРОХОДИЛИ ОПРОС БОТА ВООБЩЕ И ТЕХ КТО ЗАВЕРШИЛ ПРОЦЕСС ПОЛНОСТЬЮ
  idsOfUsers: {
    type: [Number],
  },
});

module.exports = mongoose.model("bot_stat", schema);
