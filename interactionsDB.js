const UserAnswer = require("./models/UserAnswer");
const BotStat = require("./models/BotStat");

async function saveUserAnswerDB(botName, userAnswer, questionSum, reportedInd, userData) {
  /*                  Destructure User Data argument object:              */
  const { userId, userName, realFirstName: firstName, lastName } = await userData;

  try {
    let foundAnswer = await UserAnswer.findOne({ botName, userId }).exec();
    const userAnswerToSave = { reportedInd, questionSum, userAnswer };

    if (!foundAnswer) {
      const userAnswers = [userAnswerToSave];

      foundAnswer = await new UserAnswer({
        botName,
        userId,
        userData: { userName, firstName, lastName },
        userAnswers,
      });
    } else {
      const ind = (await foundAnswer.userAnswers.lenght) - 1;
      if (ind < reportedInd) {
        await foundAnswer.userAnswers.push(userAnswerToSave);
      } else {
        // ЕСЛИ ЭТО ВИКТОРИНА, ПЕРЕЗАПИСАТЬ ВОПРОС НЕЛЬЗЯ !!! (isQuiz variable = true || false)
        foundAnswer.userAnswers[reportedInd] = userAnswerToSave;
      }

      foundAnswer.lastInteractWithBot = Date.now();
      foundAnswer.userData = { userName, firstName, lastName };
    }
    const result = await foundAnswer.save();
    console.log(`UserAnswer saved in DB:\n${result}\n`);
  } catch (error) {
    console.log(`Error in saveUserAnswerDB function:\n${error.message}\n`);
  }
}

async function saveBotStatDB(botName, userId) {
  try {
    const foundBotStat = await BotStat.findOne({ botName }).exec();

    // INDEXOF METHOD RETURNS -1 WHEN ELEMENT NOT FOUND IN THE ARRAY OR INDEX WHERE IY IS FIRSTLY FOUND
    const isUserIdInBotStarted = (await foundBotStat.idsOfUsersStarted.indexOf(userId)) + 1;
    if (!isUserIdInBotStarted) {
      await foundBotStat.idsOfUsersStarted.push(userId);
    }
    foundBotStat.usersStartedSurvey = await foundBotStat.idsOfUsersStarted.length;
    foundBotStat.lastInteractWithBot = Date.now();

    const result = await foundBotStat.save();
    console.log(`BotStat saved in DB:\n${result}\n`);
  } catch (error) {
    console.log(`Error in saveBotStatDB function:\n${error.message}\n`);
  }
}

async function saveBlankBotStatDB(botName) {
  try {
    let foundBotStat = await BotStat.findOne({ botName }).exec();

    if (foundBotStat) {
      console.log(`BotStat for bot ${botName} already exist and won't be creted again\n`);
      return;
    } else {
      foundBotStat = await new BotStat({ botName });
    }
    const result = await foundBotStat.save();
    console.log(`Started blank BotStat initialized for bot ${botName}:\n${result}\n`);
  } catch (error) {
    console.log(`Error in saveBlankBotStatDB function:\n${error.message}\n`);
  }
}

async function saveFinishedSurveyDB(botName, userData) {
  /*                  Destructure User Data argument object:              */
  const { userId, userName, realFirstName: firstName, lastName } = await userData;

  try {
    const foundBotStat = await BotStat.findOne({ botName }).exec();

    const isUserIdInBotStarted = (await foundBotStat.idsOfUsersStarted.indexOf(userId)) + 1;
    if (!isUserIdInBotStarted) {
      await foundBotStat.idsOfUsersStarted.push(userId);
    }
    foundBotStat.usersStartedSurvey = await foundBotStat.idsOfUsersStarted.length;

    const isUserIdInBotFinished = (await foundBotStat.idsOfUsersFinished.indexOf(userId)) + 1;
    if (!isUserIdInBotFinished) {
      await foundBotStat.idsOfUsersFinished.push(userId);
    }
    foundBotStat.usersFinishedSurvey = await foundBotStat.idsOfUsersFinished.length;

    foundBotStat.lastInteractWithBot = Date.now();
    const result = await foundBotStat.save();
    console.log(`BotStat of Finished Survey saved in DB:\n${result}\n`);

    let foundAnswer = await UserAnswer.findOne({ botName, userId }).exec();

    if (!foundAnswer) {
      const userAnswers = [];

      foundAnswer = await new UserAnswer({
        botName,
        userId,
        firstFinishedSurvey: Date.now(),
        lastFinishedSurvey: Date.now(),
        userFinishedSurvey: true,
        userData: { userName, firstName, lastName },
        userAnswers,
      });
    } else {
      foundAnswer.lastInteractWithBot = Date.now();
      foundAnswer.firstFinishedSurvey = (await foundAnswer.firstFinishedSurvey) ?? Date.now();
      foundAnswer.lastFinishedSurvey = Date.now();
      foundAnswer.userFinishedSurvey = true;
      foundAnswer.userData = { userName, firstName, lastName };
    }

    const result2 = await foundAnswer.save();
    console.log(`UserAnswer of Finished Survey saved in DB:\n${result2}\n`);
  } catch (error) {
    console.log(`Error in Accessing saveFinishedSurveyDB function:\n${error.message}\n`);
  }
}

module.exports = { saveUserAnswerDB, saveBotStatDB, saveBlankBotStatDB, saveFinishedSurveyDB };
