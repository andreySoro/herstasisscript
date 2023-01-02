import nodemailer from "nodemailer";
import { execSync } from "child_process";
import axios from "axios";
// import main from "./restartServer.js";

const transporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.SMTP_GMAIL_APP_PASSWORD,
    },
  });
const mailOptions = () => {
  return {
    from: process.env.EMAIL,
    to: process.env.EMAIL_TO,
    subject: "HERSTASIS MAILER",
    text: "Email content goes here",
  };
};

async function serverRestart() {
  execSync(
    `aws elasticbeanstalk restart-app-server --environment-name "Herstasisproductionapi-env-1" --region "ca-central-1"`,
    { encoding: "utf-8" }
  );
  return Promise.resolve("Server(s) was restarted");
}

async function sendEmail(err, timeStamp) {
  if (err?.response?.status !== 200) {
    const restart = await serverRestart();
    const error = err?.response?.status || "unknown error";
    transporter().sendMail(
      {
        ...mailOptions(),
        text: `Herstasis login error ${error}\n${restart}\n Time: ${timeStamp}`,
      },
      (err, data) => {
        if (err) {
          console.log("Error occurs", err, "Time: ", timeStamp);
        } else {
          console.log("Email sent!!!", data.response, "Time: ", timeStamp);
        }
      }
    );
    return;
  }
}

export default async function loginAttempt() {
  const timeStamp = new Date().toLocaleString();

  const login = await axios
    .post(
      process.env.MAILER_SCRIPT_LOGIN_URL,
      {
        email: process.env.EMAIL,
        password: process.env.HERSTASIS_LOGIN_PASSWORD,
      },
      { timeout: 15000 }
    )
    .catch(async (err) => {
      sendEmail(err, timeStamp);
    });

  console.log("LOGIN =", login?.status, "Time:", timeStamp);

  if (login?.data?.AuthenticationResult?.AccessToken) {
    const token = login?.data?.AuthenticationResult?.AccessToken;
    const getUserResult = await axios
      .get(process.env.MAILER_SCRIPT_GET_USERS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(async (err) => {
        sendEmail(err, timeStamp);
      });

    console.log("GET USER =", getUserResult?.status, "Time:", timeStamp);
  }
  //   main();
  //login?.data?.AuthenticationResult = {AccessToken, ExpiresIn, IdToken, RefreshToken, TokenType}
}
