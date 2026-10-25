/**
 * Tests cover pure logic only (zod schemas, src/lib helpers, services) —
 * no component snapshot tests. Keep it that way; UI is verified by hand.
 */
const expoPreset = require("jest-expo/jest-preset");

// Extend the preset's transform whitelist instead of hand-copying it —
// it changes between SDKs. These extra packages ship untranspiled ESM.
const [defaultIgnore, ...restIgnores] = expoPreset.transformIgnorePatterns;
const transformIgnorePatterns = [
  defaultIgnore.replace("))", "|drizzle-orm|date-fns|nativewind))"),
  ...restIgnores,
];

module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Mirror the tsconfig "@/*" path alias — jest doesn't read tsconfig paths.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // No native module on Node — Pulsar ships a no-op jest.fn() mock.
    "^react-native-pulsar$": "react-native-pulsar/jest-mock",
  },
  transformIgnorePatterns,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/__tests__/**"],
};
