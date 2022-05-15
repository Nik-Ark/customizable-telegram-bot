require("dotenv").config();
const createBot = require("./bot-init");
const fs = require("fs").promises;
const path = require("path");

/*    Listening uncaught errors    */
process.on("uncaughtException", (error) => {
  console.log(`\nUnhandled Error occured on the Server\n: ${error.message}`);
  process.exit(1);
});

async function runServer() {
  try {
    // IN CASE OF ERROR IN READING FILE SERVER DOESN'T START (process.exit(2)).
    const botsArray = await JSON.parse(
      await fs.readFile(path.join(__dirname, "bots", "bots.json"))
    );

    // IN CASE OF ERROR IN CREATE BOT FUNCTION ONLY THIS PARTICULAR BOT WON'T BE CREATED.
    // CREATED BOTS WILL BE PRESENT IN BOTS OBJECT.
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

// setTimeout(() => console.log(Object.keys(bots)), 2000);
