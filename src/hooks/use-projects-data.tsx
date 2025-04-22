
import { useState, useEffect } from 'react';
import { Project, Document } from '@/types/clients';
import { useClientsData } from './use-clients-data';

// Datos de ejemplo para proyectos
const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    clientId: 1,
    name: "Rediseño Sitio Web",
    description: "Rediseño completo del sitio web corporativo con énfasis en experiencia de usuario y optimización para móviles",
    startDate: new Date("2023-04-10"),
    status: "Activo",
    paymentPlan: {
      id: 1,
      projectId: 1,
      type: "Mixto",
      implementationFee: {
        total: 15000000,
        currency: "COP",
        installments: 3,
      },
      recurringFee: {
        amount: 1500000,
        currency: "COP",
        frequency: "Mensual",
        dayOfCharge: 15,
      },
    },
    payments: [
      {
        id: 1,
        projectId: 1,
        clientId: 1,
        amount: 5000000,
        currency: "COP",
        date: new Date("2023-04-15"),
        paidDate: new Date("2023-04-17"),
        status: "Pagado",
        invoiceNumber: "FV-2023-001",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 1,
      },
      {
        id: 2,
        projectId: 1,
        clientId: 1,
        amount: 5000000,
        currency: "COP",
        date: new Date("2023-05-15"),
        status: "Pendiente",
        type: "Implementación",
        installmentNumber: 2,
      },
      {
        id: 3,
        projectId: 1,
        clientId: 1,
        amount: 5000000,
        currency: "COP",
        date: new Date("2023-06-15"),
        status: "Pendiente",
        type: "Implementación",
        installmentNumber: 3,
      },
    ],
    documents: [
      {
        id: 1,
        name: "Propuesta Técnica",
        type: "Otro",
        url: "#",
        uploadDate: new Date("2023-04-05"),
      },
      {
        id: 2,
        name: "Contrato de Servicios",
        type: "Contrato",
        url: "#",
        uploadDate: new Date("2023-04-10"),
      },
    ],
  },
  {
    id: 2,
    clientId: 1,
    name: "App Móvil de Ventas",
    description: "Desarrollo de aplicación móvil para equipo de ventas con gestión de clientes y seguimiento de pedidos",
    startDate: new Date("2023-05-01"),
    status: "Activo",
    paymentPlan: {
      id: 2,
      projectId: 2,
      type: "Fee único",
      implementationFee: {
        total: 25000000,
        currency: "COP",
        installments: 1,
      },
    },
    payments: [
      {
        id: 4,
        projectId: 2,
        clientId: 1,
        amount: 25000000,
        currency: "COP",
        date: new Date("2023-05-10"),
        paidDate: new Date("2023-05-11"),
        status: "Pagado",
        invoiceNumber: "FV-2023-005",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 1,
      },
    ],
    documents: [],
  },
  {
    id: 3,
    clientId: 2,
    name: "Sistema de Inventarios",
    description: "Implementación de sistema para gestión y control de inventarios con integración a ERP existente",
    startDate: new Date("2023-02-01"),
    endDate: new Date("2023-07-15"),
    status: "Finalizado",
    paymentPlan: {
      id: 3,
      projectId: 3,
      type: "Fee por cuotas",
      implementationFee: {
        total: 18000000,
        currency: "COP",
        installments: 6,
      },
    },
    payments: [
      {
        id: 5,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-02-15"),
        paidDate: new Date("2023-02-18"),
        status: "Pagado",
        invoiceNumber: "FV-2023-010",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 1,
      },
      {
        id: 6,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-03-15"),
        paidDate: new Date("2023-03-16"),
        status: "Pagado",
        invoiceNumber: "FV-2023-015",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 2,
      },
      {
        id: 7,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-04-15"),
        paidDate: new Date("2023-04-20"),
        status: "Pagado",
        invoiceNumber: "FV-2023-022",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 3,
      },
      {
        id: 8,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-05-15"),
        paidDate: new Date("2023-05-16"),
        status: "Pagado",
        invoiceNumber: "FV-2023-028",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 4,
      },
      {
        id: 9,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-06-15"),
        paidDate: new Date("2023-06-17"),
        status: "Pagado",
        invoiceNumber: "FV-2023-035",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 5,
      },
      {
        id: 10,
        projectId: 3,
        clientId: 2,
        amount: 3000000,
        currency: "COP",
        date: new Date("2023-07-15"),
        paidDate: new Date("2023-07-15"),
        status: "Pagado",
        invoiceNumber: "FV-2023-042",
        invoiceUrl: "#",
        type: "Implementación",
        installmentNumber: 6,
      },
    ],
    documents: [],
    notes: "Proyecto completado exitosamente, cliente muy satisfecho",
  },
  {
    id: 4,
    clientId: 3,
    name: "Consultoría Estratégica",
    description: "Consultoría y acompañamiento en el desarrollo de plan estratégico de crecimiento 2023-2025",
    startDate: new Date("2022-11-10"),
    status: "Pausado",
    paymentPlan: {
      id: 4,
      projectId: 4,
      type: "Suscripción periódica",
      recurringFee: {
        amount: 4800000,
        currency: "COP",
        frequency: "Mensual",
        dayOfCharge: 10,
      },
    },
    payments: [
      {
        id: 11,
        projectId: 4,
        clientId: 3,
        amount: 4800000,
        currency: "COP",
        date: new Date("2022-11-10"),
        paidDate: new Date("2022-11-12"),
        status: "Pagado",
        invoiceNumber: "FV-2022-123",
        invoiceUrl: "#",
        type: "Recurrente",
      },
      {
        id: 12,
        projectId: 4,
        clientId: 3,
        amount: 4800000,
        currency: "COP",
        date: new Date("2022-12-10"),
        paidDate: new Date("2022-12-11"),
        status: "Pagado",
        invoiceNumber: "FV-2022-130",
        invoiceUrl: "#",
        type: "Recurrente",
      },
      {
        id: 13,
        projectId: 4,
        clientId: 3,
        amount: 4800000,
        currency: "COP",
        date: new Date("2023-01-10"),
        paidDate: new Date("2023-01-12"),
        status: "Pagado",
        invoiceNumber: "FV-2023-003",
        invoiceUrl: "#",
        type: "Recurrente",
      },
      {
        id: 14,
        projectId: 4,
        clientId: 3,
        amount: 4800000,
        currency: "COP",
        date: new Date("2023-02-10"),
        paidDate: new Date("2023-02-15"),
        status: "Pagado",
        invoiceNumber: "FV-2023-012",
        invoiceUrl: "#",
        type: "Recurrente",
      },
      {
        id: 15,
        projectId: 4,
        clientId: 3,
        amount: 4800000,
        currency: "COP",
        date: new Date("2023-03-10"),
        status: "Vencido",
        type: "Recurrente",
      },
    ],
    documents: [],
  },
];

export function useProjectsData() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const { clients } = useClientsData();
  
  const getProjectById = (id: number) => {
    return projects.find(project => project.id === id);
  };
  
  const getProjectsByClientId = (clientId: number) => {
    return projects.filter(project => project.clientId === clientId);
  };

  // Agregar nombres de cliente a los proyectos para facilitar la visualización
  const projectsWithClientNames = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    return {
      ...project,
      clientName: client?.name || "Cliente Desconocido"
    };
  });
  
  const addProject = (newProject: Omit<Project, "id" | "documents" | "payments">) => {
    const project: Project = {
      ...newProject,
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      documents: [],
      payments: [],
    };
    
    setProjects([...projects, project]);
    return project;
  };
  
  const updateProject = (id: number, updatedData: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updatedData } : project
    ));
  };
  
  const addDocument = (
    projectId: number, 
    document: Omit<Document, "id">
  ) => {
    const project = getProjectById(projectId);
    if (!project) return;
    
    const newDoc = {
      ...document,
      id: project.documents.length > 0 
        ? Math.max(...project.documents.map(d => d.id)) + 1 
        : 1,
    };
    
    updateProject(projectId, {
      documents: [...project.documents, newDoc],
    });
    
    return newDoc;
  };
  
  const removeDocument = (projectId: number, documentId: number) => {
    const project = getProjectById(projectId);
    if (!project) return;
    
    updateProject(projectId, {
      documents: project.documents.filter(doc => doc.id !== documentId),
    });
  };
  
  return {
    projects: projectsWithClientNames,
    getProjectById,
    getProjectsByClientId,
    addProject,
    updateProject,
    addDocument,
    removeDocument,
  };
}
