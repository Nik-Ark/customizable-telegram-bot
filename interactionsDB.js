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
    console.log(`Error in Accessing DB (saveUserAnswerDB):\n${error.message}\n`);
  }
}

async function saveBotStatDB(botName, userId) {
  try {
    const foundBotStat = await BotStat.findOne({ botName }).exec();

    // INDEXOF METHOD RETURNS -1 WHEN ELEMENT NOT FOUND IN THE ARRAY OR INDEX WHERE IY IS FIRSTLY FOUND
    const isUserIdInBotStat = (await foundBotStat.idsOfUsersStarted.indexOf(userId)) + 1;
    if (isUserIdInBotStat) {
      foundBotStat.lastInteractWithBot = Date.now();
    } else {
      await foundBotStat.idsOfUsersStarted.push(userId);
      foundBotStat.usersStartedSurvey++;
      foundBotStat.lastInteractWithBot = Date.now();
    }

    const result = await foundBotStat.save();
    console.log(`BotStat saved in DB:\n${result}\n`);
  } catch (error) {
    console.log(`Error in Accessing DB (saveBotStatDB):\n${error.message}\n`);
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
    console.log(`Error in Accessing DB (saveBlankBotStatDB):\n${error.message}\n`);
  }
}

async function saveFinishedSurveyDB(botName, userId) {
  try {
    let foundBotStat = await BotStat.findOne({ botName }).exec();

    if (!foundBotStat) {
      return;
    } else {
      const isUserIdInBotStat = await foundBotStat.idsOfUsersStarted.indexOf(userId);
      if (isUserIdInBotStat === -1) {
        /* WHEN USER ID IS NOT IN THE ARRAY THAT MEANS HE HAS NEVER YET STARTED SURVEY */
        return;
      } else {
        /*USER FINISHED SURVEY BEFORE OR FINISHES IT FIRST TIME OR BY MISTAKE ENTER THE CHAT AND QUIT*/
        foundBotStat.lastInteractWithBot = Date.now();
        const didUserFinishBefore = await foundBotStat.idsOfUsersFinished.indexOf(userId);

        if (didUserFinishBefore === -1) {
          /* USER FINISHES SURVEY FIRST TIME */
          foundBotStat.idsOfUsersFinished.push(userId);
        } else {
          /* WHEN USER FINISHED SURVEY BEFORE */
        }
      }

      const result = await foundBotStat.save();
      console.log(`BotStat of Finished Survey saved in DB:\n${result}\n`);
    }
  } catch (error) {
    console.log(`Error in Accessing DB (saveFinishedSurveyDB):\n${error.message}\n`);
  }
}

module.exports = { saveUserAnswerDB, saveBotStatDB, saveBlankBotStatDB, saveFinishedSurveyDB };
