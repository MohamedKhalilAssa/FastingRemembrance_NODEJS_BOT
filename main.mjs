import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { checkFileForId } from "./Utils/helperFunctions.js";
import fs from "fs/promises";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  throw new Error(
    "Environment variable TELEGRAM_BOT_TOKEN is not set. Please configure it before running the bot."
  );
}

// Get the day for tomorrow
const getTomorrowDay = () => {
  const DaysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date();
  return DaysOfTheWeek[(date.getDay() + 1) % 7];
};
// the TASK VARIABLE
let Task;

// Create the bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const alreadySignedUp = await checkFileForId(chatId);
  if (alreadySignedUp) {
    return bot.sendMessage(
      chatId,
      "You're already signed up for the remembrance!"
    );
  }
  rememberFasting();
  bot.sendMessage(chatId, "You're signed up for the remembrance!");
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
    Task = cron.schedule("0 12 * * Sunday,Wednesday", () => {
      const tomorrow = getTomorrowDay();
      chatIds.forEach(({ chatID }) => {
        bot.sendMessage(chatID, `Tomorrow is ${tomorrow}, you should fast.`);
      });
    });

    Task.start();
    console.log("Fasting reminder scheduled.");
    return Task;
  } catch (err) {
    console.error("Error reading chat IDs:", err);
  }
};

// Initialize fasting reminders
rememberFasting();
