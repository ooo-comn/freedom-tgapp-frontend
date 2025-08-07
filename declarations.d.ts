declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
        };
        onEvent(eventType: string, callback: () => void): void;
        initDataUnsafe: {
          user: {
            id: number;
            first_name?: string;
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
        requestCameraAccess(): Promise<boolean>;
        showScanQrPopup(options: {
          text: string;
          onResult: (result: string) => void;
          onError: (error: any) => void;
        }): void;
        closeScanQrPopup(): void;
      };
    };
  }
}
