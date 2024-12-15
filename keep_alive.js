const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is alive!");
});

// Function to start the server
const listen = () => {
  server.listen(8080, () => {
    console.log("Your app is listening on port 8080");
  });
};

module.exports = listen;
