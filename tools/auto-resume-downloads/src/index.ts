import * as dotenv from 'dotenv';
import {getWebSocketURL} from './utils/wait';
import {BrowserClient} from './browser/client';
import {BrowserWorkflows} from './browser/workflows';

dotenv.config({quiet: true});

void (async () => {
  const webSocketURL = await getWebSocketURL(
    process.env.BROWSER_DEBUG_HOST,
    process.env.BROWSER_DEBUG_PORT,
  );

  const client = new BrowserClient(webSocketURL);
  const browser = await client.connect();
  const browserWorkflows = new BrowserWorkflows(browser);
  await browserWorkflows.triggerResumeDownloads();
  await client.disconnect();
})();
