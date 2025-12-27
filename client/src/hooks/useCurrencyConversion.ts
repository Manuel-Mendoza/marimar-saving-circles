import { useState, useEffect } from 'react';
import { convertVESToUSD, getCurrentExchangeRate } from '@/lib/exchangeRate';

interface CurrencyConversionResult {
  usdPrice: number;
  exchangeRate: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to convert VES prices to USD using real-time exchange rates
 */
export function useCurrencyConversion(vesPrice: number): CurrencyConversionResult {
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const convertPrice = async () => {
      if (vesPrice <= 0) {
        if (isMounted) {
          setUsdPrice(0);
          setExchangeRate(0);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Convert VES to USD
        const convertedPrice = await convertVESToUSD(vesPrice);
        const currentRate = await getCurrentExchangeRate();

        if (isMounted) {
          setUsdPrice(convertedPrice);
          setExchangeRate(currentRate);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error converting currency');
          setUsdPrice(vesPrice * 291.35); // Fallback conversion
          setExchangeRate(291.35);
          setIsLoading(false);
        }
      }
    };

    convertPrice();

    return () => {
      isMounted = false;
    };
  }, [vesPrice]);

  return {
    usdPrice,
    exchangeRate,
    isLoading,
    error,
  };
}

/**
 * Hook to get current exchange rate without conversion
 */
export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const rate = await getCurrentExchangeRate();

        if (isMounted) {
          setExchangeRate(rate);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching exchange rate');
          setExchangeRate(291.35); // Fallback rate
          setIsLoading(false);
        }
      }
    };

    fetchRate();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    exchangeRate,
    isLoading,
    error,
  };
}
