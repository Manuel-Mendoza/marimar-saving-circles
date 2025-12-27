// Exchange rate utilities for VES to USD conversion

interface ExchangeRate {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

class ExchangeRateService {
  private static instance: ExchangeRateService;
  private rate: number | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Fetch current official exchange rate from DolarAPI
   */
  async fetchRate(): Promise<number> {
    const now = Date.now();

    // Return cached rate if still valid
    if (this.rate && now - this.lastFetch < this.CACHE_DURATION) {
      return this.rate;
    }

    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares');

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const rates: ExchangeRate[] = await response.json();
      const officialRate = rates.find(rate => rate.fuente === 'oficial');

      if (!officialRate || !officialRate.promedio) {
        throw new Error('Official exchange rate not found');
      }

      this.rate = officialRate.promedio;
      this.lastFetch = now;

      return this.rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);

      // Return cached rate if available, otherwise fallback
      if (this.rate) {
        console.warn('Using cached exchange rate due to API error');
        return this.rate;
      }

      // Fallback rate (should be updated regularly)
      console.warn('Using fallback exchange rate');
      return 291.35; // Fallback rate
    }
  }

  /**
   * Convert VES amount to USD using current exchange rate
   */
  async convertVESToUSD(vesAmount: number): Promise<number> {
    const rate = await this.fetchRate();
    return vesAmount * rate;
  }

  /**
   * Get current exchange rate
   */
  async getCurrentRate(): Promise<number> {
    return this.fetchRate();
  }

  /**
   * Convert USD amount to VES using current exchange rate
   */
  async convertUSDtoVES(usdAmount: number): Promise<number> {
    const rate = await this.fetchRate();
    return usdAmount / rate;
  }

  /**
   * Clear cached rate (useful for testing)
   */
  clearCache(): void {
    this.rate = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const exchangeRateService = ExchangeRateService.getInstance();

// Export utility functions for easier usage
export const convertVESToUSD = (vesAmount: number): Promise<number> =>
  exchangeRateService.convertVESToUSD(vesAmount);

export const convertUSDtoVES = (usdAmount: number): Promise<number> =>
  exchangeRateService.convertUSDtoVES(usdAmount);

export const getCurrentExchangeRate = (): Promise<number> => exchangeRateService.getCurrentRate();
