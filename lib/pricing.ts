/**
 * Pricing utility to calculate booking costs based on PriceLabs data
 */

interface PriceData {
  date: string;
  price: number;
  minStay: number;
  available: boolean;
}

// Parse CSV data and create a price map
const parsePriceLabsCSV = (csvText: string): Map<string, PriceData> => {
  const priceMap = new Map<string, PriceData>();
  const lines = csvText.trim().split('\n');
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields)
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 7) continue;
    
    const date = matches[0].replace(/"/g, '');
    const priceStr = matches[4].replace(/"/g, ''); // "Price with Default Customization" column
    const minStayStr = matches[3].replace(/"/g, '');
    const availableStr = matches[6].replace(/"/g, '');
    
    const price = parseFloat(priceStr);
    const minStay = parseInt(minStayStr) || 1;
    const available = availableStr.toLowerCase() === 'true';
    
    if (!isNaN(price) && date) {
      priceMap.set(date, { date, price, minStay, available });
    }
  }
  
  return priceMap;
};

// Calculate total pricing for a date range
export const calculateBookingPricing = (
  checkInDate: string,
  checkOutDate: string,
  priceMap: Map<string, PriceData>
) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  // Calculate number of nights
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) {
    return null;
  }
  
  // Calculate nightly prices
  const nightlyPrices: { date: string; price: number }[] = [];
  let totalAccommodation = 0;
  let currentDate = new Date(checkIn);
  
  for (let i = 0; i < nights; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const priceData = priceMap.get(dateStr);
    
    if (priceData) {
      nightlyPrices.push({ date: dateStr, price: priceData.price });
      totalAccommodation += priceData.price;
    } else {
      // Fallback to default price if not in CSV
      const defaultPrice = 1500;
      nightlyPrices.push({ date: dateStr, price: defaultPrice });
      totalAccommodation += defaultPrice;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate fees
  const cleaningFee = 500; // R500 flat cleaning fee
  const serviceFee = totalAccommodation * 0.12; // 12% service fee
  const total = totalAccommodation + cleaningFee + serviceFee;
  
  return {
    numberOfNights: nights,
    nightlyPrices,
    basePrice: totalAccommodation,
    averagePricePerNight: totalAccommodation / nights,
    cleaningFee,
    serviceFee,
    total
  };
};

// Get price for a specific date
export const getPriceForDate = (date: string, priceMap: Map<string, PriceData>): number => {
  const priceData = priceMap.get(date);
  return priceData ? priceData.price : 1500; // Default fallback
};

// Check minimum stay requirement
export const getMinimumStay = (checkInDate: string, priceMap: Map<string, PriceData>): number => {
  const priceData = priceMap.get(checkInDate);
  return priceData ? priceData.minStay : 2; // Default minimum stay
};

// Export parser for use in API/components
export { parsePriceLabsCSV };
export type { PriceData };

