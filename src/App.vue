<script setup>
import { useLayout } from "@/layout/composables/layout";
import Toast from "primevue/toast";
import { onMounted } from "vue";

const { initializeTheme } = useLayout();

onMounted(() => {
    initializeTheme();
});
</script>

<template>
    <Toast />
    <router-view />
</template>

<style scoped></style>
