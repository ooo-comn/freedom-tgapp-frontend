# QR Scanner Component

Компонент для сканирования QR-кодов с использованием официального Telegram Mini Apps SDK.

## Установка

Убедитесь, что у вас установлен `@telegram-apps/sdk`:

```bash
npm install @telegram-apps/sdk
```

## Использование

### 1. Простой компонент QRScanner

```tsx
import { QRScanner } from "@/shared/components/QRScanner";

const MyComponent = () => {
  const handleScanSuccess = (result: string) => {
    console.log("Отсканированный QR код:", result);
    // Обработка результата
  };

  const handleClose = () => {
    console.log("QR сканер закрыт");
  };

  return <QRScanner onScanSuccess={handleScanSuccess} onClose={handleClose} />;
};
```

### 2. Использование хука useQRScanner

```tsx
import { useQRScanner } from "@/shared/components/QRScanner";

const MyComponent = () => {
  const { scanQR, isAvailable } = useQRScanner({
    onSuccess: (result) => {
      console.log("QR код отсканирован:", result);
    },
    onError: (error) => {
      console.error("Ошибка сканирования:", error);
    },
    text: "Наведите камеру на QR-код",
  });

  const handleScan = async () => {
    if (isAvailable) {
      const result = await scanQR();
      if (result) {
        // Обработка результата
      }
    }
  };

  return (
    <button onClick={handleScan} disabled={!isAvailable}>
      Сканировать QR
    </button>
  );
};
```

### 3. Сканирование с валидацией

```tsx
import { useQRScanner } from "@/shared/components/QRScanner";

const MyComponent = () => {
  const { scanQRWithValidation } = useQRScanner();

  const handleValidatedScan = async () => {
    // Валидация - проверяем, что QR код содержит URL
    const result = await scanQRWithValidation(
      (qr) => qr.startsWith("http") || qr.startsWith("https"),
      "QR код должен содержать ссылку"
    );

    if (result) {
      console.log("Валидный QR код:", result);
    }
  };

  return (
    <button onClick={handleValidatedScan}>Сканировать с валидацией</button>
  );
};
```

## API

### QRScanner Component

| Prop            | Type                       | Description                        |
| --------------- | -------------------------- | ---------------------------------- |
| `onScanSuccess` | `(result: string) => void` | Callback при успешном сканировании |
| `onClose`       | `() => void`               | Callback при закрытии сканера      |

### useQRScanner Hook

#### Options

| Option      | Type                       | Default                     | Description                        |
| ----------- | -------------------------- | --------------------------- | ---------------------------------- |
| `onSuccess` | `(result: string) => void` | -                           | Callback при успешном сканировании |
| `onError`   | `(error: any) => void`     | -                           | Callback при ошибке                |
| `text`      | `string`                   | "Наведите камеру на QR-код" | Текст для отображения в сканере    |

#### Return Values

| Property               | Type                                                                                     | Description                           |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| `scanQR`               | `() => Promise<string \| null>`                                                          | Функция для простого сканирования     |
| `scanQRWithValidation` | `(validator: (qr: string) => boolean, errorMessage?: string) => Promise<string \| null>` | Функция для сканирования с валидацией |
| `isAvailable`          | `boolean`                                                                                | Доступен ли QR сканер                 |
| `isOpened`             | `boolean`                                                                                | Открыт ли QR сканер                   |

## Примеры валидации

### Проверка URL

```tsx
const validator = (qr: string) => {
  try {
    new URL(qr);
    return true;
  } catch {
    return false;
  }
};
```

### Проверка TON адреса

```tsx
const validator = (qr: string) => {
  return /^[0-9a-zA-Z_-]{48}$/.test(qr);
};
```

### Проверка JSON

```tsx
const validator = (qr: string) => {
  try {
    JSON.parse(qr);
    return true;
  } catch {
    return false;
  }
};
```

## Обработка ошибок

```tsx
const { scanQR } = useQRScanner({
  onError: (error) => {
    if (error.message === "QR Scanner is not available") {
      // QR сканер недоступен в данной версии Telegram
      alert("QR сканер недоступен");
    } else {
      // Другие ошибки
      console.error("Ошибка сканирования:", error);
    }
  },
});
```

## Совместимость

- Требуется Telegram версии 6.1+
- Работает только в Telegram Mini Apps
- В веб-браузере компонент покажет сообщение о недоступности

## Примечания

1. QR сканер автоматически закрывается после успешного сканирования
2. Пользователь может отменить сканирование, нажав кнопку "Отмена"
3. При ошибке сканирования показывается уведомление пользователю
4. Компонент автоматически проверяет доступность QR сканера
