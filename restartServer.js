import { exec } from "child_process";

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function main() {
  let { stdout } = await sh(
    `aws elasticbeanstalk restart-app-server --environment-name "HerstasisBackend-env-api-v1-1a" --region "us-east-1"`
  );
  for (let line of stdout.split("\n")) {
    console.log(`ls: ${line}`);
  }
}

export default main;
