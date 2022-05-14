require("dotenv").config();
const createBot = require("./bot-init");
const fs = require("fs").promises;
const path = require("path");

/*    Listening uncaught errors    */
process.on("uncaughtException", (error) => {
  console.log(`\nUnhandled Error occured on the Server\n: ${error.message}`);
  process.exit(1);
});

// В случае ошибки Сервер не стартует.
async function runServer() {
  try {
    const botsArray = await JSON.parse(
      await fs.readFile(path.join(__dirname, "bots", "bots.json"))
    );

    botsArray.forEach(async (item) => {
      const success = await createBot(item.botName, item.TOKEN);
      if (success) {
        bots[item.botName] = success;
      }
    });
  } catch (error) {
    console.log(`\nError in run Server:\n${error.message}`);
    process.exit(2);
  }
}

const bots = {};

runServer();

// setTimeout(() => {
//   console.dir(bots, {
//     depth: 10,
//   });
// }, 2000);
