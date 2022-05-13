const { sleep } = require("./helper");
const UserAnswer = require("./models/UserAnswer");
const BotStat = require("./models/BotStat");

async function processBotQuestion(
  botName,
  bot,
  chatId,
  botQuestion,
  botOptions,
  firstName,
  userData
) {
  try {
    /* Creating options object: */
    const questionOptions = {
      reply_markup: JSON.stringify(botOptions),
    };

    /* For of executing async functions in order they are invoked: */
    for (const question of botQuestion.questions) {
      const messageText = (await question.firstNameInText)
        ? question.text.replace(/firstName/g, firstName)
        : question.text;
      question.stickerStart ? await bot.sendSticker(chatId, question.stickerStart) : null;
      question.options
        ? await bot.sendMessage(chatId, messageText, questionOptions)
        : await bot.sendMessage(chatId, messageText);
      question.stickerEnd ? await bot.sendSticker(chatId, question.stickerEnd) : null;
      question.delay ? await sleep(question.delay) : null;
    }
  } catch (error) {
    const { userId, userName, realFirstName, lastName } = userData;
    console.log("\nError Message from processBotQuestion function:");
    console.log(`Bot Name: ${botName}`);
    console.log(`Error message:\n${error.message}\n`);
    console.log(
      `User experienced error:\nid: ${userId}\nuserName: ${userName}\nfirstName: ${realFirstName}\nlastName: ${lastName}`
    );
    // ДАННЫЕ ВЫШЕ БУДУТ СОХРАНЕНЫ В БАЗУ: saveErrorLogDB()

    await bot.sendMessage(chatId, "Похоже возникла ошибка.");
    await sleep(2000);
    await bot.sendMessage(
      chatId,
      `${firstName}, пожалуйста сообщи об этом разработчику бота, если у тебя есть такая возможность.`
    );
  }
}

async function processBotAnswer(botName, bot, firstName, chatId, botAnswer, userData) {
  try {
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
  } catch (error) {
    const { userId, userName, realFirstName, lastName } = userData;
    console.log("\nError Message from processBotAnswer function:");
    console.log(`Bot Name: ${botName}`);
    console.log(`Error message:\n${error.message}\n`);
    console.log(
      `User experienced error:\nid: ${userId}\nuserName: ${userName}\nfirstName: ${realFirstName}\nlastName: ${lastName}`
    );
    // ДАННЫЕ ВЫШЕ БУДУТ СОХРАНЕНЫ В БАЗУ: saveErrorLogDB()

    await bot.sendMessage(chatId, "Похоже возникла ошибка.");
    await sleep(2000);
    await bot.sendMessage(
      chatId,
      `${firstName}, пожалуйста сообщи об этом разработчику бота, если у тебя есть такая возможность.`
    );
  }
}

// ВЫНЕСТИ В ФАЙЛ ДЛЯ ФУНКЦИЙ РАБОТАЮЩИХ С БД
async function saveUserAnswerDB(botName, userAnswer, questionSum, reportedInd, userData) {
  const { userId, userName, realFirstName: firstName, lastName } = userData;

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
    // Error in Accessing DB
    console.log(err.message);
  }
}

module.exports = { processBotQuestion, processBotAnswer, saveUserAnswerDB };
