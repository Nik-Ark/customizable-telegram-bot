const TelegramApi = require("node-telegram-bot-api");
const app = require("./server-init");
const fs = require("fs").promises;
const path = require("path");
const { processBotQuestion, processBotAnswer } = require("./process-bot-message");
const { saveUserAnswerDB, saveBotStatDB, saveFinishedSurveyDB } = require("./interactionsDB");

async function createBot(botName, TOKEN) {
  // В этой функции все Обработчики событий должны быть повешены на бот (сообщения и.т.д.)
  // отписка от событий будет происходить путем доступа к объекту bots по имени бота

  /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
  /****************************************************************************************/
  /*      НУЖНО ПОСЧИТАТЬ КОЛИЧЕСТВО ВОПРОСОВ В МАССИВЕ: botQuestions (bot-init.js)       */
  /****************************************************************************************/
  /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
  try {
    const botQuestions = await JSON.parse(
      await fs.readFile(path.join(__dirname, "bots", botName, `${botName}_questions.json`))
    );
    const botOptions = await JSON.parse(
      await fs.readFile(path.join(__dirname, "bots", botName, `${botName}_options.json`))
    );
    const botAnswers = await JSON.parse(
      await fs.readFile(path.join(__dirname, "bots", botName, `${botName}_answers.json`))
    );

    /*   NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK  */
    const url = process.env.APP_URL || "";
    /*   NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK     NGROK  */
    const bot = new TelegramApi(TOKEN);

    await bot.setMyCommands([
      { command: "/start", description: "Начальное приветствие" },
      { command: "/info", description: "о боте" },
    ]);

    bot.on("message", async (msg) => {
      console.log(msg);

      const usersInput = msg.text;
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userName = msg.from.username ? msg.from.username : "user name unknown";
      const firstName = msg.from.first_name ? msg.from.first_name : "Друг";
      const realFirstName = msg.from.first_name ? msg.from.first_name : "first name unknown";
      const lastName = msg.from.last_name ? msg.from.last_name : "last name unknown";

      switch (usersInput) {
        case "/start":
          return await processBotQuestion(
            botName,
            bot,
            chatId,
            botQuestions[0],
            botOptions[0],
            firstName,
            { userId, userName, realFirstName, lastName }
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
      const chatId = msg.message.chat.id;
      const userId = msg.from.id;
      const userName = msg.from.username ? msg.from.username : "user name unknown";
      const firstName = msg.from.first_name ? msg.from.first_name : "Друг";
      const realFirstName = msg.from.first_name ? msg.from.first_name : "first name unknown";
      const lastName = msg.from.last_name ? msg.from.last_name : "last name unknown";

      const isQuestionReported = await botQuestions[questionInd].reported;
      try {
        if (isQuestionReported) {
          const [{ text: userAnswer }] = await botOptions[questionInd].inline_keyboard[
            optionsAnswerInd
          ];

          const questionSum = await botQuestions[questionInd].reportedQuestion;
          const reportedInd = await botQuestions[questionInd].reportedInd;

          await saveUserAnswerDB(botName, userAnswer, questionSum, reportedInd, {
            userId,
            userName,
            realFirstName,
            lastName,
          });
        }

        const nextQuestionExist = await processBotAnswer(
          botName,
          bot,
          firstName,
          chatId,
          botAnswers[questionInd][optionsAnswerInd],
          { userId, userName, realFirstName, lastName }
        );

        if (nextQuestionExist) {
          await saveBotStatDB(botName, userId);

          const nextQuestion = questionInd + 1;
          await processBotQuestion(
            botName,
            bot,
            chatId,
            botQuestions[nextQuestion],
            botOptions[nextQuestion],
            firstName,
            { userId, userName, realFirstName, lastName }
          );
        } else {
          await saveFinishedSurveyDB(botName, userId);
        }
      } catch (error) {
        console.log("\nError Message from bot.on callback_query:");
        console.log(`Bot Name: ${botName}`);
        console.log(`Error message:\n${error.message}\n`);
        console.log(
          `User experienced error:\nid: ${userId}\nuserName: ${userName}\nfirstName: ${realFirstName}\nlastName: ${lastName}`
        );
        // ДАННЫЕ ВЫШЕ БУДУТ СОХРАНЕНЫ В БАЗУ: saveErrorLogDB()
      }
    });

    app.post(`/bot${TOKEN}`, async (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    await bot.setWebHook(`${url}/bot${TOKEN}`);

    return bot;
  } catch (error) {
    console.log("\nError Message from bot-init function: Bot is not initialized");
    console.log(`Bot Name: ${botName}`);
    console.log(`Error message:\n${error.message}\n`);
  }
}

module.exports = createBot;
