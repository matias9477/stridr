# Stridr

Scaffolded with [create-mt-app](https://github.com/matias9477/create-mt-app).

## Stack

Expo (latest SDK) · Expo Router · NativeWind v4 · Drizzle + expo-sqlite · Zod v4 + react-hook-form · Zustand · i18next (en/es) · expo-widgets · RevenueCat · Biome · Jest

## Getting started

```bash
cp .env.example .env      # add RevenueCat keys
npm run ios               # native build (widget + purchases need a dev client, not Expo Go)
```

## Everyday commands

| Command | What it does |
|---|---|
| `npm start` | Metro dev server |
| `npm run ios` / `android` | Native build + run |
| `npm run db:generate` | Generate Drizzle migration after editing `src/db/schema.ts` |
| `npm test` | Jest (pure-logic tests) |
| `npm run lint:fix` | Biome lint + format |
| `npm run release` | Version bump → EAS build → TestFlight (expo-release) |

## Conventions

Read `CLAUDE.md` — it documents the architecture and every convention in this repo, for humans and AI assistants alike.
