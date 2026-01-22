import AppLayout from "@/layout/AppLayout.vue";
import { useAuth } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: AppLayout,
            children: [
                {
                    path: "/",
                    name: "dashboard",
                    component: () => import("@/views/fajalead/Dashboard.vue"),
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: "/fajalead/leads",
                    name: "leads",
                    component: () => import("@/views/fajalead/Lead.vue"),
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: "/fajalead/clientes",
                    name: "clientes",
                    component: () => import("@/views/fajalead/Clientes.vue"),
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: "/fajalead/clientesCadastro",
                    name: "clientescadastro",
                    component: () =>
                        import("@/views/fajalead/ClientesCadastro.vue"),
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: "/fajalead/usuarios",
                    name: "usuarios",
                    component: () => import("@/views/fajalead/Usuarios.vue"),
                    meta: {
                        auth: true,
                    },
                },
            ],
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/fajalead/Login.vue"),
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    if (to.meta?.auth) {
        const auth = useAuth();
        if (auth.token) {
            try {
                const autenticado = await auth.checkToken();
                if (autenticado) {
                    next();
                } else {
                    next({ name: "login" });
                }
            } catch (error) {
                next({ name: "login" });
            }
        } else {
            next({ name: "login" });
        }
    } else {
        next();
    }
});

export default router;
