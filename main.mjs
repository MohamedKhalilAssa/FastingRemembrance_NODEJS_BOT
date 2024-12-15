import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import {
  checkFileForIdOrCreate,
  WriteIntoChatID,
  getTomorrowDay
} from "./Utils/helperFunctions.js";
import fs from "fs/promises";
import listen from "./keep_alive.js"

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  throw new Error(
    "Environment variable TELEGRAM_BOT_TOKEN is not set. Please configure it before running the bot."
  );
}
// the TASK VARIABLE
let Task;

// Create the bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const alreadySignedUp = await checkFileForIdOrCreate(chatId);
  if (alreadySignedUp) {
    return bot.sendMessage(
      chatId,
      "You're already signed up for the remembrance!"
    );
  }
  rememberFasting();
  bot.sendMessage(chatId, "You're signed up for the remembrance!");
});
// Handle the /stop command
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = await fs.readFile("./chatIds.json", "utf8");
    let chatIds = JSON.parse(data);

    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      console.error("No valid chat IDs found");
      return;
    }
    chatIds = chatIds.filter((cell) => cell.chatID != chatId);
    if (await WriteIntoChatID(chatIds)) console.log(`${chatId} IS GONE`);
    rememberFasting();
    return bot.sendMessage(
      chatId,
      "Sad To see you go, Remember to still fast either way!!"
    );
  } catch (err) {
    if (err.code == "ENOENT") {
      console.log("NO REGISTERED USERS");
    } else {
      console.error("Error reading chat IDs:", err);
    }
  }
});

// Send fasting reminders
const rememberFasting = async () => {
  if (Task) {
    Task.stop();
    Task = null;
  }
  try {
    const data = await fs.readFile("./chatIds.json", "utf8");
    const chatIds = JSON.parse(data);
    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      console.error("No valid chat IDs found. Task not scheduled.");
      return;
    }
    Task = cron.schedule("* 12 * * 0,3", () => {
      const tomorrow = getTomorrowDay();
      chatIds.forEach(async ({ chatID }) => {
        try {
          await bot.sendMessage(chatID, `Tomorrow is ${tomorrow}, you should fast.`);
        } catch (err) {
          console.error(err)
        }
      });
    }, {
      timezone: "Africa/Casablanca"
    }
    );
    Task.start();
    console.log("Fasting reminder scheduled.");
    return Task;
  } catch (err) {
    if (err.code == "ENOENT") {
      console.log("NO REGISTERED USERS")
    } else {
      console.error("Error reading chat IDs:", err);
    }
  }
};

// Initialize fasting reminders
rememberFasting();

// function for server public url
listen();