// Merchant of Record (MoR) Gateway Helper for Toolora SaaS
// Supports Lemon Squeezy, Payhip, Gumroad & MoR Hosted Checkout

export interface MorCheckoutConfig {
  morProvider: 'lemonsqueezy' | 'payhip' | 'gumroad' | 'generic';
  checkoutUrl: string;
}

export function getMorConfig(): MorCheckoutConfig {
  const customUrl = process.env.NEXT_PUBLIC_MOR_CHECKOUT_URL || process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL || '';
  
  if (customUrl) {
    let provider: 'lemonsqueezy' | 'payhip' | 'gumroad' | 'generic' = 'generic';
    if (customUrl.includes('lemonsqueezy')) provider = 'lemonsqueezy';
    if (customUrl.includes('payhip')) provider = 'payhip';
    if (customUrl.includes('gumroad')) provider = 'gumroad';

    return {
      morProvider: provider,
      checkoutUrl: customUrl,
    };
  }

  // Default MoR Checkout URL for Toolora 5-Tool Suite
  return {
    morProvider: 'payhip',
    checkoutUrl: 'https://payhip.com/b/Drtjs',
  };
}

export function generateMorCheckoutUrl(params: {
  amount?: number;
  email?: string;
  name?: string;
  orderId?: string;
}): string {
  const config = getMorConfig();
  const baseUrl = config.checkoutUrl;
  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);

  if (params.email) url.searchParams.set('checkout[email]', params.email);
  if (params.name) url.searchParams.set('checkout[name]', params.name);
  if (params.orderId) url.searchParams.set('checkout[custom][order_id]', params.orderId);

  return url.toString();
}
