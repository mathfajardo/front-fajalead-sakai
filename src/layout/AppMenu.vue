<script setup>
import { ref } from "vue";
import AppMenuItem from "./AppMenuItem.vue";

const model = ref([
    {
        label: "Home",
        items: [
            {
                label: "Dashboard",
                icon: "pi pi-fw pi-home",
                to: "/",
            },
        ],
    },
    {
        label: "Sistema",
        path: "/fajalead",
        items: [
            {
                label: "Leads",
                icon: "pi pi-fw pi-id-card",
                to: "/fajalead/leads",
            },
            {
                label: "Clientes",
                icon: "pi pi-fw pi-flag",
                to: "/fajalead/clientes",
            },
            {
                label: "Usuarios",
                icon: "pi pi-fw pi-users",
                to: "/fajalead/usuarios",
            },
            {
                label: "Chatbot - Prompt",
                icon: "pi pi-fw pi-send",
                to: "/fajalead/prompt",
            },
        ],
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item
                v-if="!item.separator"
                :item="item"
                :index="i"
            ></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
