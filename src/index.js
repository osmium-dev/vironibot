require("dotenv").config();
const client = require("./twitterClient");
const dayjs = require("dayjs");
const fs = require("fs");
const { convert } = require("convert-svg-to-png");
const { EUploadMimeType } = require("twitter-api-v2");
const { getSymbolData } = require("./utils.js");
const CronJob = require("cron").CronJob;

const NASDAQ_TICKER = "^IXIC";
const SPX_TICKER = "^SPX";
const DOW_TICKER = "^DJI";
const FTSE_TICKER = "^FTSE";
const HANG_TICKER = "^HSI";

const GetData = async () => {
  console.log("Getting Data");
  const [NASDAQ_DATA, SPX_DATA, DOW_DATA, FTSE_DATA, HANG_DATA] = await getSymbolData(NASDAQ_TICKER, SPX_TICKER, DOW_TICKER, FTSE_TICKER, HANG_TICKER);

  const PriceFormator = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, signDisplay: 'exceptZero' });
  const PercentFormator = new Intl.NumberFormat('en-EN', { style: 'percent', maximumFractionDigits: 2,  signDisplay: 'exceptZero' });

  return {
    NASDAQ_PRICE: PriceFormator.format(NASDAQ_DATA.price),
    NASDAQ_CHANGE: `${PriceFormator.format(NASDAQ_DATA.change)} (${PercentFormator.format(NASDAQ_DATA.changePercent)})`,

    SPX_PRICE: PriceFormator.format(SPX_DATA.price),
    SPX_CHANGE: `${PriceFormator.format(SPX_DATA.change)} (${PercentFormator.format(SPX_DATA.changePercent)})`,

    DOW_PRICE: PriceFormator.format(DOW_DATA.price),
    DOW_CHANGE: `${PriceFormator.format(DOW_DATA.change)} (${PercentFormator.format(DOW_DATA.changePercent)})`,

    FTSE_PRICE: PriceFormator.format(FTSE_DATA.price),
    FTSE_CHANGE: `${PriceFormator.format(FTSE_DATA.change)} (${PercentFormator.format(FTSE_DATA.changePercent)})`,

    HANG_PRICE: PriceFormator.format(HANG_DATA.price),
    HANG_CHANGE: `${PriceFormator.format(HANG_DATA.change)} (${PercentFormator.format(HANG_DATA.changePercent)})`,

    DATE: dayjs().format("H:mm a, D MMM. YYYY"),
    DATA_TYPE: "Daily Change",
  };
};

const tweet = async () => {
  console.log("Starting a tweet");

  const PostBuffer = fs.readFileSync("./src/Post.svg");

  let PostString = PostBuffer.toString();

  const Data = await GetData();

  console.log("Applying Data to template");

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

  console.log("Converting Image to PNG")
  const image = await convert(Buffer.from(PostString));

  try {
    console.log("Uploading");
    const media = await client.v1.uploadMedia(image, {
      mimeType: EUploadMimeType.Png,
    });
    await client.v2.tweet("$HSI $SPX $QQQ $UKX $IXIC", {
      media: { media_ids: [media] },
    });
    console.log("Tweeted!");
  } catch (error) {
    console.log("We couldn't send the tweet:")
    console.log(error);
  }
};

const tweetHourly = async () => {
  await tweet();
};

const job = new CronJob("*/2 * * * *", tweetHourly);

job.start();
