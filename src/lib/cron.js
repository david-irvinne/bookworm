import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfuly");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.log("error while sending request", e));
});

export default job;

/*
cron job are scheduled tasks that run periodically at fixed intervals
we want to send 1 get request every 14 minutes

how to define a schedule:
define a schedule using a cron expression, which consists of five fields representing:

// ! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

examples
* 14 * * * * -> every 14 minutes
* 0 0 * * 0 -> at midnight on every sunday
* 30 3 15 * * -> at 3:30 AM on the 15th of every month
* 0 * * * * -> every hour
*/