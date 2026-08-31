export const config = {
  targetUrlRegex: /^https?:\/\/(?:[^/]+\.)?115\.com(?::\d+)?(?:\/|$)/,
  cookieSyncCooldown: 10 * 60 * 1000,
  cookie: {
    domain: '115.com',
    url: 'http://115.com/',
    names: ['CID', 'SEID', 'UID', 'KID'],
    filePath: './cookie.json',
    expirationDate: Math.floor(Date.now() / 1000) + 3600 * 24 * 90,
  },
};
