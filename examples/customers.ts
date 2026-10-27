import { traky } from "./traky.js";
import type { CustomerCreate } from "../src/index.js";

const page = await traky.customers.list({ limit: 5, types: ["CLIENT"] });
console.log(page.pagination.limit, "por página");

const body: CustomerCreate = {
  accountType: "PERSONAL",
  firstName: "Ana",
  lastName: "Paz",
  email: `ana-${Date.now()}@example.com`,
  createContact: false,
};

const created = await traky.customers.create(body);
const loaded = await traky.customers.retrieve(created.id);
await traky.customers.update(loaded.id, { city: "Quito" });
await traky.customers.delete(loaded.id);
