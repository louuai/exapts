# OMEGA Mobile (Expo)

React Native companion app powered by the OMEGA REST API.

## Run

```bash
npm install
npm start
```

Then scan the QR code with **Expo Go** on your phone, or press `i` / `a` for iOS / Android simulators.

⚠️ On a physical device, replace `localhost` in `src/lib/api.js` with your computer's LAN IP (e.g. `192.168.1.42`) so the app can reach the backend.

## Screens

- **HomeScreen** — hero, featured properties carousel, guides grid
- **PropertiesScreen** — search + region chips + cards
- **PropertyDetailScreen** — paginated gallery, key facts, description, features, CTA
- **GuidesScreen** — list with icons and reading time
- **CommunityScreen** — feed with like / comment / share actions
- **LoginScreen** — JWT auth

Mock data backs every screen, so the app stays demoable even when the API isn't reachable.
