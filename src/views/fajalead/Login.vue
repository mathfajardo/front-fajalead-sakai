<script setup>
import { ref } from "vue";

const checked = ref(false);

// fajalead
import axiosInstance from "@/services/http";
import { useAuth } from "@/stores/auth";
import { useToast } from "primevue";
import { reactive } from "vue";
import { useRouter } from "vue-router";

const auth = useAuth();
const router = useRouter();
const toast = useToast();

// variavel de carregamentos
let loading = ref(false);

const user = reactive({
    email: "",
    password: "",
});

async function login() {
    loading.value = true;
    console.log("user:", user);

    axiosInstance
        .post("/login", user)
        .then((response) => {
            console.log(response);
            auth.setToken(response.data.data.token);
            router.push("/");
        })
        .catch((error) => {
            toast.add({
                severity: "error",
                summary: "Erro",
                detail: "Erro de autenticação, tente novamente!",
                life: 3000,
            });
            console.log("erro: ", error);
        })
        .finally(() => {
            loading.value = false;
        });
}
</script>

<template>
    <!-- <FloatingConfigurator /> -->
    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
    >
        <div class="flex flex-col items-center justify-center">
            <div
                style="
                    border-radius: 56px;
                    padding: 0.3rem;
                    background: linear-gradient(
                        180deg,
                        var(--primary-color) 10%,
                        rgba(33, 150, 243, 0) 30%
                    );
                "
            >
                <div
                    class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
                    style="border-radius: 53px"
                >
                    <div class="text-center mb-8">
                        <div
                            class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
                        >
                            Bem vindo!
                        </div>
                        <span class="text-muted-color font-medium"
                            >Faça seu login</span
                        >
                    </div>

                    <div @keyup.enter="login">
                        <label
                            for="email1"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
                            >Email</label
                        >
                        <InputText
                            id="email1"
                            type="text"
                            placeholder="Digite seu email..."
                            class="w-full md:w-[30rem] mb-8"
                            v-model="user.email"
                        />

                        <label
                            for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
                            >Senha</label
                        >
                        <Password
                            id="password1"
                            v-model="user.password"
                            placeholder="Digite sua senha..."
                            :toggleMask="true"
                            class="mb-4"
                            fluid
                            :feedback="false"
                        ></Password>

                        <div
                            class="flex items-center justify-between mt-2 mb-8 gap-8"
                        >
                            <div class="flex items-center">
                                <!-- <Checkbox
                                    v-model="checked"
                                    id="rememberme1"
                                    binary
                                    class="mr-2"
                                ></Checkbox>
                                <label for="rememberme1">Lembrar</label> -->
                            </div>
                        </div>
                        <Button
                            class="w-full"
                            as="router-link"
                            @click="login"
                            to="/"
                        >
                            <span v-if="loading" class="animate-spin"><i class="pi pi-spin pi-spinner"></i></span>Entrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
