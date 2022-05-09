const TelegramApi = require("node-telegram-bot-api");
const app = require("./server-init");
const fs = require("fs").promises;
const { processBotQuestion, processBotAnswer, makeReport } = require("./process-bot-message");

async function createBot(botName, TOKEN) {
  // В этой функции все Обработчики событий должны быть повешены на бот (сообщения и.т.д.)
  // removeListener should be applied when deleteing bot

  const url = process.env.APP_URL || "https://47e1-185-177-124-220.ngrok.io";
  const bot = new TelegramApi(TOKEN);

  await bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "о боте" },
  ]);

  // All Possible Errors Have to be worked around (if file doesn't open or exist): !!!
  const botQuestions = await JSON.parse(
    await fs.readFile(`./bots/${botName}/${botName}_questions.json`)
  );
  const botOptions = await JSON.parse(
    await fs.readFile(`./bots/${botName}/${botName}_options.json`)
  );
  const botAnswers = await JSON.parse(
    await fs.readFile(`./bots/${botName}/${botName}_answers.json`)
  );

  bot.on("message", async (msg) => {
    console.log(msg);

    const usersInput = msg.text;
    const userId = msg.from.id;
    const userName = msg.from.username ? msg.from.username : "user name unknown";
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name ? msg.from.first_name : "Друг";
    const lastName = msg.from.last_name ? msg.from.last_name : "last name unknown";

    switch (usersInput) {
      case "/start":
        return await processBotQuestion(
          botName,
          bot,
          firstName,
          chatId,
          botQuestions[0],
          botOptions[0]
        );
      case "/info":
        return await bot.sendMessage(chatId, `${firstName}, я бот и моё имя ${botName}`);
      default:
        return await bot.sendMessage(chatId, `Не обрабатываемый ввод пользователя`);
    }
  });

  bot.on("callback_query", async (msg) => {
    console.log(msg);

    const [questionInd, optionsAnswerInd] = msg.data.split("-").map((el) => +el);
    const userId = msg.from.id;
    const userName = msg.from.username ? msg.from.username : "user name unknown";
    const chatId = msg.message.chat.id;
    const firstName = msg.from.first_name ? msg.from.first_name : "Друг";
    const lastName = msg.from.last_name ? msg.from.last_name : "last name unknown";

    /* if (botQuestions[questionInd].reported) */
    if (true) {
      const [{ text: usersAnswerText }] = (await botOptions[questionInd]?.inline_keyboard?.[
        optionsAnswerInd
      ]) ?? [{ text: "Options Object at this options answer index doesn't exist" }];
      const questionSum =
        (await botQuestions[questionInd]?.reportedQuestion) ??
        "Question Sum at this questions index doesn't exist";
      const realFirstName = msg.from.first_name ? msg.from.first_name : "first name unknown";

      // Возможно имя бота лучше заменить на зашифрованный Токен бота, для сохранения в MongoDB
      // Поинвестигировать этот вопрос...
      // !!!!!!!!!!!!!!! Добавить ли в bot_questions.json поле с индексом сохраняемого вопроса,
      // для быстрого поиска в массиве вопросов в базе данных:
      // {"reported": true,
      // "reportedQuestion": "Some question ?",
      // "reportedInd": 0}
      await makeReport(
        botName,
        userId,
        userName,
        realFirstName,
        lastName,
        usersAnswerText,
        questionSum
      );
    }

    if (
      await processBotAnswer(
        botName,
        bot,
        firstName,
        chatId,
        botAnswers[questionInd]?.[optionsAnswerInd]
      )
    ) {
      const nextQuestion = questionInd + 1;

      await processBotQuestion(
        botName,
        bot,
        firstName,
        chatId,
        botQuestions[nextQuestion],
        botOptions[nextQuestion]
      );
    }
  });

  // Try to change bot.setWebHook app.post by the order they called in code
  await bot.setWebHook(`${url}/bot${TOKEN}`);

  app.post(`/bot${TOKEN}`, async (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  return bot;
}

module.exports = createBot;
