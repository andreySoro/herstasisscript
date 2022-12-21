import nodemailer from "nodemailer";
import { execSync } from "child_process";
import axios from "axios";
import main from "./restartServer.js";

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

async function sendEmail(login, timeStamp) {
  if (login?.response?.status !== 200) {
    const restart = await serverRestart();
    const error = login?.response?.status || "unknown error";
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
  }
}

export default async function loginAttempt() {
  const timeStamp = new Date().toLocaleString();
  const login = await axios
    .post(process.env.MAILER_SCRIPT_LOGIN_URL, {
      email: process.env.EMAIL,
      password: process.env.HERSTASIS_LOGIN_PASSWORD,
    })
    .catch((err) => sendEmail(err, timeStamp));
  //   main();
  console.log("LOGIN =", login?.status, "Time:", timeStamp);
}
