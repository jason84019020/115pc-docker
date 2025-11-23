import axios from 'axios';
import {setTimeout} from 'timers/promises';
import {Logger} from './logger';

/**
 * 等待 Browser(chromium) Remote Debugging WebSocket URL 可用
 *
 * 嘗試向 `http://host:port/json/version` 發請求，直到拿到 webSocketDebuggerUrl 或超時。
 *
 * @param host 主機位址，例如 '127.0.0.1'
 * @param port Browser(chromium) Remote Debugging Port，例如 '9222'
 * @param timeout 最多等多久，預設 10 秒（毫秒）
 * @param retry 每隔多久再試一次，預設 200 毫秒
 * @returns WebSocket URL 字串
 */
export async function getWebSocketURL(
  host: string,
  port: string,
  timeout = 20000,
  retry = 200,
): Promise<string> {
  const start = Date.now();

  let count = 0;
  let webSocketURL: string | null = null;

  while (Date.now() - start < timeout) {
    count += 1;

    Logger.wait(`WebSocket URL Loading ${host}:${port} | Trying... ${count}`);

    try {
      const res = await axios.get(`http://${host}:${port}/json/version`, {
        timeout: 100,
      });
      if (res.data?.webSocketDebuggerUrl) {
        webSocketURL = res.data.webSocketDebuggerUrl;
        break;
      }
    } catch (err) {
      // ignore errors
    }

    await setTimeout(retry);
  }

  if (!webSocketURL) {
    throw new Error(`Timeout waiting for WebSocket URL at ${host}:${port}`);
  }

  return webSocketURL;
}
