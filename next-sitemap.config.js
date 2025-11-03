/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://optaskflow.vercel.app",
  generateRobotsTxt: true, // (optional) automatically creates robots.txt
  exclude: ["/api/*", "/webapp/*"],
};
