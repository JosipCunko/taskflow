/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://taskflow-delta-two.vercel.app",
  generateRobotsTxt: true, // (optional) automatically creates robots.txt
  exclude: ["/api/*", "/webapp/*"],
};
