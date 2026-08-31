import {config} from './config.js';
import {isTargetUrl} from './utils/url.js';
import {Logger} from './utils/logger.js';
import {
  loadCookiesFromLocal,
  getCookieIdentifier,
  cookieSync,
} from './services/cookie-sync.js';

// 避免相同的 Cookie 組合在冷卻期間內重複同步
const syncedCookieIdentifiers = new Set<string>();

chrome.tabs.onUpdated.addListener(
  async (
    tabId: number,
    changeInfo: chrome.tabs.OnUpdatedInfo,
    tab: chrome.tabs.Tab,
  ) => {
    if (changeInfo.status !== 'complete') return;
    if (!tab.url || !isTargetUrl(tab.url)) return;

    Logger.info('偵測到目標分頁載入完成，開始檢查 Cookie');

    if (!(await loadCookiesFromLocal())) {
      Logger.error('無法載入 Cookie，略過本次同步');
      Logger.info('------------------------------------------------');
      return;
    }
    const cookieIdentifier = getCookieIdentifier();

    if (syncedCookieIdentifiers.has(cookieIdentifier)) {
      Logger.info('Cookie 已在冷卻期間內同步過，跳過同步');
      Logger.info('------------------------------------------------');
      return;
    }

    Logger.info('Cookie 尚未同步，開始同步 Cookie');
    if (await cookieSync()) {
      syncedCookieIdentifiers.add(cookieIdentifier);

      // 冷卻時間結束後，允許相同的 Cookie 組合再次同步
      setTimeout(() => {
        syncedCookieIdentifiers.delete(cookieIdentifier);
      }, config.cookieSyncCooldown);

      Logger.info('Cookie 同步成功，重新載入分頁');
      await chrome.tabs.reload(tabId);
    } else {
      Logger.info('沒有需要同步的 Cookie');
    }

    Logger.info('------------------------------------------------');
  },
);
