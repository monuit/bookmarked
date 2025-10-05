# Bookmarked — Setup Tutorial

This tutorial walks you through configuring environments, enabling billing, and connecting TikTok and Instagram using native OAuth.

## 1. Environments

- apps/web/.env
  - ENV=development|staging|production
  - PUBLIC_BASE_URL=your web base URL (e.g. http://localhost:5173 or prod domain)
  - DATABASE_URL=Neon connection string
  - AUTH_SECRET=any random string
  - STRIPE_SECRET_KEY=sk_live_or_test
  - STRIPE_WEBHOOK_SECRET=optional
  - TIKTOK_CLIENT_KEY= / TIKTOK_CLIENT_SECRET=
  - TIKTOK_REDIRECT_URI_DEV/STAGING/PROD=http(s)://<base>/api/tiktok/auth/callback
  - INSTAGRAM_CLIENT_ID= / INSTAGRAM_CLIENT_SECRET= / INSTAGRAM_REDIRECT_URI=
  - APPLE_IAP_SHARED_SECRET=
  - MOBILE_OAUTH_CLOSE_URL=bookmarked://oauth-close (deep link to close in-app browser)

- apps/mobile/.env
  - EXPO_PUBLIC_ENV=development|staging|production
  - EXPO_PUBLIC_BASE_URL=http(s)://your web base URL
  - EXPO_PUBLIC_IOS_PRODUCT_IDS=com.app.pro.monthly,com.app.pro.yearly
  - EXPO_PUBLIC_STRIPE_PRICE_ID=price_xxx

## 2. Stripe (Web)

1. Create a Product and a recurring Price in Stripe Dashboard.
2. Set STRIPE_SECRET_KEY in apps/web/.env.
3. Put the Price ID in apps/mobile/.env as EXPO_PUBLIC_STRIPE_PRICE_ID.
4. The mobile Subscription screen calls /api/billing/stripe/checkout with the priceId and opens Checkout in the browser.

## 3. Apple In‑App Purchase (iOS)

1. In App Store Connect, create Auto‑renewable Subscription(s) and note product IDs.
2. Put product IDs in apps/mobile/.env as EXPO_PUBLIC_IOS_PRODUCT_IDS (comma‑separated).
3. Set APPLE_IAP_SHARED_SECRET in apps/web/.env.
4. After a purchase, the app posts the iOS receipt to /api/billing/ios/validate. The server verifies receipt with Apple and stores entitlement.

## 4. TikTok OAuth (Native)

1. Create a TikTok app, set client key/secret in apps/web/.env.
2. Set redirect URIs to /api/tiktok/auth/callback for each environment.
3. MOBILE_OAUTH_CLOSE_URL allows the callback to 302 deep link back into the app (bookmarked://oauth-close).
4. In Profile screen, "Connect TikTok" calls /api/tiktok/auth/start and opens the authorize URL natively.

## 5. Instagram OAuth (Native)

1. Create an Instagram app (Basic Display API), obtain client id/secret.
2. Set INSTAGRAM_CLIENT_ID/SECRET and INSTAGRAM_REDIRECT_URI in apps/web/.env.
3. Profile screen "Connect Instagram" uses /api/instagram/auth/start and callback stores the long‑lived token.

## 6. Deep Link Setup

Configure your app scheme (e.g., bookmarked://) in your Expo/Native config so that MOBILE_OAUTH_CLOSE_URL can close the in‑app browser upon successful callback.

## 7. Running locally

- Web: cd apps/web && npm run dev
- Mobile: cd apps/mobile && npx expo start
