import Stripe from "stripe";

// Server-only Stripe client. Null until STRIPE_SECRET_KEY is set, so the app
// runs (and deploys) fine before billing is configured.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
