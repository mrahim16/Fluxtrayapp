import { THEME_TOKENS } from "./tokens";

export const themeClasses = {
  page: `
    ${THEME_TOKENS.layout.background}
    ${THEME_TOKENS.layout.text}
  `,

  sidebar: `
    ${THEME_TOKENS.sidebar.background}
    ${THEME_TOKENS.sidebar.border}
  `,

  card: THEME_TOKENS.card.background,

  primaryButton: THEME_TOKENS.button.primary,

  dangerButton: THEME_TOKENS.button.danger,
};
