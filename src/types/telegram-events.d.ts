// Типы для событий Telegram Mini Apps
export interface TelegramEventData {
  qr_text_received?: {
    data: string;
  };
  scan_qr_popup_closed?: {};
  popup_closed?: {
    button_id?: string;
  };
  main_button_pressed?: {};
  back_button_pressed?: {};
  viewport_changed?: {
    height: number;
    width?: number;
    is_expanded: boolean;
    is_state_stable: boolean;
  };
  theme_changed?: {
    theme_params: Record<string, string>;
  };
  invoice_closed?: {
    slug: string;
    status: "paid" | "failed" | "pending" | "cancelled";
  };
}

export type TelegramEventType = keyof TelegramEventData;

// Расширение глобального объекта Window
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        showScanQrPopup: (options: {
          text: string;
          onResult: (result: string) => void;
          onError: (error: any) => void;
        }) => void;
        closeScanQrPopup: () => void;
        showAlert: (message: string) => void;
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        isVerticalSwipesEnabled?: boolean;
        disableVerticalSwipes?: () => void;
      };
      GameProxy?: {
        receiveEvent: (eventType: string, eventData: any) => void;
      };
      WebView?: {
        receiveEvent: (eventType: string, eventData: any) => void;
      };
    };
    TelegramGameProxy_receiveEvent?: (
      eventType: string,
      eventData: any
    ) => void;
  }
}
