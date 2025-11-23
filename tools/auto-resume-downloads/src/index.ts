import {getWebSocketURL} from './utils/wait';
import {LoggerHelper} from './utils/loggerHelper';
import {BrowserClient} from './browser/client';
import {BrowserWorkflows} from './browser/workflows';

const config = {
  name: 'Auto Resume Downloads',
  browserDebugHost: '127.0.0.1',
  browserDebugPort: 9222,
};

void (async () => {
  LoggerHelper.init(config.name);

  const webSocketURL = await getWebSocketURL(
    config.browserDebugHost,
    config.browserDebugPort,
  );

  const client = new BrowserClient(webSocketURL);
  const browser = await client.connect();
  const browserWorkflows = new BrowserWorkflows(browser);
  await browserWorkflows.triggerResumeDownloads();
  await client.disconnect();
})();
