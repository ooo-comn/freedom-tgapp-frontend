import { useQuery } from "@tanstack/react-query";

interface ExchangeRateResponse {
  price: {
    currency: string;
    unit: string;
    usdt_rub: number;
  };
  service: {
    cache_ttl: string;
    last_update: string;
    providers: number;
    type: string;
  };
  status: string;
  timestamp: string;
}

const fetchExchangeRate = async (): Promise<ExchangeRateResponse> => {
  const response = await fetch("https://comnapp.ru/api/v1/price");
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate");
  }
  return response.json();
};

export const useExchangeRate = () => {
  return useQuery({
    queryKey: ["exchangeRate"],
    queryFn: fetchExchangeRate,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
