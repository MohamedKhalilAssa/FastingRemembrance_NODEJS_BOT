const fs = require("fs/promises");

const checkFileForIdOrCreate = async (chatID) => {
  let { data, isFileNewlyCreated } = await loadOrCreateFile(chatID);

  if (!data.some((id) => id.chatID == chatID)) {
    console.log("Chat ID not Found, logging Into File");
    data.push({ chatID: +chatID });
    await WriteIntoChatID(data);
    return false;
  }
  if (isFileNewlyCreated) {
    return false;
  }
  console.log("Chat ID Found");
  return true;
};
const loadOrCreateFile = async (chatID) => {
  try {
    const file = await fs.readFile("./chatIds.json");
    return { data: JSON.parse(file) || [], isFileNewlyCreated: false };
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("File not found, initializing a new file.");
      let Initialdata = [{ chatID: +chatID }];
      if (await WriteIntoChatID(Initialdata)) {
        return { data: Initialdata, isFileNewlyCreated: true };
      }
    } else {
      throw err;
    }
  }
};
const WriteIntoChatID = async (data) => {
  try {
    await fs.writeFile("./chatIds.json", JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
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
  const DateInCasa = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Casablanca",
  });
  return DaysOfTheWeek[(new Date(DateInCasa).getDay() + 1) % 7];
};
module.exports = {
  checkFileForIdOrCreate,
  loadOrCreateFile,
  WriteIntoChatID,
  getTomorrowDay,
};
