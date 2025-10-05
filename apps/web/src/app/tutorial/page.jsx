export default function TutorialPage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>Bookmarked — Setup Tutorial</h1>
      <p>See TUTORIAL.md in the repo for step-by-step setup. Highlights:</p>
      <ol>
        <li>Configure apps/web/.env and apps/mobile/.env</li>
        <li>Stripe: set STRIPE_SECRET_KEY and EXPO_PUBLIC_STRIPE_PRICE_ID</li>
        <li>Apple IAP: set APPLE_IAP_SHARED_SECRET and product IDs</li>
        <li>TikTok/Instagram: set client keys/secrets and redirect URIs</li>
        <li>Deep link: set MOBILE_OAUTH_CLOSE_URL (e.g., bookmarked://oauth-close)</li>
      </ol>
      <p>
        For testing steps, open TESTING.md. This page exists to give a friendly
        in-app reference and link target.
      </p>
    </div>
  );
}
