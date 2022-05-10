const { sleep } = require("./helper");
const UserAnswer = require("./model/UserAnswer");
const BotStat = require("./model/BotStat");

async function processBotQuestion(botName, bot, firstName, chatId, botQuestion, botOptions) {
  if (!botQuestion) {
    console.log("\nError Message from processBotQuestion function:");
    console.log("Trying to reach unexistent botQuestion in botQuestions Array");
    console.log(`Bot Name:\n${botName}\n`);
    await bot.sendMessage(chatId, "Похоже возникла ошибка.");
    await sleep(2000);
    await bot.sendMessage(
      chatId,
      `${firstName}, пожалуйста сообщи об этом разработчику бота, если у тебя есть такая возможность.`
    );
    return false;
  }
  if (!botOptions) {
    console.log("\nError Message from processBotQuestion function:");
    console.log("Trying to reach unexistent botOptions in botOptions Array");
    console.log(`Bot Name:\n${botName}\n`);
    await bot.sendMessage(chatId, "Похоже возникла ошибка.");
    await sleep(2000);
    await bot.sendMessage(
      chatId,
      `${firstName}, пожалуйста сообщи об этом разработчику бота, если у тебя есть такая возможность.`
    );
    return false;
  }

  /* Creating options object: */
  const questionOptions = {
    reply_markup: JSON.stringify(botOptions),
  };

  /* For of executing async functions in order they are invoked: */
  for (const question of botQuestion.questions) {
    const messageText = question.firstNameInText
      ? question.text.replace(/firstName/g, firstName)
      : question.text;
    question.stickerStart ? await bot.sendSticker(chatId, question.stickerStart) : null;
    question.options
      ? await bot.sendMessage(chatId, messageText, questionOptions)
      : await bot.sendMessage(chatId, messageText);
    question.stickerEnd ? await bot.sendSticker(chatId, question.stickerEnd) : null;
    question.delay ? await sleep(question.delay) : null;
  }
}

async function processBotAnswer(botName, bot, firstName, chatId, botAnswer) {
  if (!botAnswer) {
    console.log("\nError Message from processBotAnswer function:");
    console.log("Trying to reach unexistent botAnswer in botAnswers Array");
    console.log(`Bot Name:\n${botName}\n`);
    await bot.sendMessage(chatId, "Похоже возникла ошибка.");
    await sleep(2000);
    await bot.sendMessage(
      chatId,
      `${firstName}, пожалуйста сообщи об этом разработчику бота, если у тебя есть такая возможность.`
    );
    return false;
  }

  for (const answer of botAnswer) {
    const messageText = answer.firstNameInText
      ? answer.text.replace(/firstName/g, firstName)
      : answer.text;
    answer.stickerStart ? await bot.sendSticker(chatId, answer.stickerStart) : null;
    await bot.sendMessage(chatId, messageText);
    answer.stickerEnd ? await bot.sendSticker(chatId, answer.stickerEnd) : null;
    answer.delay ? await sleep(answer.delay) : null;
  }

  return botAnswer[botAnswer.length - 1].continue;
}

async function makeReport(
  botName,
  userId,
  userName,
  firstName,
  lastName,
  userAnswer,
  questionSum,
  reportedInd
) {
  /*  Reading from and writing into MongoDB:  */
  try {
    const foundAnswer = await UserAnswer.findOne({ botName, userId }).exec();

    /*  Creating new user Answer object  */
    const userAnswerObj = { reportedInd, questionSum, userAnswer };

    if (!foundAnswer) {
      const userAnswers = [userAnswerObj];

      const result = await UserAnswer.create({
        botName,
        userId,
        userData: { userName, firstName, lastName },
        userAnswers,
      });

      console.log("result of creating:\n", result);
    } else {
      foundAnswer.userAnswers[reportedInd]
        ? (foundAnswer.userAnswers[reportedInd] = userAnswerObj)
        : foundAnswer.userAnswers.push(userAnswerObj);

      foundAnswer.lastInteractionWithBot = Date.now();

      const result = await foundAnswer.save();

      console.log("Result of updated userAnswer:\n", result);
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { processBotQuestion, processBotAnswer, makeReport };
