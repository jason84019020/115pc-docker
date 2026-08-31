import {config} from '../config.js';
import {Logger} from '../utils/logger.js';

// 目前載入的 Local Cookie
let cookiesFromLocal: Cookies = {};
// Local Cookie 快取的到期時間
let cookiesFromLocalExpiresAt = 0;
// Local Cookie 快取時間
const COOKIES_FROM_LOCAL_CACHE_TTL = 5 * 1000;

function isCookieValueValid(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== '';
}

/**
 * 從 Local Cookie 設定檔載入 Cookie。
 *
 * 說明:
 *   Cookie 載入後會進行快取，在快取有效期間內再次呼叫時，不會重新讀取設定檔，而是直接使用目前已載入的 Cookie
 */
export async function loadCookiesFromLocal(): Promise<boolean> {
  // 快取尚未過期，不需要重新載入 Cookie
  if (Date.now() < cookiesFromLocalExpiresAt) {
    return true;
  }

  try {
    const response = await fetch(chrome.runtime.getURL(config.cookie.filePath));

    if (!response.ok) {
      throw new Error(
        `Failed to fetch cookies: ${response.status} ${response.statusText}`,
      );
    }

    // 將最新的 Local Cookie 寫入模組層級快取，讓後續的 Cookie Identifier 與同步流程共用同一份資料
    cookiesFromLocal = await response.json();
    // 設定快取到期時間，5 秒內不重新讀取設定檔
    cookiesFromLocalExpiresAt = Date.now() + COOKIES_FROM_LOCAL_CACHE_TTL;

    return true;
  } catch (err) {
    Logger.error('讀取 Cookie 設定檔失敗:', err);

    // 讀取失敗時清空目前的 Cookie，避免繼續使用舊資料
    cookiesFromLocal = {};

    return false;
  }
}

/**
 * 取得目前已載入的 Local Cookie
 */
function getCookiesFromLocal(): Cookies {
  return cookiesFromLocal;
}

/**
 * 根據目前的 Local Cookie 產生唯一識別值
 */
export function getCookieIdentifier(): string {
  // 只使用需要同步的 Cookie，並固定順序產生唯一識別值
  const cookiesFromLocal = getCookiesFromLocal();
  return Object.entries(cookiesFromLocal)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

/**
 * Cookie 同步
 *
 * 說明:
 *   將 Local Cookie 與瀏覽器目前的 Cookie 進行比對，並將不同的 Cookie 同步至瀏覽器
 */
export async function cookieSync(): Promise<boolean> {
  const cookiesFromLocal = getCookiesFromLocal();
  const cookiesFromBrowser: Cookies = {};

  const browserCookies = await chrome.cookies.getAll({
    url: config.cookie.url,
    domain: config.cookie.domain,
  });
  browserCookies.forEach(cookie => {
    cookiesFromBrowser[cookie.name] = cookie.value;
  });

  let synced = false;
  for (const cookieName of config.cookie.names) {
    const cookieValueFromLocal = cookiesFromLocal[cookieName];
    const cookieValueFromBrowser = cookiesFromBrowser[cookieName];

    // Local Cookie 無效或瀏覽器中的 Cookie 已經是相同值時，不需要進行同步
    const shouldSkipCookie =
      !isCookieValueValid(cookieValueFromLocal) ||
      cookieValueFromLocal === cookieValueFromBrowser;

    if (shouldSkipCookie) {
      continue;
    }

    try {
      await chrome.cookies.set({
        name: cookieName,
        value: cookieValueFromLocal,
        url: config.cookie.url,
        domain: config.cookie.domain,
        path: '/',
        expirationDate: config.cookie.expirationDate,
      });

      synced = true;
      Logger.success(`設定 cookie ${cookieName} 成功`);
    } catch (err) {
      synced = false;
      Logger.error(`設定 cookie ${cookieName} 失敗:`, err);
      break;
    }
  }

  return synced;
}
