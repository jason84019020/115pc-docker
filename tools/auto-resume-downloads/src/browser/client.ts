import puppeteer, {Browser} from 'puppeteer-core';

export class BrowserClient {
  private browser: Browser | null = null;

  constructor(private webSocketURL: string) {}

  async connect(): Promise<Browser> {
    if (this.browser) return this.browser;
    this.browser = await puppeteer.connect({
      browserWSEndpoint: this.webSocketURL,
      defaultViewport: null,
    });
    return this.browser;
  }

  async disconnect() {
    if (this.browser) {
      await this.browser.disconnect();
      this.browser = null;
    }
  }
}
