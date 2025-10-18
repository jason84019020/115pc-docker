const puppeteer = require("puppeteer-core");
const http = require("http");
const net = require("net");

const browserDebugHost = "127.0.0.1";
const browserDebugPort = 9222;
const targetURL = "chrome://transfer-frame/";
const maxWaitTime = 30 * 1000;
const retryInterval = 500;

async function waitPort(host, port, timeout) {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeout) {
    attempt++;
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });
        socket.once("connect", () => {
          socket.end();
          resolve();
        });
        socket.once("error", reject);
      });
      console.log(`[✓] 第 ${attempt} 次嘗試: 連線成功`);
      return;
    } catch (err) {
      console.log(`[*] 第 ${attempt} 次嘗試: 連線失敗 (${err.message})`);
      await new Promise((r) => setTimeout(r, retryInterval));
    }
  }

  throw new Error(`[x] 等待端口 ${host}:${port} 超時`);
}

// 等待 WebSocket URL
async function waitWebSocketURL(timeout) {
  const start = Date.now();
  const url = `http://${browserDebugHost}:${browserDebugPort}/json/version`;
  let attempt = 0;

  while (Date.now() - start < timeout) {
    attempt++;
    try {
      const wsURL = await new Promise((resolve, reject) => {
        http
          .get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.webSocketDebuggerUrl)
                  resolve(parsed.webSocketDebuggerUrl);
                else reject("webSocketDebuggerUrl not found");
              } catch (err) {
                reject(err);
              }
            });
          })
          .on("error", reject);
      });
      console.log(`[✓] 第 ${attempt} 次嘗試: WebSocket URL 已取得`);
      return wsURL;
    } catch (err) {
      console.log(`[*] 第 ${attempt} 次嘗試: WebSocket 尚未就緒 (${err})`);
      await new Promise((r) => setTimeout(r, retryInterval));
    }
  }

  throw new Error("[x] 等待 WebSocket URL 超時");
}

(async () => {
  console.log("[*] 嘗試連接 Chrome remote debugging...");

  let browser, page;

  try {
    await waitPort(browserDebugHost, browserDebugPort, maxWaitTime);
    console.log(`[✓] 端口 ${browserDebugPort} 已啟動`);

    const wsURL = await waitWebSocketURL(maxWaitTime);
    console.log("[✓] WebSocket URL:", wsURL);

    browser = await puppeteer.connect({
      browserWSEndpoint: wsURL,
      defaultViewport: null,
    });
    page = await browser.newPage();

    console.log("[*] 開始導航到:", targetURL);
    await page.goto(targetURL, { waitUntil: "load" });

    console.log("[*] 等待列表渲染...");
    try {
      await page.waitForSelector(
        "div.download-list#js-download-box > ul > li",
        {
          timeout: 10000,
        }
      );
      console.log("[*] 列表已渲染完成");
    } catch (err) {
      console.error("[x] 列表渲染異常:", err);
      console.log("[*] 列表未渲染，略過等待");
    }

    console.log("[*] 等待下載按鈕渲染...");
    try {
      await page.waitForSelector("#js-start_all_download", {
        visible: true,
        timeout: 10000,
      });
      console.log("[*] 下載按鈕已渲染完成");
    } catch (err) {
      console.error("[x] 下載按鈕渲染異常:", err);
      console.log("[*] 下載按鈕未渲染，略過等待");
    }

    await page.click("#js-start_all_download");
    console.log("[✓] 下載按鈕已觸發！");
  } catch (err) {
    console.error("[x] 操作失敗:", err);
  } finally {
    if (page) await page.close();
    if (browser) await browser.disconnect();
    process.exit(0);
  }
})();
