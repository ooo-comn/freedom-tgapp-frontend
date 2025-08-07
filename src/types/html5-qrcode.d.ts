// Расширение типов для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          isVisible: boolean;
        };
        onEvent(eventType: string, callback: () => void): void;
        offEvent(eventType: string, callback: () => void): void;
        requestCameraAccess(): Promise<boolean>;
        showScanQrPopup(options: {
          text: string;
          onResult: (result: string) => void;
          onError: (error: any) => void;
        }): void;
        closeScanQrPopup(): void;
        showAlert(message: string): void;
        ready(): void;
        expand(): void;
        close(): void;
        openLink(url: string): void;
        openTelegramLink(url: string): void;
        colorScheme?: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
            is_premium?: boolean;
            allows_write_to_pm?: boolean;
          };
          auth_date?: number;
          hash?: string;
        };
        initData?: string;
      };
    };
  }
}

export {};
