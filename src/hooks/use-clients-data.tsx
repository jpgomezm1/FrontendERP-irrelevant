
import { useState, useEffect } from 'react';
import { Client } from '@/types/clients';

// Datos de ejemplo para clientes
const INITIAL_CLIENTS: Client[] = [
  {
    id: 1,
    name: "Empresa Innovadora S.A.S",
    contactName: "Carlos Rodríguez",
    email: "carlos@empresainnovadora.com",
    phone: "315 789 1234",
    address: "Calle 85 # 11-53, Oficina 401, Bogotá",
    taxId: "901.234.567-8",
    startDate: new Date("2023-03-15"),
    status: "Activo",
    notes: "Cliente prioritario, necesita atención VIP",
    documents: [
      {
        id: 1,
        name: "RUT Empresa Innovadora",
        type: "RUT",
        url: "#",
        uploadDate: new Date("2023-03-15"),
      },
      {
        id: 2,
        name: "Cámara de Comercio Actualizada",
        type: "Cámara de Comercio",
        url: "#",
        uploadDate: new Date("2023-04-02"),
      },
      {
        id: 3,
        name: "Contrato Marco de Servicios",
        type: "Contrato",
        url: "#",
        uploadDate: new Date("2023-04-10"),
      },
    ],
  },
  {
    id: 2,
    name: "Distribuciones Comerciales Ltda.",
    contactName: "Ana Martínez",
    email: "ana.martinez@discocom.com",
    phone: "310 567 8901",
    taxId: "800.123.456-7",
    startDate: new Date("2023-01-20"),
    status: "Activo",
    documents: [
      {
        id: 4,
        name: "RUT Distribuciones Comerciales",
        type: "RUT",
        url: "#",
        uploadDate: new Date("2023-01-20"),
      },
    ],
  },
  {
    id: 3,
    name: "Consultores Asociados S.A.",
    contactName: "Fernando Gómez",
    email: "fgomez@consultoresasoc.com",
    phone: "320 234 5678",
    address: "Av. El Dorado # 68D-35, Piso 3, Bogotá",
    startDate: new Date("2022-11-05"),
    status: "Pausado",
    notes: "Contrato en pausa por reestructuración interna del cliente",
    documents: [],
  },
  {
    id: 4,
    name: "Tecnología Avanzada C.A.",
    contactName: "Luisa Torres",
    email: "ltorres@tecavanzada.com",
    phone: "300 456 7890",
    taxId: "830.567.890-1",
    startDate: new Date("2022-08-15"),
    status: "Terminado",
    documents: [
      {
        id: 5,
        name: "Cámara de Comercio",
        type: "Cámara de Comercio",
        url: "#",
        uploadDate: new Date("2022-08-15"),
      },
      {
        id: 6,
        name: "Acuerdo de Confidencialidad",
        type: "NDA",
        url: "#",
        uploadDate: new Date("2022-08-20"),
      },
    ],
  },
];

export function useClientsData() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  
  const getClientById = (id: number) => {
    return clients.find(client => client.id === id);
  };
  
  const addClient = (newClient: Omit<Client, "id" | "documents">) => {
    const client: Client = {
      ...newClient,
      id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      documents: [],
    };
    
    setClients([...clients, client]);
    return client;
  };
  
  const updateClient = (id: number, updatedData: Partial<Client>) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, ...updatedData } : client
    ));
  };
  
  const addDocument = (
    clientId: number, 
    document: Omit<Client["documents"][0], "id">
  ) => {
    const client = getClientById(clientId);
    if (!client) return;
    
    const newDoc = {
      ...document,
      id: client.documents.length > 0 
        ? Math.max(...client.documents.map(d => d.id)) + 1 
        : 1,
    };
    
    updateClient(clientId, {
      documents: [...client.documents, newDoc],
    });
    
    return newDoc;
  };
  
  const removeDocument = (clientId: number, documentId: number) => {
    const client = getClientById(clientId);
    if (!client) return;
    
    updateClient(clientId, {
      documents: client.documents.filter(doc => doc.id !== documentId),
    });
  };
  
  return {
    clients,
    getClientById,
    addClient,
    updateClient,
    addDocument,
    removeDocument,
  };
}
