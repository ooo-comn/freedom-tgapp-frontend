export type FetcherOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

const WALLET_ADDRESS_KEY = "wallet_address";

export const setWalletAddressHeader = (address: string) => {
  try {
    if (address) {
      localStorage.setItem(WALLET_ADDRESS_KEY, address);
      (window as any).__WALLET_ADDRESS__ = address;
    }
  } catch {
    // ignore
  }
};

export const getWalletAddressHeader = (): string | null => {
  try {
    return (
      localStorage.getItem(WALLET_ADDRESS_KEY) ||
      (window as any).__WALLET_ADDRESS__ ||
      null
    );
  } catch {
    return null;
  }
};

export const fetchJson = async <T = unknown>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> => {
  const walletAddress = getWalletAddressHeader();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (walletAddress && !headers["wallet_address"]) {
    headers["wallet_address"] = walletAddress;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return (await response.json()) as T;
};
