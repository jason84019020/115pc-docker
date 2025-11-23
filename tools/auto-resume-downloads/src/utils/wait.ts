import axios from 'axios';
import {setTimeout} from 'timers/promises';
import * as cliProgress from 'cli-progress';
import {LoggerHelper} from '../utils/loggerHelper';

/**
 * 等待 Browser(chromium) Remote Debugging WebSocket URL 可用
 *
 * 嘗試向 `http://host:port/json/version` 發請求，直到拿到 webSocketDebuggerUrl 或超時。
 *
 * @param host 主機位址，例如 '127.0.0.1'
 * @param port Browser(chromium) Remote Debugging Port，例如 9222
 * @param timeout 最多等多久，預設 10 秒（毫秒）
 * @param retry 每隔多久再試一次，預設 200 毫秒
 * @returns WebSocket URL 字串
 */
export async function getWebSocketURL(
  host: string,
  port: number,
  timeout = 20000,
  retry = 200,
): Promise<string> {
  const start = Date.now();
  const totalAttempts = Math.ceil(timeout / retry);

  const bar = new cliProgress.SingleBar({
    format: LoggerHelper.getPrefixMsg(
      '⏳ Wait WebSocket URL Loading {host}:{port} |{bar}| Trying... {value}',
    ),
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
  });

  bar.start(totalAttempts, 0, {host, port});

  let webSocketURL: string | null = null;

  while (Date.now() - start < timeout) {
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
    } finally {
      bar.increment();
    }

    await setTimeout(retry);
  }

  bar.stop();

  if (!webSocketURL) {
    throw new Error(`Timeout waiting for WebSocket URL at ${host}:${port}`);
  }

  return webSocketURL;
}
