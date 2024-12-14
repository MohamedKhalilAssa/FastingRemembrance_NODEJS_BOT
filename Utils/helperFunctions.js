const fs = require("fs/promises");

const checkFileForId = async (chatID) => {
  let data = await loadOrCreateFile(chatID);

  if (!data.some((id) => id.chatID == chatID)) {
    console.log("Chat ID not Found, logging Into File");
    data.push({ chatID: chatID });
    if (WriteIntoChatID(data)) return true;
  }
  console.log("Chat ID Found");
  return true;
};
const loadOrCreateFile = async (chatID) => {
  try {
    const file = await fs.readFile("./chatIds.json");
    return JSON.parse(file);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("File not found, initializing a new file.");
      let Initialdata = [{ chatID: chatID }];
      if (await WriteIntoChatID(Initialdata)) {
        // Attempt to create the new file
        return Initialdata;
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

module.exports = { checkFileForId, loadOrCreateFile, WriteIntoChatID };
