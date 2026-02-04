<script setup>
import axiosInstance from "@/services/http";
import { useToast } from "primevue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

// carregamento
let carregamento = ref(true);

// toast
const toast = useToast();

// iniciando array dos leads
let leads = ref([]);
let leadsOriginal = ref([]);
let termoPesquisa = ref([]);

const router = useRouter();

// pesquissa
function pesquisar() {
    if (!termoPesquisa.value.trim()) {
        leads.value = leadsOriginal.value;
        return;
    }

    const termo = termoPesquisa.value.toLowerCase();
    leads.value = leadsOriginal.value.filter(lead =>
        lead.nome.toLowerCase().includes(termo) ||
        lead.numero?.toLowerCase().includes(termo)
    );

    // termoPesquisa.value = '';
}

// Controlar quantos leads mostrar por status
let leadsVisiveisPorStatus = ref({
    "Novo": 3,
    "Em atendimento": 3,
    "Perdido": 3,
    "Convertido": 3,
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
            leadsOriginal.value = response.data.data;
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

// Opções para o dropdown de status no diálogo
const opcoesStatus = ref([
    { label: "Novo", value: "Novo" },
    { label: "Em atendimento", value: "Em atendimento" },
    { label: "Perdido", value: "Perdido" },
    { label: "Convertido", value: "Convertido" },
]);

// Controle para dropdown visível por lead
const dropdownVisivel = ref({});

// Função para alternar dropdown
const toggleDropdown = (leadId) => {
    dropdownVisivel.value[leadId] = !dropdownVisivel.value[leadId];
};

// Função para fechar todos os dropdowns
const fecharDropdowns = () => {
    dropdownVisivel.value = {};
};

// Função para abrir modal com detalhes do lead
const abrirDetalhesLead = (lead) => {
    leadSelecionado.value = { ...lead };
    modalVisivel.value = true;
    fecharDropdowns(); // Fecha dropdowns quando abre modal
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

    // expressão regular para pegar só os números
    leadSelecionado.value.numero = leadSelecionado.value.numero.replace(
        /\D/g,
        "",
    );



    axiosInstance
        .put("/leads/" + leadSelecionado.value.id, leadSelecionado.value)
        .then((response) => {
            if (index !== -1) {
                leads.value[index] = { ...leadSelecionado.value };
            }
            fecharModal();
            toast.add({
                severity: "success",
                summary: "Sucesso",
                detail: response.data.message,
                life: 3000,
            });
            // caso o status seja para convertido, já envia para cadastro
            if (leadSelecionado.value.status == "Convertido") {
                router.push(`/clientecadastro/${leadSelecionado.value.id}`);
                return;
            }
        })
        .catch((error) => {
            console.error("Erro: ", error);
            toast.add({
                severity: "error",
                summary: "Erro",
                detail: error.data.message,
                life: 3000,
            });
        });
}

// Função para mover lead entre colunas
function moverLead(leadId, novoStatus, event) {
    fecharDropdowns();
    if (event) event.stopPropagation();

    const index = leads.value.findIndex((l) => l.id === leadId);
    const lead = leads.value[index];

    lead.status = novoStatus;

    axiosInstance
        .put("/leads/" + leadId, lead)
        .then((response) => {
            leads.value[index] = { ...lead };
            fecharDropdowns();
            // caso o status seja para convertido, já envia para cadastro
            toast.add({
                severity: "success",
                summary: "Sucesso",
                detail: response.data.message,
                life: 3000,
            });
            if (novoStatus == "Convertido") {
                router.push(`/fajalead/clientesCadastroLeads/${leadId}`);
                return;
            }
        })
        .catch((error) => {
            console.error("Erro: ", error);
            toast.add({
                severity: "error",
                summary: "Erro",
                detail: error.data.message,
                life: 3000,
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
    "Novo": "Novos",
    "Em atendimento": "Em Atendimento",
    "Perdido": "Perdidos",
    Convertido: "Convertidos",
};

// Cores para cada status
const coresStatus = {
    "Novo": "bg-blue-400",
    "Em atendimento": "bg-yellow-400",
    "Perdido": "bg-red-400",
    "Convertido": "bg-green-400",
};

</script>

<template>
    <!-- tela de carregamento -->
    <div class="flex flex-col justify-center items-center h-screen" v-if="carregamento">
        <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div class="container mx-auto px-4" v-if="!carregamento">
        <!-- Cabeçalho -->
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                Quadro de Leads
            </h1>
            <!-- <RouterLink
                to="/"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200"
            >
                <i class="pi pi-plus-circle"></i> Adicionar Lead
            </RouterLink> -->
            <IconField>
                <InputIcon>
                    <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="termoPesquisa" placeholder="Pesquisar..." @keyup.enter="pesquisar" />
            </IconField>
        </div>

        <!-- Quadro Kanban -->
        <div class="kanban-board">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Coluna para cada status -->
                <div v-for="status in statusDisponiveis" :key="status" class="flex flex-col h-full">
                    <div class="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                        <!-- Cabeçalho da coluna -->
                        <div class="px-4 py-3 rounded-t-lg text-white" :class="coresStatus[status]">
                            <div class="flex justify-between items-center">
                                <h5 class="font-semibold text-lg">
                                    {{ nomesStatus[status] }}
                                    <span
                                        class="bg-white text-gray-800 text-sm font-medium ml-2 px-2 py-0.5 rounded-full">
                                        {{ leadsPorStatus[status].length }}
                                    </span>
                                </h5>
                                <i v-if="status == 'Novo'" class="pi pi-question-circle"
                                    v-tooltip="'Aqui são os novos leads'"></i>
                                <i v-if="status == 'Em atendimento'" class="pi pi-question-circle"
                                    v-tooltip="'Aqui são os leads em atendimento (a IA não responde)'"></i>
                                <i v-if="status == 'Perdido'" class="pi pi-question-circle"
                                    v-tooltip="'Aqui são os leads perdidos'"></i>
                                <i v-if="status == 'Convertido'" class="pi pi-question-circle"
                                    v-tooltip="'Aqui são os leads convertidos'"></i>
                            </div>
                        </div>

                        <!-- Lista de leads da coluna -->
                        <div class="p-3 flex-1 overflow-y-auto min-h-[400px]">
                            <!-- Cards visíveis -->
                            <div v-for="(lead, index) in leadsPorStatus[
                                status
                            ].slice(0, leadsVisiveisPorStatus[status])" :key="lead.id"
                                class="mb-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
                                @click="abrirDetalhesLead(lead)">
                                <div
                                    class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div class="p-4">
                                        <div class="flex items-start">
                                            <div class="flex-1 min-w-0">
                                                <h6 class="font-medium text-gray-900 mb-1 truncate">
                                                    {{ lead.nome }}
                                                </h6>
                                                <p class="text-gray-600 text-sm mb-2 flex items-center">
                                                    <i class="pi pi-phone mr-2"></i>{{ lead.numero }}
                                                </p>
                                                <small class="text-gray-500 text-xs flex items-center">
                                                    <i class="pi pi-clock mr-1"></i>{{ lead.updated_at }}
                                                </small>
                                            </div>
                                            <div class="flex items-center gap-2 ml-2">
                                                <a :href="`https://wa.me/55${lead.numero.replace(/\D/g, '')}`"
                                                    target="_blank" @click.stop
                                                    class="text-green-600 hover:text-green-700">
                                                    <i class="pi pi-whatsapp text-lg"></i>
                                                </a>
                                                <div class="relative" v-if="lead.status != 'Convertido'">
                                                    <button class="text-gray-400 hover:text-gray-600 p-1" type="button"
                                                        @click.stop="
                                                            toggleDropdown(
                                                                lead.id,
                                                            )
                                                            " id="dropdownMenuButton">
                                                        <i class="pi pi-ellipsis-h text-lg"></i>
                                                    </button>
                                                    <div v-if="
                                                        dropdownVisivel[
                                                        lead.id
                                                        ]
                                                    " class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                                                        @click.stop>
                                                        <div class="py-1">
                                                            <a v-for="novoStatus in statusDisponiveis.filter(
                                                                (s) =>
                                                                    s !==
                                                                    status,
                                                            )" :key="novoStatus
                                                                "
                                                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                                @click="
                                                                    moverLead(
                                                                        lead.id,
                                                                        novoStatus,
                                                                        $event,
                                                                    )
                                                                    ">
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
                            <div v-if="temMaisLeads(status)" class="text-center mt-3">
                                <button @click="mostrarMais(status)"
                                    class="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg text-sm transition duration-200 flex items-center justify-center mx-auto">
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

    <!-- Diálogo para editar lead -->
    <Dialog v-model:visible="modalVisivel" :style="{ width: '450px' }" header="Detalhes do Lead" :modal="true"
        @hide="fecharModal">
        <div class="flex flex-col gap-6" v-if="leadSelecionado">
            <div>
                <label for="nome" class="block font-bold mb-3">Nome</label>
                <InputText id="nome" v-model.trim="leadSelecionado.nome" required="true" autofocus fluid />
            </div>
            <div>
                <label for="numero" class="block font-bold mb-3">Número</label>
                <InputText id="numero" v-model.trim="leadSelecionado.numero" required="true" fluid />
            </div>
            <div>
                <label for="observacao" class="block font-bold mb-3">Observação</label>
                <Textarea id="observacao" v-model="leadSelecionado.observacao" rows="3" cols="20" fluid />
            </div>
            <div>
                <label for="status" class="block font-bold mb-3">Status</label>
                <Select id="status" v-model="leadSelecionado.status" :options="opcoesStatus" optionLabel="label"
                    optionValue="value" placeholder="Selecione um Status" fluid
                    :disabled="leadSelecionado.status == 'Convertido'"></Select>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="fecharModal" />
            <Button label="Salvar" icon="pi pi-check" @click="salvarLead" />
        </template>
    </Dialog>
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
