import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
}

export const useThemeStore = defineStore("theme", {
  state: (): ThemeState => ({
    theme: "light",
  }),

  actions: {

    initializeTheme(): void {
      const savedTheme = localStorage.getItem("fluxbooks-theme");

      if (savedTheme === "light" || savedTheme === "dark") {
        this.theme = savedTheme;
      }

      document.documentElement.classList.toggle("dark", this.theme === "dark");
    },

    toggleTheme(): void {
      this.theme = this.theme === "light" ? "dark" : "light";

      localStorage.setItem("fluxbooks-theme", this.theme);

      document.documentElement.classList.toggle("dark", this.theme === "dark");
    },
  },
});
