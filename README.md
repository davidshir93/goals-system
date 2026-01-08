# Goals System

A clean, modular React + TypeScript application for setting, managing, and tracking personal goals across yearly, quarterly, and weekly timeframes. The app emphasizes visual progress tracking, identity-based reflection, and a well-structured planning workflow.

---

## ✨ Features

- 📅 Three core views: **Year**, **Quarter**, and **Week**
- 📈 Progress tracking linked across all levels
- 🧠 Identity and category tagging system
- 🔄 Real-time editing with autosave
- 🗂️ Modals for managing goal categories and personal identities
- 🔐 User authentication and cloud data sync (planned)
- 🧩 Modular architecture with scalable component structure

---

## 🧱 Tech Stack

| Tech               | Purpose                              |
| ------------------ | ------------------------------------ |
| React + TypeScript | Frontend architecture                |
| React Router DOM   | Navigation between Year/Quarter/Week |
| React Query        | Data fetching and caching            |
| React Hook Form    | Form handling                        |
| Zod / Yup          | Form validation (final choice TBD)   |
| Vite               | Build tool & dev server              |
| REST API           | Backend communication                |
| React Context      | Lightweight state management         |

---

## 🧭 Structure Overview

```plaintext
src/
├── components/         # Reusable UI components
├── features/           # Week/Quarter/Year-specific logic
├── forms/              # Form schemas and hook-form bindings
├── modals/             # Category and Identity modals
├── providers/          # Auth, data, and state context providers
├── routes/             # Route definitions and screen views
├── utils/              # Helper functions
├── types/              # Global TS types
└── App.tsx             # Root application setup
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
