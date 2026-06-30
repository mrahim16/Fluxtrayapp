import { createRouter, createWebHashHistory } from "vue-router";

import LoginView from "@/domains/auth/presentation/views/LoginView.vue";
import DashboardView from "@/domains/dashboard/presentation/views/DashboardView.vue";
import AutomationView from "@/domains/automation/presentation/views/AutomationView.vue";
import BillingView from "@/domains/billing/presentation/views/BillingView.vue";
import MainLayout from "@/shared/layouts/MainLayout.vue";

export const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: "/",
      redirect: () => {
        const authData = localStorage.getItem("fluxbooks-auth");

        return authData === "true" ? "/dashboard" : "/login";
      },
    },

    {
      path: "/login",
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/",
      component: MainLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "dashboard",
          component: DashboardView,
        },

        {
          path: "automation",
          component: AutomationView,
        },

        {
          path: "billing",
          component: BillingView,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const authData = localStorage.getItem("fluxbooks-auth");

  console.log("ROUTER GUARD");
  console.log("Route:", to.path);
  console.log("Auth:", authData);

  const hasSession = authData === "true";

  if (to.meta.requiresAuth && !hasSession) {
    console.log("Redirect -> login");
    return "/login";
  }

  if (to.meta.guestOnly && hasSession) {
    console.log("Redirect -> dashboard");
    return "/dashboard";
  }

  return true;
});
