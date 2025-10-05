# Testing Guide

This guide covers manual test steps and pointers for automation.

## Manual Tests

### Stripe Checkout (Web)
1. Populate STRIPE_SECRET_KEY and PUBLIC_BASE_URL in apps/web/.env.
2. Set EXPO_PUBLIC_STRIPE_PRICE_ID in apps/mobile/.env.
3. In the app, go to Subscription tab and press "Checkout on Web (Stripe)".
4. Confirm Stripe Checkout opens and completes; success page loads.

### iOS IAP Receipt Validation
1. Set APPLE_IAP_SHARED_SECRET in apps/web/.env and product IDs in apps/mobile/.env.
2. Run the app on iOS device/simulator configured for StoreKit testing.
3. Tap "Subscribe with Apple".
4. After purchase, the app posts the receipt to /api/billing/ios/validate.
5. Verify Neon table `entitlements` has a row for your user with platform=ios and correct product_id/expires_at.

### TikTok Native OAuth
1. Set TIKTOK_CLIENT_KEY/SECRET and TIKTOK_REDIRECT_URI_*, ENV in apps/web/.env.
2. Ensure MOBILE_OAUTH_CLOSE_URL matches your deep link.
3. In Profile, tap "Connect TikTok".
4. Complete auth → the browser should 302 to your deep link and close.
5. Verify Neon `tiktok_tokens` table updated for your user.

### Instagram Native OAuth
1. Set INSTAGRAM_CLIENT_ID/SECRET/REDIRECT_URI in apps/web/.env.
2. In Profile, tap "Connect Instagram" and complete auth.
3. Verify Neon `instagram_tokens` has the long‑lived token for your user.

## Automation Pointers

- API route tests (Node):
  - Mock fetch to Apple/Stripe/TikTok/Instagram endpoints.
  - Exercise each route with expected payload and assert DB upserts.

- E2E (Detox/Expo):
  - Deep link handling: trigger MOBILE_OAUTH_CLOSE_URL and assert app resumes and shows "Connected" state.
  - Stripe flow: in staging, open Checkout URL and assert we navigate to success (can be flaky; prefer mocking during CI).

- Contract tests:
  - Validate schema of entitlements/tokens tables using simple SQL queries.
