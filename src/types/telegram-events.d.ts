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

// Типы для QR сканера согласно официальной документации
export interface ScanQrPopupParams {
  text?: string;
}

// Расширение глобального объекта Window
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        // QR Scanner методы (Bot API 6.4+)
        showScanQrPopup: (
          params: ScanQrPopupParams,
          callback?: (result: string) => boolean
        ) => void;
        closeScanQrPopup: () => void;

        // Основные методы
        showAlert: (message: string) => void;
        showConfirm: (
          message: string,
          callback?: (confirmed: boolean) => void
        ) => void;
        showPopup: (
          params: {
            title?: string;
            message: string;
            buttons?: Array<{
              id?: string;
              type?: "default" | "ok" | "close" | "cancel" | "destructive";
              text: string;
            }>;
          },
          callback?: (buttonId: string) => void
        ) => void;

        // Навигация
        ready: () => void;
        expand: () => void;
        close: () => void;

        // Подтверждение закрытия
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        isClosingConfirmationEnabled?: boolean;

        // Свайпы
        isVerticalSwipesEnabled?: boolean;
        enableVerticalSwipes?: () => void;
        disableVerticalSwipes?: () => void;

        // События
        onEvent: (
          eventType: string,
          callback: (eventData: any) => void
        ) => void;
        offEvent: (
          eventType: string,
          callback: (eventData: any) => void
        ) => void;

        // Основная кнопка
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };

        // Кнопка назад
        BackButton?: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };

        // Haptic feedback
        HapticFeedback?: {
          impactOccurred: (
            style: "light" | "medium" | "heavy" | "rigid" | "soft"
          ) => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };

        // Cloud Storage
        CloudStorage?: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          getItems: (keys: string[]) => Promise<Record<string, string | null>>;
          removeItem: (key: string) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
        };

        // Device Storage (Bot API 9.0+)
        DeviceStorage?: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          getItems: (keys: string[]) => Promise<Record<string, string | null>>;
          removeItem: (key: string) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
        };

        // Secure Storage (Bot API 9.0+)
        SecureStorage?: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          getItems: (keys: string[]) => Promise<Record<string, string | null>>;
          removeItem: (key: string) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
        };

        // Свойства
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
            is_premium?: boolean;
            allows_write_to_pm?: boolean;
            added_to_attachment_menu?: boolean;
          };
          chat?: {
            id: number;
            type: "group" | "supergroup" | "channel";
            title: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date?: number;
          hash?: string;
        };
        colorScheme?: "light" | "dark";
        themeParams?: Record<string, string>;
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
        isClosingConfirmationEnabled?: boolean;
        platform?: string;
        version?: string;
        botInline?: boolean;
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
