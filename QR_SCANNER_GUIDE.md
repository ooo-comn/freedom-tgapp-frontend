# Руководство по QR Сканеру

## Что было сделано

Я обновил ваш QR сканер для использования официального Telegram Mini Apps SDK (`@telegram-apps/sdk`) вместо прямого обращения к `window.Telegram.WebApp`.

## Основные изменения

### 1. Обновленный компонент QRScanner

- Использует `qrScanner.open()` из `@telegram-apps/sdk`
- Поддерживает как Promise, так и callback стили
- Автоматическая проверка доступности
- Улучшенная обработка ошибок

### 2. Новый хук useQRScanner

- Удобный хук для использования QR сканера в любом компоненте
- Поддержка валидации QR кодов
- Callback для успеха и ошибок
- Настраиваемый текст

### 3. Обновленная страница QRPayment

- Использует новый хук вместо старого компонента
- Улучшенный UI с кнопкой для открытия сканера
- Обработка случаев, когда сканер недоступен

## Как использовать

### Простое сканирование

```tsx
import { useQRScanner } from "src/shared/components/QRScanner";

const MyComponent = () => {
  const { scanQR, isAvailable } = useQRScanner({
    onSuccess: (result) => console.log("QR:", result),
    onError: (error) => console.error("Error:", error),
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

### Сканирование с валидацией

```tsx
const { scanQRWithValidation } = useQRScanner();

const handleValidatedScan = async () => {
  const result = await scanQRWithValidation(
    (qr) => qr.startsWith("http"), // Валидация
    "QR код должен содержать ссылку" // Сообщение об ошибке
  );

  if (result) {
    // Обработка валидного QR кода
  }
};
```

## Тестирование

1. **В Telegram Mini App**: Перейдите по адресу `/qr-test` для тестирования
2. **Проверка доступности**: Компонент автоматически проверяет доступность QR сканера
3. **Логирование**: Все действия логируются в консоль для отладки

## Преимущества нового подхода

1. **Официальный SDK**: Использует официальный Telegram Mini Apps SDK
2. **Лучшая совместимость**: Работает с новыми версиями Telegram
3. **Удобство использования**: Простой API с хуком
4. **Валидация**: Встроенная поддержка валидации QR кодов
5. **Обработка ошибок**: Улучшенная обработка ошибок и edge cases

## Файлы

- `src/shared/components/QRScanner/QRScanner.tsx` - Основной компонент
- `src/shared/components/QRScanner/useQRScanner.ts` - Хук для использования
- `src/shared/components/QRScanner/QRScannerExample.tsx` - Пример использования
- `src/shared/components/QRScanner/QRScannerTest.tsx` - Тестовый компонент
- `src/shared/components/QRScanner/README.md` - Подробная документация
- `src/pages/QRPayment/QRPayment.tsx` - Обновленная страница QR платежей

## Маршруты для тестирования

- `/qr-payment` - Страница QR платежей (обновленная)
- `/qr-test` - Тестовая страница QR сканера

## Совместимость

- Требуется Telegram версии 6.1+
- Работает только в Telegram Mini Apps
- В веб-браузере покажет сообщение о недоступности
