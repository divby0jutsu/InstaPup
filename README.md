# InstaPup
instagram liking bot (node.js + google puppeteer)
implemented features:
1. Logging to Instagram account using credentials in usercred.js
2. Saving cookies and loading them for next sessions
3. Opening #hashtag explore page using random hashtag from the list provided in config file
4. Browsing most recent #hashtag posts
5. Checking if post has already been liked
6. Checking if post contains #hashtag included in exception list
7. Liking post if 5 and 6 are false
8. Node cron job scheluding script
