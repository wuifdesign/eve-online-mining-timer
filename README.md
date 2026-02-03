# EVE Online - Mining Timer

## Status

[![release-version](https://img.shields.io/badge/v0.0.1-Live-success.svg)](https://wuifdesign.github.io/eve-online-mining-timer)

Monitor your mining lasers and strip miners to enhance your yield efficiency.

Keep a record of your ore yields, and share the information with your corporation or friends.

Utilize a feature to estimate mineral gains, considering actual ore mined and your skills.

Stay informed about the exact amount required to construct that titan.

## (Nov 2025) Catalyst Mining Update Overview

- Residue, crit bonus, cycles, and time display Low/Avg/High bands (mean ± 1σ).
- Cargo/sec and cargo full time also show Low/Avg/High bands, updated by ship settings.
- Residue chance, critical chance, and critical success bonus yield are entered directly.

Want to learn more about those changes? See https://www.eveonline.com/news/view/mining-in-focus-new-ore-and-more
or take a look at the wiki: https://wiki.eveuniversity.org/Mining

## How to Use (Updated)

1. Paste survey scanner results into the textarea to generate ore rows.
2. Set ship stats, residue chance, critical chance, and critical success bonus yield.
3. Use Play/Pause to track depletion timers and cargo usage.

Example scanner input:

```
Omber	30,000	18,000 m3	6,310,000.00 ISK	39 km
Omber II-Grade	30,000	18,000 m3	3,920,000.00 ISK	12 km
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
