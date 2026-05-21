export interface StorageItem {
  key: string;
  value: string;
  size: number;
}

export interface CookieItem {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  expirationDate?: number;
  sameSite?: chrome.cookies.SameSiteStatus;
  size: number;
}

export const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
  if (!chrome.tabs) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
};

export const getLocalStorage = async (tabId: number): Promise<StorageItem[]> => {
  if (!chrome.scripting) return [];
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key) || '';
            items.push({
              key,
              value,
              size: new Blob([key, value]).size
            });
          }
        }
        return items;
      }
    });
    return result || [];
  } catch (error) {
    console.error('Failed to get localStorage', error);
    return [];
  }
};

export const getSessionStorage = async (tabId: number): Promise<StorageItem[]> => {
  if (!chrome.scripting) return [];
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const items = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            const value = sessionStorage.getItem(key) || '';
            items.push({
              key,
              value,
              size: new Blob([key, value]).size
            });
          }
        }
        return items;
      }
    });
    return result || [];
  } catch (error) {
    console.error('Failed to get sessionStorage', error);
    return [];
  }
};

export const setLocalStorageItem = async (tabId: number, key: string, value: string): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (k, v) => localStorage.setItem(k, v),
    args: [key, value]
  });
};

export const removeLocalStorageItem = async (tabId: number, key: string): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (k) => localStorage.removeItem(k),
    args: [key]
  });
};

export const clearLocalStorage = async (tabId: number): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => localStorage.clear()
  });
};

export const setSessionStorageItem = async (tabId: number, key: string, value: string): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (k, v) => sessionStorage.setItem(k, v),
    args: [key, value]
  });
};

export const removeSessionStorageItem = async (tabId: number, key: string): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (k) => sessionStorage.removeItem(k),
    args: [key]
  });
};

export const clearSessionStorage = async (tabId: number): Promise<void> => {
  if (!chrome.scripting) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => sessionStorage.clear()
  });
};

export const getCookies = async (url: string): Promise<CookieItem[]> => {
  if (!chrome.cookies) return [];
  try {
    const cookies = await chrome.cookies.getAll({ url });
    return cookies.map(c => ({
      ...c,
      size: new Blob([c.name, c.value]).size
    }));
  } catch (error) {
    console.error('Failed to get cookies', error);
    return [];
  }
};

export const setCookie = async (url: string, cookie: Partial<chrome.cookies.Cookie>): Promise<void> => {
  if (!chrome.cookies) return;
  try {
    const details: chrome.cookies.SetDetails = {
      url,
      name: cookie.name!,
      value: cookie.value || '',
      domain: cookie.domain,
      path: cookie.path || '/',
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      expirationDate: cookie.expirationDate,
      sameSite: cookie.sameSite
    };
    // remove undefined props
    Object.keys(details).forEach(key => details[key as keyof typeof details] === undefined && delete details[key as keyof typeof details]);
    await chrome.cookies.set(details);
  } catch (error) {
    console.error('Failed to set cookie', error);
  }
};

export const removeCookie = async (url: string, name: string): Promise<void> => {
  if (!chrome.cookies) return;
  await chrome.cookies.remove({ url, name });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
