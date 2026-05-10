import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  const { stripe } = useRuntimeConfig();

  if (!stripe.secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripe.secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  return stripeClient;
};
