import { traky } from "./traky.js";
import type { ContactWrite, CustomerCreate } from "../src/index.js";

const customerBody: CustomerCreate = {
  accountType: "PERSONAL",
  firstName: "Ana",
  email: `ana-${Date.now()}@example.com`,
  createContact: false,
};
const customer = await traky.customers.create(customerBody);

const body: ContactWrite = {
  accountType: "PERSONAL",
  firstName: "Luis",
  types: ["SHIPPER"],
  clientId: customer.id,
};

const created = await traky.contacts.create(body);
const page = await traky.contacts.list({
  clientId: customer.id,
  types: ["SHIPPER"],
});
console.log(page.data.map((row) => row.types));

const loaded = await traky.contacts.retrieve(created.id);
await traky.contacts.update(loaded.id, { types: ["SHIPPER", "CONSIGNEE"] });
await traky.contacts.delete(loaded.id);
await traky.customers.delete(customer.id);
