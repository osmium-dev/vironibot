require("dotenv").config();
const client = require("./twitterClient");
const dayjs = require('dayjs')
const fs = require("fs");
const { convert } = require('convert-svg-to-png');
const { EUploadMimeType } = require('twitter-api-v2');
const CronJob = require("cron").CronJob;

const Data = {
  NASDAQ_PRICE: "10,321",
  NASDAQ_CHANGE: "-5,511 (-34%)",

  SPX_PRICE: "3,583",
  SPX_CHANGE: "-1,213 (-25%)",

  DOW_PRICE: "29,634",
  DOW_CHANGE: "-6,950 (-19%)",

  FTSE_PRICE: "6,858",
  FTSE_CHANGE: "-646 (-8%)",

  HANG_PRICE: "16,587",
  HANG_CHANGE: "-6,687 (-28%)",

  DATE: dayjs().format("H:mm a, D MMM. YYYY"),
  DATA_TYPE: "YTD",
};

const tweet = async () => {
  const PostBuffer = fs.readFileSync("Post.svg");

  let PostString = PostBuffer.toString();

  PostString = PostString.replace("{{DATE}}", Data.DATE);
  PostString = PostString.replace("{{DATA_TYPE}}", Data.DATA_TYPE);

  PostString = PostString.replace("{{NASDAQ_PRICE}}", Data.NASDAQ_PRICE);
  PostString = PostString.replace("{{NASDAQ_CHANGE}}", Data.NASDAQ_CHANGE);

  PostString = PostString.replace("{{SPX_PRICE}}", Data.SPX_PRICE);
  PostString = PostString.replace("{{SPX_CHANGE}}", Data.SPX_CHANGE);


  PostString = PostString.replace("{{DOW_PRICE}}", Data.DOW_PRICE);
  PostString = PostString.replace("{{DOW_CHANGE}}", Data.DOW_CHANGE);


  PostString = PostString.replace("{{FTSE_PRICE}}", Data.FTSE_PRICE);
  PostString = PostString.replace("{{FTSE_CHANGE}}", Data.FTSE_CHANGE);

  PostString = PostString.replace("{{HANG_PRICE}}", Data.HANG_PRICE);
  PostString = PostString.replace("{{HANG_CHANGE}}", Data.HANG_CHANGE);

  console.log(PostString);

  const image = await convert(Buffer.from(PostString));

  try {
    const media = await client.v1.uploadMedia(image, { mimeType: EUploadMimeType.Png });
    const newTweet = await client.v2.tweet('$HSI $SPX $QQQ $UKX $IXIC', { media: {media_ids: [media]} });
    console.log(newTweet);
  } catch (error) {
    console.log(error);
  }
};

const everyMinute = async () => {
  await tweet();
  console.log("I have tweeted!");
};

tweet();

// const job = new CronJob("* * * * *", everyMinute);

// job.start();
