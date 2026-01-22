<script setup>
import axiosInstance from "@/services/http";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

// carregamento
let carregamento = ref(true);

// iniciando array dos leads
let leads = ref([]);

const router = useRouter();

// Controlar quantos leads mostrar por status
let leadsVisiveisPorStatus = ref({
    Novo: 3,
    "Em atendimento": 3,
    Perdido: 3,
    Convertido: 3,
});

// Função para mostrar mais leads
const mostrarMais = (status) => {
    leadsVisiveisPorStatus.value[status] += 4;
};

// Função para verificar se há mais leads para mostrar
const temMaisLeads = (status) => {
    const totalLeads = leadsPorStatus.value[status].length;
    const visiveis = leadsVisiveisPorStatus.value[status];
    return visiveis < totalLeads;
};

// carregando os leads
onMounted(() => {
    axiosInstance
        .get("/leads/")
        .then((response) => {
            leads.value = response.data.data;
            console.log("leads: ", leads.value[1]);
            carregamento.value = false;
            console.log(leads.value);
        })
        .catch((error) => {
            console.log("Erro: ", error);
            carregamento.value = false;
        });
});

// Lead selecionado para detalhes
const leadSelecionado = ref(null);
const modalVisivel = ref(false);

// Status disponíveis
const statusDisponiveis = ["Novo", "Em atendimento", "Perdido", "Convertido"];

// Função para abrir modal com detalhes do lead
const abrirDetalhesLead = (lead) => {
    leadSelecionado.value = { ...lead };
    modalVisivel.value = true;
};

// Função para fechar modal
const fecharModal = () => {
    modalVisivel.value = false;
    leadSelecionado.value = null;
};

// Função para salvar alterações do lead
function salvarLead() {
    const index = leads.value.findIndex(
        (l) => l.id === leadSelecionado.value.id,
    );

    // expressão regular para pegar so os numeros
    leadSelecionado.value.numero = leadSelecionado.value.numero.replace(
        /\D/g,
        "",
    );

    // caso o status seja para convertido, ja envia para cadastro
    if (leadSelecionado.value.status == "Convertido") {
        router.push(`/clientecadastro/${leadSelecionado.value.id}`);
    }

    axiosInstance
        .put("/leads/" + leadSelecionado.value.id, leadSelecionado.value)
        .then((response) => {
            Swal.fire({
                position: "top-end",
                title: response.data.message,
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            if (index !== -1) {
                leads.value[index] = { ...leadSelecionado.value };
            }
            fecharModal();
        })
        .catch((error) => {
            console.error("Erro: ", error);
            Swal.fire({
                title: "erro ao atualizar",
                text: "favor entrar em contato com o admin do sistema",
                icon: "error",
                confirmButtonText: "Ok",
            });
        });
}

// Função para mover lead entre colunas
function moverLead(leadId, novoStatus) {
    const index = leads.value.findIndex((l) => l.id === leadId);
    const lead = leads.value[index];

    lead.status = novoStatus;

    // caso o status seja para convertido, ja envia para cadastro
    if (novoStatus == "Convertido") {
        router.push(`/clientecadastro/${leadId}`);
    }

    axiosInstance
        .put("/leads/" + leadId, lead)
        .then((response) => {
            Swal.fire({
                position: "top-end",
                title: response.data.message,
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            leads.value[index] = { ...lead };
            fecharModal();
        })
        .catch((error) => {
            console.error("Erro: ", error);
            Swal.fire({
                title: "erro ao atualizar",
                text: "favor entrar em contato com o admin do sistema",
                icon: "error",
                confirmButtonText: "Ok",
            });
        });
}

// Computed para organizar leads por status
const leadsPorStatus = computed(() => {
    const organizado = {};
    statusDisponiveis.forEach((status) => {
        organizado[status] = leads.value.filter(
            (lead) => lead.status === status,
        );
    });
    return organizado;
});

// Nomes amigáveis para os status
const nomesStatus = {
    Novo: "Novos",
    "Em atendimento": "Em Atendimento",
    Perdido: "Perdidos",
    Convertido: "Convertidos",
};

// Cores para cada status
const coresStatus = {
    Novo: "bg-blue-600",
    "Em atendimento": "bg-yellow-500",
    Perdido: "bg-red-600",
    Convertido: "bg-green-600",
};
</script>

<template>
    <!-- tela de carregamento -->
    <div
        class="flex flex-col justify-center items-center h-screen"
        v-if="carregamento"
    >
        <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
        <span class="mt-4 text-gray-600">Aguarde...</span>
    </div>

    <div class="container mx-auto px-4" v-if="!carregamento">
        <!-- Cabeçalho -->
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                Quadro de Leads
            </h1>
            <RouterLink
                to="/leadcadastro"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200"
            >
                <i class="pi pi-plus-circle"></i> Adicionar Lead
            </RouterLink>
        </div>

        <!-- Quadro Kanban -->
        <div class="kanban-board">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Coluna para cada status -->
                <div
                    v-for="status in statusDisponiveis"
                    :key="status"
                    class="flex flex-col h-full"
                >
                    <div
                        class="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden"
                    >
                        <!-- Cabeçalho da coluna -->
                        <div
                            class="px-4 py-3 rounded-t-lg text-white"
                            :class="coresStatus[status]"
                        >
                            <div class="flex justify-between items-center">
                                <h5 class="font-semibold text-lg">
                                    {{ nomesStatus[status] }}
                                    <span
                                        class="bg-white text-gray-800 text-sm font-medium ml-2 px-2 py-0.5 rounded-full"
                                    >
                                        {{ leadsPorStatus[status].length }}
                                    </span>
                                    <button
                                        v-if="status == 'Novo'"
                                        v-tippy="
                                            'Aqui vão aparecer os leads novos'
                                        "
                                        class="text-white hover:text-gray-200"
                                    >
                                        <i
                                            class="bi bi-question-circle ml-1"
                                        ></i>
                                    </button>
                                    <button
                                        v-if="status == 'Em atendimento'"
                                        v-tippy="
                                            'Aqui vão aparecer os leads em atendimento, leads que estão aqui o bot não responde!!'
                                        "
                                        class="text-white hover:text-gray-200"
                                    >
                                        <i
                                            class="bi bi-question-circle ml-1"
                                        ></i>
                                    </button>
                                    <button
                                        v-if="status == 'Perdido'"
                                        v-tippy="
                                            'Aqui vão aparecer os leads perdidos'
                                        "
                                        class="text-white hover:text-gray-200"
                                    >
                                        <i
                                            class="bi bi-question-circle ml-1"
                                        ></i>
                                    </button>
                                    <button
                                        v-if="status == 'Convertido'"
                                        v-tippy="
                                            'Aqui vão aparecer os leads convertidos'
                                        "
                                        class="text-white hover:text-gray-200"
                                    >
                                        <i
                                            class="bi bi-question-circle ml-1"
                                        ></i>
                                    </button>
                                </h5>
                            </div>
                        </div>

                        <!-- Lista de leads da coluna -->
                        <div class="p-3 flex-1 overflow-y-auto min-h-[400px]">
                            <!-- Cards visíveis -->
                            <div
                                v-for="(lead, index) in leadsPorStatus[
                                    status
                                ].slice(0, leadsVisiveisPorStatus[status])"
                                :key="lead.id"
                                class="mb-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
                                @click="abrirDetalhesLead(lead)"
                            >
                                <div
                                    class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div class="p-4">
                                        <div class="flex items-start">
                                            <div class="flex-1 min-w-0">
                                                <h6
                                                    class="font-medium text-gray-900 mb-1 truncate"
                                                >
                                                    {{ lead.nome }}
                                                </h6>
                                                <p
                                                    class="text-gray-600 text-sm mb-2 flex items-center"
                                                >
                                                    <i
                                                        class="pi pi-phone mr-2"
                                                    ></i
                                                    >{{ lead.numero }}
                                                </p>
                                                <small
                                                    class="text-gray-500 text-xs flex items-center"
                                                >
                                                    <i
                                                        class="pi pi-clock mr-1"
                                                    ></i
                                                    >{{ lead.updated_at }}
                                                </small>
                                            </div>
                                            <div
                                                class="flex items-center gap-2 ml-2"
                                            >
                                                <a
                                                    :href="`https://wa.me/55${lead.numero}`"
                                                    target="_blank"
                                                    @click.stop
                                                    class="text-green-600 hover:text-green-700"
                                                >
                                                    <i
                                                        class="pi pi-whatsapp text-lg"
                                                    ></i>
                                                </a>
                                                <div class="relative">
                                                    <button
                                                        class="text-gray-400 hover:text-gray-600 p-1"
                                                        type="button"
                                                        @click.stop
                                                        id="dropdownMenuButton"
                                                    >
                                                        <i
                                                            class="pi pi-ellipsis-h text-lg"
                                                        ></i>
                                                    </button>
                                                    <div
                                                        class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden border border-gray-200"
                                                        @click.stop
                                                    >
                                                        <div class="py-1">
                                                            <a
                                                                v-for="novoStatus in statusDisponiveis.filter(
                                                                    (s) =>
                                                                        s !==
                                                                        status,
                                                                )"
                                                                :key="
                                                                    novoStatus
                                                                "
                                                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                                @click="
                                                                    moverLead(
                                                                        lead.id,
                                                                        novoStatus,
                                                                    )
                                                                "
                                                            >
                                                                Mover para
                                                                {{
                                                                    nomesStatus[
                                                                        novoStatus
                                                                    ]
                                                                }}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Botão "Ver Mais" -->
                            <div
                                v-if="temMaisLeads(status)"
                                class="text-center mt-3"
                            >
                                <button
                                    @click="mostrarMais(status)"
                                    class="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg text-sm transition duration-200 flex items-center justify-center mx-auto"
                                >
                                    <i class="bi bi-chevron-down mr-1"></i>
                                    Ver Mais ({{
                                        leadsPorStatus[status].length -
                                        leadsVisiveisPorStatus[status]
                                    }}
                                    restantes)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de detalhes do lead -->
    <div v-if="modalVisivel" class="fixed inset-0 z-50 overflow-y-auto">
        <div
            class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
            <!-- Overlay do modal -->
            <div
                class="fixed inset-0 transition-opacity"
                aria-hidden="true"
                @click="fecharModal"
            >
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <!-- Conteúdo do modal -->
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
                <!-- Cabeçalho do modal -->
                <div class="bg-blue-600 px-6 py-4">
                    <div class="flex justify-between items-center">
                        <h5
                            class="text-lg font-semibold text-white flex items-center"
                        >
                            <i class="bi bi-person-circle mr-2"></i>Detalhes do
                            Lead
                        </h5>
                        <button
                            type="button"
                            class="text-white hover:text-gray-200"
                            @click="fecharModal"
                        >
                            <i class="bi bi-x-lg text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Corpo do modal -->
                <div class="px-6 py-4" v-if="leadSelecionado">
                    <div class="space-y-4">
                        <!-- Informações básicas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                    >Nome</label
                                >
                                <input
                                    type="text"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    v-model="leadSelecionado.nome"
                                />
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                    >Telefone</label
                                >
                                <input
                                    type="text"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    v-model="leadSelecionado.numero"
                                    v-mask="'(##) ####-####'"
                                />
                            </div>
                        </div>

                        <!-- Status -->
                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 mb-1"
                                >Status</label
                            >
                            <select
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                v-model="leadSelecionado.status"
                            >
                                <option
                                    v-for="status in statusDisponiveis"
                                    :key="status"
                                    :value="status"
                                >
                                    {{ nomesStatus[status] }}
                                </option>
                            </select>
                        </div>

                        <!-- Observações -->
                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 mb-1"
                                >Observações</label
                            >
                            <textarea
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="4"
                                v-model="leadSelecionado.observacoes"
                                placeholder="Adicione observações sobre o lead..."
                            ></textarea>
                        </div>

                        <!-- Informações adicionais -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h6 class="text-sm font-medium text-gray-700 mb-2">
                                Informações Adicionais
                            </h6>
                            <div
                                class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
                            >
                                <div class="flex items-center text-gray-600">
                                    <i class="bi bi-calendar mr-2"></i>
                                    <span
                                        >Data de criação:
                                        {{ leadSelecionado.created_at }}</span
                                    >
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <i class="bi bi-arrow-clockwise mr-2"></i>
                                    <span
                                        >Última atualização:
                                        {{ leadSelecionado.updated_at }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rodapé do modal -->
                <div
                    class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3"
                >
                    <button
                        type="button"
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                        @click="fecharModal"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                        @click="salvarLead"
                    >
                        <i class="bi bi-save"></i>Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos para o dropdown */
.relative:hover .hidden {
    display: block;
}

/* Estilos personalizados para o modal */
.fixed {
    position: fixed;
}

.z-50 {
    z-index: 50;
}

/* Animações */
.transform {
    transition-property: transform;
}

.transition-all {
    transition-property: all;
}

.duration-200 {
    transition-duration: 200ms;
}

/* Scrollbar personalizada */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
