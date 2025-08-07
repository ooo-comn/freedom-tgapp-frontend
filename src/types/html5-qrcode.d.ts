// Расширение типов для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
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
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export {};
