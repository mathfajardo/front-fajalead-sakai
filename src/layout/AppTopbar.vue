<script setup>
import { useLayout } from "@/layout/composables/layout";

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

import { useAuth } from "@/stores/auth";
import { useToast } from "primevue";
import { useRouter } from "vue-router";

// função de logout
const toast = useToast();
const auth = useAuth();
const router = useRouter();

async function fazerLogout() {
    await auth.logout();
    router.push("/login");
}
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button
                class="layout-menu-button layout-topbar-action"
                @click="toggleMenu"
            >
                <i class="pi pi-bars"></i>
            </button>
            
            <router-link to="/" class="layout-topbar-logo pt-3">
                <img src="/favicon.ico" alt="" style="width: 7rem;">
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button
                    type="button"
                    class="layout-topbar-action"
                    @click="toggleDarkMode"
                >
                    <i
                        :class="[
                            'pi',
                            { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme },
                        ]"
                    ></i>
                </button>
            </div>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>

            <div class="layout-config-menu">
                <button
                    type="button"
                    class="layout-topbar-action"
                    @click="fazerLogout"
                >
                    <i class="pi pi-sign-out text-red-500"></i>
                </button>
            </div>
        </div>
    </div>
</template>
