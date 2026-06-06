export const UI_COPY = {
  appName: "CMS Manglaria",
  appDescription: "Panel de administración de contenidos",
  nav: {
    dashboard: "Panel",
    blogs: "Blogs",
    projects: "Proyectos",
    scheduled: "Programados",
    editor: "Editor",
    users: "Usuarios",
    legal: "Documentos legales",
    createContent: "Crear contenido",
  },
  actions: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    search: "Buscar",
    previous: "Anterior",
    next: "Siguiente",
    logout: "Cerrar sesión",
    theme: "Tema",
  },
  pagination: {
    showing: "Mostrando",
    of: "de",
    results: "resultados",
  },
  errors: {
    generic: "Ocurrió un error. Intenta nuevamente.",
    unauthorized: "Acceso no autorizado. Inicia sesión nuevamente.",
    invalidCredentials: "Credenciales inválidas. Intenta nuevamente.",
  },
  success: {
    saved: "Guardado correctamente",
    deleted: "Eliminado correctamente",
    updated: "Actualizado correctamente",
  },
} as const;

export const ROUTE_LABELS: Record<string, string> = {
  dashboard: UI_COPY.nav.dashboard,
  blogs: UI_COPY.nav.blogs,
  projects: UI_COPY.nav.projects,
  scheduled: UI_COPY.nav.scheduled,
  editor: UI_COPY.nav.editor,
  users: UI_COPY.nav.users,
  "legal-documents": UI_COPY.nav.legal,
};
