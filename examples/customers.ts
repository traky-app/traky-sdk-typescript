import { traky } from "./traky.js";
import type { CustomerCreate } from "../src/index.js";

const page = await traky.customers.list({ limit: 5, types: ["CLIENT"] });
console.log(page.pagination.limit, "por página");

// Cédula: solo el número. El API consulta y guarda nombre y apellido.
// Sin createContact, también crea el contacto SHIPPER.
const cedula: CustomerCreate = {
  identityType: "CEDULA",
  identityNumber: "1710034065",
  email: `ana-${Date.now()}@example.com`,
  nationality: "EC",
};

// RUC: solo el número. El API guarda la razón social.
const ruc: CustomerCreate = {
  identityType: "RUC",
  identityNumber: "1790012345001",
  email: `acme-${Date.now()}@example.com`,
};

// Pasaporte: no hay consulta. El nombre y el apellido sí se envían.
const passport: CustomerCreate = {
  identityType: "PASSPORT",
  identityNumber: "A1234567",
  firstName: "Ana",
  lastName: "Paz",
  email: `ana-${Date.now()}@example.com`,
};

const created = await traky.customers.create(passport);
console.log(cedula.identityType, ruc.identityType, created.id);
const loaded = await traky.customers.retrieve(created.id);
await traky.customers.update(loaded.id, { city: "Quito" });
