const puppeteer = require("puppeteer");
const usercred = require("./usercred");
const config = require("./config");
const jsonfile = require("jsonfile");
const cookiesFilePath = "./usercookies.json";
var fs = require("fs-extra");
const cronJob = require("./node_modules/cron/lib/cron").CronJob;

async function initBrowser() {
  this.browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1920,1440"],
  });
  this.page = await browser.newPage();
  await this.page.setViewport({ height: 800, width: 1280 });
}

async function userCookies() {
  let cookiesArr = "";
  fs.ensureFile(cookiesFilePath)
    .then(() => {
      console.log("success!");
    })
    .catch((err) => {
      console.error(err);
    });

  fs.readFile("./usercookies.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }

    cookiesArr = jsonString;
    console.log("File data:", jsonString);
  });

  // const cookiesArr = require(cookiesFilePath);
  if (cookiesArr) {
    for (let cookie of cookiesArr) {
      await this.page.setCookie(cookie);
    }
    console.log("Session has been loaded in the browser");
    //return true
  } else {
    await page.goto("https://instagram.com/accounts/login");
    //waiting for the login form to load
    await page.waitFor("input");
    //typing in user credentials from usercred.js
    await page.type("[name=username]", usercred.username);
    await page.type("[name=password]", usercred.password);
    //clicking log in button
    await page.click('button[type="submit"]');
    //waiting to be navigated to main page
    await page.waitForNavigation();
    //searching a button with "Not Now" text using XPath
    const notnow = await page.$x("//button[text()='Not Now']");
    //Clicking Not Now button if found
    if (notnow.length > 0) {
      await notnow[0].click();
    } else {
      throw new error("Button not found");
    }
    let cookies = await page.cookies();
    jsonfile.writeFile(
      "./usercookies.json",
      cookies,
      { spaces: 2 },
      function (err) {
        if (err) {
          console.log("The file could not be written.", err);
        }
        console.log("Session has been successfully saved");
      }
    );
  }
}

//function that implements exceptions to the posts that will be liked
//function takes an array of strings(hashtags) from config file and checks if any of this hashtags appear in the post
async function testAvoidtags() {
  for (let i = 0; i < config.avoid_hashtags.length; i++) {
    const avoid = await page.$x(
      "//a[contains(text(),'" + config.avoid_hashtags[i] + "')]/@href"
    );
    if (avoid.length > 0) {
      console.log(config.avoid_hashtags[i]);
      return false;
    }
  }
  console.log("clear to like");
  return true;
}

async function exploreAndLike() {
  //navigating to the *random hashtag* explore page
  await this.page.goto(
    "https://www.instagram.com/explore/tags/" +
      config.hastags[
        Math.floor(Math.random() * Math.floor(config.hastags.length))
      ] +
      "/"
  );
  //waiting for main content to load
  await this.page.waitForSelector("article");
  //searching for the first post in the Most Recent section
  const firstPost = await this.page.$("h2:nth-child(2)+div div:nth-child(2)");
  // opening first post
  await firstPost.click();
  // counter for number of likes
  let n = 0;

  // for loop in which we check if opened post has already been liked and if it has exceptions
  // if it's already liked or it has tags that are added as an exception to the config file script navigates to the next post
  // if not script likes the post and then navigates to the next post
  for (let i = 0; i < 100; i++) {
    await this.page.waitForTimeout(2500 + Math.floor(Math.random() * 5000));
    console.log(i);
    //const heart = await page.$('span[aria-label="Like"]');
    const heart = await this.page.$('svg[aria-label="Like"][width="24"]');

    const next = await this.page.$(".coreSpriteRightPaginationArrow");
    if (heart && (await testAvoidtags())) {
      await this.page.click('svg[aria-label="Like"][width="24"]');
      n++;
      const userLiked = await this.page.evaluate(
        () => document.querySelector("header a").innerText
      );
      console.log(userLiked + " like");
      await this.page.waitForTimeout(2500 + Math.floor(Math.random() * 5000));
      await next.click();
    } else {
      console.log("next");
      await next.click();
    }
  }

  console.log(n + " likes");
}

async function instaPup() {
  //initializing browser
  await initBrowser();
  //loading cookies from previous session or navigating to Instagram page, logging in and saving cookies
  await userCookies();
  //Saving the time the script started
  let startTime = new Date();
  console.log(startTime.toLocaleString());
  //exploring and liking posts with hashtags randomly chosen from config file
  await exploreAndLike();
  let endTime = new Date();
  console.log("Start time: " + startTime.toLocaleString());
  console.log("End time: " + endTime.toLocaleString());
  console.log(
    "Script ran for " + Math.floor((endTime - startTime) / 1000) + " s."
  );

  await this.page.waitForTimeout(4000);
  await browser.close();
}

instaPup();

/* console.log(new Date(Date.now()).toLocaleString());

console.log('Before job instantiation');
const job = new cronJob('0 00 '+ config.start_time + '-' + config.end_time + '/'+config.time_step + ' * * *', function() {
	const d = new Date();
  console.log('Every 2 hours between 7-23 LA time:', d);
  instaPup();
});
//}, null, true, 'America/Los_Angeles');
console.log('After job instantiation');
job.start();

console.log('System TZ next 5: ', job.nextDates(5));
//job.stop();
console.log('is job running? ', job.running); */
