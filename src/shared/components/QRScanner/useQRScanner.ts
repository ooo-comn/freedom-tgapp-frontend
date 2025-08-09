import { useCallback, useEffect, useRef } from "react";

interface UseQRScannerOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: unknown) => void;
  text?: string;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const { onSuccess, onError, text = "Наведите камеру на QR-код" } = options;
  const isScanningRef = useRef(false);
  const resolveRef = useRef<((value: string) => void) | null>(null);
  const rejectRef = useRef<((error: unknown) => void) | null>(null);
  const validatorRef = useRef<((qr: string) => boolean) | null>(null);
  const errorMessageRef = useRef<string | undefined>(undefined);
  const timeoutRef = useRef<number | null>(null);
  const isHandlingRef = useRef(false);
  const closeIntervalRef = useRef<number | null>(null);
  const onSuccessRef = useRef<typeof onSuccess>(onSuccess);

  // Debug helpers
  const debugSessionIdRef = useRef<string>("");
  const countersRef = useRef({
    event_qr: 0,
    event_qr_snake: 0,
    event_closed: 0,
    event_closed_snake: 0,
    callbacks: 0,
    timeouts: 0,
    closeCalls: 0,
  });
  const nowIso = () => new Date().toISOString();
  const log = useCallback((...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[QR][${debugSessionIdRef.current}] ${nowIso()}`, ...args);
  }, []);
  const logError = useCallback((...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[QR][${debugSessionIdRef.current}] ${nowIso()}`, ...args);
  }, []);
  const dumpState = useCallback(
    (label: string) => {
      log(label, {
        isScanning: isScanningRef.current,
        isHandling: isHandlingRef.current,
        hasTimeout: Boolean(timeoutRef.current),
        hasCloseInterval: Boolean(closeIntervalRef.current),
        hasResolve: Boolean(resolveRef.current),
        hasReject: Boolean(rejectRef.current),
        hasValidator: Boolean(validatorRef.current),
        errorMessage: errorMessageRef.current,
        counters: countersRef.current,
      });
    },
    [log]
  );

  // Храним актуальный onSuccess в ref, чтобы не перевешивать обработчики
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Инициализация debug-сессии и окружения
  useEffect(() => {
    debugSessionIdRef.current = `QR-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const webApp = window.Telegram?.WebApp as any;
    log("Hook initialized", {
      version: webApp?.version,
      platform: webApp?.platform,
      colorScheme: webApp?.colorScheme,
      viewportHeight: webApp?.viewportHeight,
      isExpanded: webApp?.isExpanded,
      has_showScanQrPopup: typeof webApp?.showScanQrPopup === "function",
      has_closeScanQrPopup: typeof webApp?.closeScanQrPopup === "function",
      has_onEvent: typeof webApp?.onEvent === "function",
      has_offEvent: typeof webApp?.offEvent === "function",
    });
    dumpState("Initial state");
  }, [log, dumpState]);

  // Функция для нативного закрытия QR сканера
  const closeQRScanner = useCallback(() => {
    countersRef.current.closeCalls += 1;
    log("=== Closing QR Scanner Natively ===", {
      closeCalls: countersRef.current.closeCalls,
    });

    try {
      // Закрываем только попап сканера, не всё WebApp
      if (typeof window.Telegram?.WebApp?.closeScanQrPopup === "function") {
        log("Using closeScanQrPopup API...");
        window.Telegram.WebApp.closeScanQrPopup();
        // Дублирующий вызов как страховка для некоторых клиентов Telegram
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 50);
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 150);
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
        }, 300);
        // Повторяющееся закрытие до прихода события закрытия (макс 10 попыток)
        if (closeIntervalRef.current) {
          clearInterval(closeIntervalRef.current);
          closeIntervalRef.current = null;
        }
        let attempts = 0;
        closeIntervalRef.current = window.setInterval(() => {
          try {
            window.Telegram?.WebApp?.closeScanQrPopup?.();
          } catch (err) {
            // ignore
          }
          attempts += 1;
          log("Periodic close attempt", { attempts });
          if (attempts >= 10) {
            if (closeIntervalRef.current) {
              clearInterval(closeIntervalRef.current);
              closeIntervalRef.current = null;
            }
            log("Stopped periodic close attempts after max attempts");
          }
        }, 100);
        isScanningRef.current = false;
        log("QR Scanner closed via closeScanQrPopup");
      } else {
        log("No closeScanQrPopup API available, relying on return true");
        isScanningRef.current = false;
      }
    } catch (error) {
      logError("Error closing QR scanner:", error);
      isScanningRef.current = false;
    }
    dumpState("After closeQRScanner call");
  }, [log, logError, dumpState]);

  // Обработка событий QR сканера
  useEffect(() => {
    const handleQRTextReceived = (eventData: { data?: string }) => {
      countersRef.current.event_qr += 1;
      log("=== QR Text Received Event in useQRScanner ===");
      log("Event data:", eventData);
      dumpState("Before handleQRTextReceived");

      if (eventData.data && !isHandlingRef.current) {
        isHandlingRef.current = true;
        const qrText: string = eventData.data;
        log("QR Code scanned via event:", qrText);

        // Чистим таймаут при успешном чтении
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Если задан валидатор — валидируем. При невалидном значении не закрываем попап
        if (validatorRef.current) {
          const isValid = validatorRef.current(qrText);
          log("QR validation result:", isValid);
          if (!isValid) {
            if (errorMessageRef.current && window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(errorMessageRef.current);
            }
            isHandlingRef.current = false;
            dumpState(
              "Validator failed in event handler (keeping scanner open)"
            );
            return; // оставляем сканер открытым
          }
        }

        // Сначала блокируем дальнейшие события и закрываем попап
        isScanningRef.current = false;
        closeQRScanner();

        // Затем отдаем результат наружу
        onSuccessRef.current?.(qrText);
        if (resolveRef.current) {
          resolveRef.current(qrText);
          resolveRef.current = null;
          rejectRef.current = null;
        }
        // Сбрасываем валидатор после успешного результата
        validatorRef.current = null;
        errorMessageRef.current = undefined;
        // isHandlingRef сбросим после события закрытия попапа,
        // чтобы не ловить дубликаты qr_text_received пока попап ещё на экране
      } else {
        log("QR event received but scanner is not active or no data", {
          hasData: Boolean(eventData.data),
          isHandling: isHandlingRef.current,
        });
      }
      dumpState("After handleQRTextReceived");
    };

    const handleScanQRPopupClosed = () => {
      countersRef.current.event_closed += 1;
      log("=== QR Scanner Popup Closed Event ===");
      isScanningRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (closeIntervalRef.current) {
        clearInterval(closeIntervalRef.current);
        closeIntervalRef.current = null;
      }

      // Снимаем флаг обработки, очищаем ссылки на Promise
      isHandlingRef.current = false;
      if (resolveRef.current) {
        rejectRef.current?.(new Error("QR Scanner closed by user"));
        resolveRef.current = null;
        rejectRef.current = null;
      }
      dumpState("After scanQrPopupClosed event");
    };

    // Используем официальный Telegram.WebApp.onEvent API
    if (window.Telegram?.WebApp?.onEvent) {
      // Основное событие
      (window.Telegram.WebApp as any).onEvent(
        "qrTextReceived",
        handleQRTextReceived
      );
      // Фолбэк для платформ, присылающих snake_case
      (window.Telegram.WebApp as any).onEvent(
        "qr_text_received",
        handleQRTextReceived as unknown as (data: unknown) => void
      );
      (window.Telegram.WebApp as any).onEvent(
        "scanQrPopupClosed",
        handleScanQRPopupClosed
      );
      // Snake case вариант названия события закрытия на некоторых клиентах
      (window.Telegram.WebApp as any).onEvent(
        "scan_qr_popup_closed",
        handleScanQRPopupClosed as unknown as (data: unknown) => void
      );
    }

    log(
      "QR Scanner event listeners setup completed using Telegram.WebApp.onEvent"
    );

    // Очистка при размонтировании
    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        (window.Telegram.WebApp as any).offEvent(
          "qrTextReceived",
          handleQRTextReceived
        );
        (window.Telegram.WebApp as any).offEvent(
          "qr_text_received",
          handleQRTextReceived as unknown as (data: unknown) => void
        );
        (window.Telegram.WebApp as any).offEvent(
          "scanQrPopupClosed",
          handleScanQRPopupClosed
        );
        // Убираем snake_case вариант события закрытия, если он использовался
        (window.Telegram.WebApp as any).offEvent(
          "scan_qr_popup_closed",
          handleScanQRPopupClosed as unknown as (data: unknown) => void
        );
      }
      log("Event listeners removed (cleanup)");
      dumpState("After cleanup");
    };
  }, [closeQRScanner, log, dumpState]);

  const scanQR = useCallback(async (): Promise<string | null> => {
    try {
      log("=== QR Scanner Debug ===");

      // Проверяем доступность QR сканера
      const isAvailable =
        typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
      log("QR Scanner isAvailable:", isAvailable);

      if (isAvailable) {
        log("Opening QR scanner...", { text });
        isScanningRef.current = true;
        dumpState("Before opening showScanQrPopup");

        return new Promise((resolve, reject) => {
          // Сохраняем ссылки на resolve и reject
          resolveRef.current = resolve;
          rejectRef.current = reject;
          dumpState("Promise created for scanQR");

          timeoutRef.current = window.setTimeout(() => {
            if (isScanningRef.current) {
              isScanningRef.current = false;
              closeQRScanner();
              const error = new Error("QR Scanner timeout");
              countersRef.current.timeouts += 1;
              logError("Timeout reached (scanQR)", {
                timeouts: countersRef.current.timeouts,
              });
              onError?.(error);
              reject(error);
              resolveRef.current = null;
              rejectRef.current = null;
            }
            timeoutRef.current = null;
          }, 30000); // 30 секунд таймаут

          // Открываем попап с callback как страховкой для клиентов,
          // где событие qrTextReceived может не приходить
          window.Telegram.WebApp.showScanQrPopup({ text }, (qrText: string) => {
            countersRef.current.callbacks += 1;
            log("QR callback received:", qrText);
            if (isHandlingRef.current) {
              log("Callback ignored: already handling result");
              return true;
            }
            isHandlingRef.current = true;
            try {
              // Чистим таймаут при успешном чтении
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }

              // Закрываем попап и завершаем промис
              isScanningRef.current = false;
              closeQRScanner();

              onSuccessRef.current?.(qrText);
              if (resolveRef.current) {
                resolveRef.current(qrText);
              }
            } catch (cbErr) {
              logError("Error in QR callback handler:", cbErr);
              onError?.(cbErr);
              if (rejectRef.current) {
                rejectRef.current(cbErr);
              }
            } finally {
              resolveRef.current = null;
              rejectRef.current = null;
              validatorRef.current = null;
              errorMessageRef.current = undefined;
            }
            return true; // просим Telegram закрыть попап
          });
        });
      } else {
        log("No QR scanner available!");
        const error = new Error("QR Scanner is not available");
        onError?.(error);
        return null;
      }
    } catch (error) {
      logError("QR Scanner error:", error);
      log("Error type:", typeof error);
      log("Error message:", error instanceof Error ? error.message : error);
      isScanningRef.current = false;
      onError?.(error);
      return null;
    }
  }, [onError, text, closeQRScanner, log, logError, dumpState]);

  const scanQRWithValidation = useCallback(
    async (
      validator: (qr: string) => boolean,
      errorMessage?: string
    ): Promise<string | null> => {
      try {
        log("=== QR Scanner Validation Debug ===");

        // Проверяем доступность QR сканера
        const isAvailable =
          typeof window.Telegram?.WebApp?.showScanQrPopup === "function";
        log("QR Scanner isAvailable:", isAvailable);

        if (isAvailable) {
          log("Opening QR scanner with validation...", { text });
          isScanningRef.current = true;
          dumpState("Before opening (validation)");

          return new Promise((resolve, reject) => {
            // Сохраняем ссылки на resolve/reject
            resolveRef.current = resolve;
            rejectRef.current = reject;

            // Настраиваем валидатор на время этого сканирования
            validatorRef.current = validator;
            errorMessageRef.current = errorMessage;
            dumpState("Promise created (validation)");

            timeoutRef.current = window.setTimeout(() => {
              if (isScanningRef.current) {
                isScanningRef.current = false;
                closeQRScanner();
                const error = new Error("QR Scanner timeout");
                countersRef.current.timeouts += 1;
                logError("Timeout reached (validation)", {
                  timeouts: countersRef.current.timeouts,
                });
                onError?.(error);
                reject(error);
                resolveRef.current = null;
                rejectRef.current = null;
                validatorRef.current = null;
                errorMessageRef.current = undefined;
              }
              timeoutRef.current = null;
            }, 30000);

            // Открываем попап с callback как страховкой для клиентов без событий
            window.Telegram.WebApp.showScanQrPopup(
              { text },
              (qrText: string) => {
                countersRef.current.callbacks += 1;
                log("QR callback (with validation) received:", qrText);
                if (isHandlingRef.current) {
                  log("Callback ignored: already handling result");
                  return true;
                }
                // Валидируем
                if (validatorRef.current) {
                  const isValid = validatorRef.current(qrText);
                  log("QR validation result (callback):", isValid);
                  if (!isValid) {
                    if (
                      errorMessageRef.current &&
                      window.Telegram?.WebApp?.showAlert
                    ) {
                      window.Telegram.WebApp.showAlert(errorMessageRef.current);
                    }
                    // Не закрываем попап, даём пользователю попытаться ещё раз
                    dumpState(
                      "Validator failed in callback (keeping scanner open)"
                    );
                    return false;
                  }
                }

                isHandlingRef.current = true;
                try {
                  // Чистим таймаут при успешном чтении
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }

                  // Закрываем попап и завершаем промис
                  isScanningRef.current = false;
                  closeQRScanner();

                  onSuccessRef.current?.(qrText);
                  if (resolveRef.current) {
                    resolveRef.current(qrText);
                  }
                } catch (cbErr) {
                  logError("Error in QR validation callback handler:", cbErr);
                  onError?.(cbErr);
                  if (rejectRef.current) {
                    rejectRef.current(cbErr);
                  }
                } finally {
                  resolveRef.current = null;
                  rejectRef.current = null;
                  validatorRef.current = null;
                  errorMessageRef.current = undefined;
                }
                return true; // просим Telegram закрыть попап
              }
            );
          });
        } else {
          const error = new Error("QR Scanner is not available");
          onError?.(error);
          return null;
        }
      } catch (error) {
        logError("QR Scanner validation error:", error);
        isScanningRef.current = false;
        onError?.(error);
        return null;
      }
    },
    [onError, text, closeQRScanner, log, logError, dumpState]
  );

  // Проверяем доступность при инициализации хука
  const isAvailable =
    typeof window.Telegram?.WebApp?.showScanQrPopup === "function";

  log("=== useQRScanner Hook Debug ===");
  log("isAvailable:", isAvailable);
  dumpState("Expose state to consumer");

  return {
    scanQR,
    scanQRWithValidation,
    closeQRScanner,
    isAvailable,
    isOpened: isScanningRef.current,
  };
};
