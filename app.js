import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
const PORT = 5051;
import loginAttempt from "./mailsender.js";

setInterval(loginAttempt, 120000);
app.get("/", (request, response) => {
  response.send("<h1>Script</h1>");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
