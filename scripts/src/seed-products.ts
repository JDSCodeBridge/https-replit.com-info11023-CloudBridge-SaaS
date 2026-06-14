import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log('Creating CloudLift products in Stripe...');

    // --- Pro Plan ($49.99/year) ---
    const existingPro = await stripe.products.search({ query: "name:'CloudLift Pro' AND active:'true'" });
    let proProduct;
    if (existingPro.data.length > 0) {
      proProduct = existingPro.data[0];
      console.log(`Pro Plan already exists: ${proProduct.id}`);
    } else {
      proProduct = await stripe.products.create({
        name: 'CloudLift Pro',
        description: 'Unlimited repositories, advanced AI analysis, and priority deployment recommendations.',
        metadata: { plan: 'pro' },
      });
      console.log(`Created Pro product: ${proProduct.id}`);
    }

    const existingProPrices = await stripe.prices.list({ product: proProduct.id, active: true });
    if (existingProPrices.data.length === 0) {
      const proYearlyPrice = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 4999,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan: 'pro', interval: 'year' },
      });
      console.log(`Created Pro yearly price: $49.99/year (${proYearlyPrice.id})`);
    } else {
      console.log(`Pro prices already exist: ${existingProPrices.data.map(p => p.id).join(', ')}`);
    }

    // --- Launch Package ($149 one-time) ---
    const existingLaunch = await stripe.products.search({ query: "name:'CloudLift Launch Package' AND active:'true'" });
    let launchProduct;
    if (existingLaunch.data.length > 0) {
      launchProduct = existingLaunch.data[0];
      console.log(`Launch Package already exists: ${launchProduct.id}`);
    } else {
      launchProduct = await stripe.products.create({
        name: 'CloudLift Launch Package',
        description: 'Full concierge cloud deployment — AWS, GCP, or DigitalOcean. 24–48 hour turnaround.',
        metadata: { plan: 'launch' },
      });
      console.log(`Created Launch Package product: ${launchProduct.id}`);
    }

    const existingLaunchPrices = await stripe.prices.list({ product: launchProduct.id, active: true });
    if (existingLaunchPrices.data.length === 0) {
      const launchPrice = await stripe.prices.create({
        product: launchProduct.id,
        unit_amount: 14900,
        currency: 'usd',
        metadata: { plan: 'launch' },
      });
      console.log(`Created Launch Package price: $149.00 one-time (${launchPrice.id})`);
    } else {
      console.log(`Launch prices already exist.`);
    }

    // --- Apple Publishing ($299 one-time) ---
    const existingApple = await stripe.products.search({ query: "name:'CloudLift Apple Publishing' AND active:'true'" });
    let appleProduct;
    if (existingApple.data.length > 0) {
      appleProduct = existingApple.data[0];
      console.log(`Apple Publishing already exists: ${appleProduct.id}`);
    } else {
      appleProduct = await stripe.products.create({
        name: 'CloudLift Apple Publishing',
        description: 'End-to-end App Store submission — metadata, screenshots, compliance review, and revision support.',
        metadata: { plan: 'apple' },
      });
      console.log(`Created Apple Publishing product: ${appleProduct.id}`);
    }

    const existingApplePrices = await stripe.prices.list({ product: appleProduct.id, active: true });
    if (existingApplePrices.data.length === 0) {
      const applePrice = await stripe.prices.create({
        product: appleProduct.id,
        unit_amount: 29900,
        currency: 'usd',
        metadata: { plan: 'apple' },
      });
      console.log(`Created Apple Publishing price: $299.00 one-time (${applePrice.id})`);
    } else {
      console.log(`Apple prices already exist.`);
    }

    console.log('\n✅ All products created successfully!');
    console.log('Webhooks will sync this data to your database automatically.');
    console.log('\nNext: Copy the price IDs above and set them as env vars:');
    console.log('  STRIPE_PRICE_PRO_YEARLY=price_...');
    console.log('  STRIPE_PRICE_LAUNCH=price_...');
    console.log('  STRIPE_PRICE_APPLE=price_...');
  } catch (error: any) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

createProducts();
