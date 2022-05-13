require("dotenv").config();
const createBot = require("./bot-init");
const fs = require("fs");
const path = require("path");

/*    Listening uncaught errors    */
process.on("uncaughtException", (error) => {
  console.error(`Произошла необрабатываемая ошибка на сервере: ${error.message}`);
  process.exit(1);
});

// Считывается синхронно так как программа стартует с полученного массива.
// В случае ошибки Сервер не стартует.
const botsArray = JSON.parse(fs.readFileSync(path.join(__dirname, "bots", "bots.json")));

const bots = {};

botsArray.forEach(async (item) => {
  const success = await createBot(item.botName, item.TOKEN);
  if (success) {
    bots[item.botName] = success;
  }
});

// setTimeout(() => {
//   console.dir(bots, {
//     depth: 10,
//   });
// }, 2000);
