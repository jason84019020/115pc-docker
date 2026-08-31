import {config} from './config';
import {getWebSocketURL} from './utils/wait';
import {Logger} from './utils/logger';
import {BrowserClient} from './browser/client';
import {BrowserWorkflows} from './browser/workflows';

void (async () => {
  try {
    const webSocketURL = await getWebSocketURL(
      config.browserDebug.host,
      config.browserDebug.port,
    );

    const client = new BrowserClient(webSocketURL);
    const browser = await client.connect();
    const browserWorkflows = new BrowserWorkflows(browser);
    await browserWorkflows.triggerResumeDownloads();
    await client.disconnect();
  } catch (err) {
    Logger.error('執行發生錯誤', err);
  }
})();
