
# Bookmarked Monorepo

This repository contains both a mobile iOS app (built with React Native/Expo) and a web dashboard (built with React).

## Structure

- `apps/mobile/` — The iOS/Android mobile app using Expo and React Native.
- `apps/web/` — The frontend dashboard web app using React, Vite, and modern libraries.

## Mobile App (`apps/mobile`)

- Built with Expo and React Native.
- Uses `expo-router` for navigation and routing.
- Includes features like safe area handling, error boundaries, and toast notifications.
- Integrates with device features (camera, contacts, haptics, etc.) via Expo modules.
- Custom polyfills for web compatibility.
- Main entry: `App.tsx`.
- Assets and patches for platform-specific needs.


## Web Dashboard (`apps/web`)

- Built with React and Vite.
- Uses Chakra UI for design, React Router for routing, and TanStack React Query for data fetching.
- Main page: `src/app/page.jsx` — displays bookmarks and categories, with search and filtering.
- Integrates with backend APIs for bookmarks and categories.
- Modern state management and UI libraries.

## Development

### Mobile

- Install dependencies: `cd apps/mobile && npm install`
- Start development: `npx expo start`


### Web

- Install dependencies: `cd apps/web && npm install`
- Start development: `npm run dev`


## Scripts

- See each app's `package.json` for available scripts.


## Contributing

Pull requests and issues are welcome! Please follow conventional commit messages and ensure your code is linted and tested.


## License

See the `LICENSE` file for details.
