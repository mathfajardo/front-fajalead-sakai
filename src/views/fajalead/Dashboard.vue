<script setup>
import RevenueStreamWidget from "@/components/dashboard/RevenueStreamWidget.vue";

import axiosInstance from "@/services/http";
import { onMounted, ref } from "vue";

const carregamento = ref(true);

// variavel para armazenar os dados
let totalLeadsMes = ref(0);
let totalClientesMes = ref(0);
let totalClientes = ref(0);
let totalLeadsMesTodos = ref([]);

onMounted(() => {
    Promise.all([
        axiosInstance.get("/leadsMes"),
        axiosInstance.get("/clientesMes"),
        axiosInstance.get("/clientesTotal"),
        axiosInstance.get("/leadsMesTodos"),
    ])
        .then((responses) => {
            totalLeadsMes.value = responses[0].data.data.total;
            totalClientesMes.value = responses[1].data.data.total;
            totalClientes.value = responses[2].data.data.total;

            const meses = responses[3].data.data[0];
            totalLeadsMesTodos.value = Object.values(meses);
            histogramData.value.datasets[0].data = totalLeadsMesTodos.value;
        })
        .catch((error) => {
            console.log("Erro: ", error);
        })
        .finally(() => {
            carregamento.value = false;
            createHistogram();
        });
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4"
                            >Leads no mês</span
                        >
                        <div
                            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
                        >
                            {{ totalLeadsMes }}
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem"
                    >
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4"
                            >Clientes no mês</span
                        >
                        <div
                            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
                        >
                            {{ totalClientesMes }}
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem"
                    >
                        <i class="pi pi-briefcase text-green-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4"
                            >Clientes no total</span
                        >
                        <div
                            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
                        >
                            {{ totalClientes }}
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem"
                    >
                        <i class="pi pi-id-card text-purple-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
        </div>
    </div>
</template>
