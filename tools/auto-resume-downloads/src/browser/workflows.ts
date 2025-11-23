import {Browser} from 'puppeteer-core';
import {LoggerHelper} from '../utils/loggerHelper';

const DOWNLOAD_INTERFACE_URL = 'chrome://transfer-frame/';

export class BrowserWorkflows {
  constructor(private browser: Browser) {}

  async triggerResumeDownloads() {
    LoggerHelper.info('開啟新分頁');
    const page = await this.browser.newPage();
    LoggerHelper.info('引導至任務管理器');
    await page.goto(DOWNLOAD_INTERFACE_URL, {waitUntil: 'networkidle0'});

    try {
      LoggerHelper.info('任務管理器(恢復下載功能) - 等待加載');

      // 檢查 downloadInterface.StartAllDownloads 是否已被註冊
      await page.waitForFunction(
        () => {
          return typeof downloadInterface.StartAllDownloads === 'function';
        },
        {timeout: 500},
      );

      LoggerHelper.success('任務管理器(恢復下載功能) - 加載完成');
    } catch (error) {
      LoggerHelper.error('任務管理器(恢復下載功能) - 加載失敗', error);

      // 強制結束
      await page.close();
      return;
    }

    try {
      LoggerHelper.info('任務管理器(下載列表) - 等待渲染');

      // 檢查下載列表是否有資料
      await page.waitForSelector('#download #js-download_list li', {
        timeout: 3000,
      });

      LoggerHelper.info('任務管理器(下載列表) - 渲染成功');
    } catch (error) {
      LoggerHelper.info(
        '任務管理器(下載列表) - 渲染失敗，仍會嘗試觸發恢復下載',
      );
    }

    try {
      LoggerHelper.info('恢復下載 - 等待觸發');

      await page.evaluate(() => {
        return downloadInterface.StartAllDownloads('-1');
      });

      LoggerHelper.success('恢復下載 - 觸發成功');
    } catch (error) {
      LoggerHelper.error('恢復下載 - 觸發失敗', error);
    }

    await page.close();
  }
}
