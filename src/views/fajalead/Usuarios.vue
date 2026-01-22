<script setup>
import axiosInstance from "@/services/http";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";

// fajalead
let usuarios = ref([]);

onMounted(() => {
    axiosInstance
        .get("/user/")
        .then((response) => {
            usuarios.value = response.data.data;
        })
        .catch((error) => {
            console.error("Erro: ", error);
        });
});

const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const statuses = ref([
    { label: "INSTOCK", value: "instock" },
    { label: "LOWSTOCK", value: "lowstock" },
    { label: "OUTOFSTOCK", value: "outofstock" },
]);

// função para formatar valor
function formatarValor(valor) {
    if (!valor) return "R$ 0,00";

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function openNew() {}

function hideDialog() {
    productDialog.value = false;
    submitted.value = false;
}

function saveProduct() {
    submitted.value = true;

    if (product?.value.name?.trim()) {
        if (product.value.id) {
            product.value.inventoryStatus = product.value.inventoryStatus.value
                ? product.value.inventoryStatus.value
                : product.value.inventoryStatus;
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({
                severity: "success",
                summary: "Successful",
                detail: "Product Updated",
                life: 3000,
            });
        } else {
            product.value.id = createId();
            product.value.code = createId();
            product.value.image = "product-placeholder.svg";
            product.value.inventoryStatus = product.value.inventoryStatus
                ? product.value.inventoryStatus.value
                : "INSTOCK";
            products.value.push(product.value);
            toast.add({
                severity: "success",
                summary: "Successful",
                detail: "Product Created",
                life: 3000,
            });
        }

        productDialog.value = false;
        product.value = {};
    }
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
}

function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function deleteProduct() {
    axiosInstance
        .delete(`/clientes/${product.value.id}`)
        .then((response) => {
            clientes.value = clientes.value.filter(
                (c) => c.id !== product.value.id,
            );

            deleteProductDialog.value = false;
            product.value = {};

            toast.add({
                severity: "success",
                summary: "Sucesso",
                detail: response.data.data,
                life: 3000,
            });
        })
        .catch((error) => {
            console.error("Erro: ", error);
            toast.add({
                severity: "error",
                summary: "Erro",
                detail: "Cliente não foi deletado",
                life: 3000,
            });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

function createId() {
    let id = "";
    var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function deleteSelectedProducts() {
    products.value = products.value.filter(
        (val) => !selectedProducts.value.includes(val),
    );
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Products Deleted",
        life: 3000,
    });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <!-- <Button
                        label="Novo"
                        icon="pi pi-plus"
                        severity="secondary"
                        class="mr-2"
                        @click="$router.push('/fajalead/clientesCadastro')"
                    />
                    <Button
                        label="Deletar"
                        icon="pi pi-trash"
                        severity="secondary"
                        @click="confirmDeleteSelected"
                        :disabled="
                            !selectedProducts || !selectedProducts.length
                        "
                    /> -->
                </template>

                <template #end>
                    <Button
                        label="Exportar"
                        icon="pi pi-upload"
                        severity="secondary"
                        @click="exportCSV($event)"
                    />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="usuarios"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div
                        class="flex flex-wrap gap-2 items-center justify-between"
                    >
                        <h4 class="m-0">Usuarios</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText
                                v-model="filters['global'].value"
                                placeholder="Pesquisar..."
                            />
                        </IconField>
                    </div>
                </template>

                <Column
                    field="name"
                    header="Nome do usuario"
                    sortable
                    style="min-width: 12rem"
                ></Column>
                <Column
                    field="email"
                    header="Email"
                    sortable
                    style="min-width: 16rem"
                ></Column>
                <Column
                    field="created_at"
                    header="Data de criação"
                    sortable
                    style="min-width: 10rem"
                ></Column>
                <Column
                    field="updated_at"
                    header="Ultima atualização"
                    sortable
                    style="min-width: 10rem"
                >
                </Column>
                <!-- <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button
                            icon="pi pi-pencil"
                            outlined
                            rounded
                            class="mr-2"
                            @click="editProduct(slotProps.data)"
                        />
                        <Button
                            icon="pi pi-trash"
                            outlined
                            rounded
                            severity="danger"
                            @click="confirmDeleteProduct(slotProps.data)"
                        />
                    </template>
                </Column> -->
            </DataTable>
        </div>

        <Dialog
            v-model:visible="deleteProductDialog"
            :style="{ width: '450px' }"
            header="Confirmação"
            :modal="true"
        >
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="clientes">Tem certeza que deseja deletar?</span>
            </div>
            <template #footer>
                <Button
                    label="Não"
                    icon="pi pi-times"
                    text
                    @click="deleteProductDialog = false"
                />
                <Button label="Sim" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="deleteProductsDialog"
            :style="{ width: '450px' }"
            header="Confirm"
            :modal="true"
        >
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="product"
                    >Are you sure you want to delete the selected
                    products?</span
                >
            </div>
            <template #footer>
                <Button
                    label="No"
                    icon="pi pi-times"
                    text
                    @click="deleteProductsDialog = false"
                />
                <Button
                    label="Yes"
                    icon="pi pi-check"
                    text
                    @click="deleteSelectedProducts"
                />
            </template>
        </Dialog>
    </div>
</template>
