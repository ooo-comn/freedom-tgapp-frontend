// Утилита для безопасного доступа к Telegram WebApp API

export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp;
};

export const getTelegramInitData = (): string => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.warn("Telegram WebApp not available");
    return "";
  }

  // Проверяем, есть ли свойство initData
  if ("initData" in webApp) {
    return (webApp as any).initData || "";
  }

  return "";
};

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  if (!webApp?.initDataUnsafe?.user) {
    console.warn("Telegram user data not available");
    return null;
  }

  return webApp.initDataUnsafe.user;
};

export const getTelegramUserId = (): number | null => {
  const user = getTelegramUser();
  return user?.id || null;
};

export const getTelegramAuthHeader = (): string => {
  const initData = getTelegramInitData();
  return initData ? `tma ${initData}` : "";
};
