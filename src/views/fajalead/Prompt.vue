<script setup>
import axiosInstance from "@/services/http";
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

// inicianco router
const router = useRouter();

let mensagem = ref([]);

// variavel de loading
let loading = ref(false);

const toast = useToast();

// objeto para ser enviado no post
let obj = ref({
    id: null,
    mensagem: "",
    created_at: "",
    updated_at: ""
});

// 

onMounted(() => {
    axiosInstance
        .get("/prompt")
        .then((response) => {
            mensagem.value = response.data.data;
            console.log("Mensagem:", mensagem.value[0].mensagem)

            obj.value.id = mensagem.value[0].id;
            obj.value.mensagem = mensagem.value[0].mensagem;
        })
        .catch((error) => {
            console.error("Erro: ", error);
        });
});

function atualizar_mensagem() {
    loading.value = true;

    axiosInstance
        .put(`/prompt/${obj.value.id}`, obj.value)
        .then((response) => {
            toast.add({
                severity: "success",
                summary: "Sucesso",
                detail: response.data.message,
                life: 3000,
            });
        })
        .catch((error) => {
            console.error("Erro: ", error);
            toast.add({
                severity: "error",
                summary: "Erro",
                detail: "Erro na validação",
                life: 3000,
            });
        });
}
</script>

<template>
    <Fluid>
        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
                <div class="flex flex-wrap">
                    <label for="address">Prompt da IA</label>
                    <Textarea
                        placeholder="Digite aqui o prompt..."
                        rows="30"
                        v-model="obj.mensagem"
                    />
                </div>

                <div class="flex flex-col md:flex-row gap-4">
                    <Button
                        label="Atualizar prompt"
                        @click="atualizar_mensagem()"
                    ></Button>
                </div>
            </div>
        </div>
    </Fluid>
</template>
