require("dotenv").config();
const createBot = require("./bot-init");
const fs = require("fs");

// Обработать возможные ошибки с чтением файлов json во всём проекте.
const botsArray = JSON.parse(fs.readFileSync(`./bots/bots.json`));

const bots = {};

botsArray.forEach(async (item) => {
  bots[item.botName] = await createBot(item.botName, item.TOKEN);
});

/*
console.dir(bots, {
  depth: 10,
});

setTimeout(() => {
  console.dir(bots, {
    depth: 10,
  });
}, 2000);
*/
