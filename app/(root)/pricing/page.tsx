import { getPrice } from '@/lib/fetchers/getPrice';
import SimplifiedPricing from '@/features/simplified-pricing';
import { HustleTip } from '@/components/hustle-tip';
import { PricingProvider } from '@/hooks/use-pricing';

export default async function PricingPage() {
  let price;
  let error: string | null = null;

  try {
    price = await getPrice();
  } catch (e: any) {
    console.error("Failed to load price:", e);
    error = e.message || 'Failed to load price.';
  }

  return (
    <div className="container py-4 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 card-sharp fade-in">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">PRICE MANAGEMENT</h1>
          <p className="text-white/80 mt-1">Set your prices and maximize profits</p>
        </div>
        <HustleTip title="COST ANALYSIS">
          <p>
            Analyze your costs regularly to ensure profitability. Review your expenses and adjust your pricing strategy accordingly.
          </p>
        </HustleTip>
      </div>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      <PricingProvider>
        <SimplifiedPricing
          businessData={{
            wholesalePricePerOz: 0,
            markupPercentage: 100,
            retailPricePerGram: 0,
            targetProfit: 0,
            targetProfitPerMonth: 0,
            operatingExpenses: 0,
            inventoryQty: 0
          }}
        />
      </PricingProvider>
    </div>
  );
}