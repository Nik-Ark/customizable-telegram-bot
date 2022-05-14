const { sleep } = require("./helper");

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
        ? await question.text.replace(/firstName/g, firstName)
        : await question.text;
      question.stickerStart ? await bot.sendSticker(chatId, question.stickerStart) : null;
      question.options
        ? await bot.sendMessage(chatId, messageText, questionOptions)
        : await bot.sendMessage(chatId, messageText);
      question.stickerEnd ? await bot.sendSticker(chatId, question.stickerEnd) : null;
      question.delay ? await sleep(question.delay) : null;
    }
  } catch (error) {
    const { userId, userName, realFirstName, lastName } = await userData;
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
      const messageText = (await answer.firstNameInText)
        ? await answer.text.replace(/firstName/g, firstName)
        : await answer.text;
      answer.stickerStart ? await bot.sendSticker(chatId, answer.stickerStart) : null;
      await bot.sendMessage(chatId, messageText);
      answer.stickerEnd ? await bot.sendSticker(chatId, answer.stickerEnd) : null;
      answer.delay ? await sleep(answer.delay) : null;
    }

    return await botAnswer[botAnswer.length - 1].continue;
  } catch (error) {
    const { userId, userName, realFirstName, lastName } = await userData;
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

module.exports = { processBotQuestion, processBotAnswer };
