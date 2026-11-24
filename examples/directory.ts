import {
  Traky,
  type ContactWrite,
  type CustomerCreate,
} from "../src/index.js";

const apiKey = process.env.TRAKY_API_KEY;
if (!apiKey) {
  throw new Error("Define TRAKY_API_KEY (prefijo trk_).");
}

const traky = new Traky({ apiKey });

// true o ausente: el API crea el contacto SHIPPER con el nombre verificado.
const customerBody: CustomerCreate = {
  identityType: "PASSPORT",
  identityNumber: "A1234567",
  firstName: "Ana",
  lastName: "Paz",
  email: "ana@example.com",
};

const customer = await traky.customers.create(customerBody);
const updated = await traky.customers.update(customer.id, { city: "Quito" });

const contactBody: ContactWrite = {
  accountType: "PERSONAL",
  firstName: "Luis",
  types: ["CONSIGNEE"],
  clientId: updated.id,
};

const contact = await traky.contacts.create(contactBody);
await traky.contacts.update(contact.id, { types: ["SHIPPER", "CONSIGNEE"] });

const page = await traky.contacts.list({ clientId: updated.id, types: ["SHIPPER"] });
console.log(page.data.map((row) => row.types));
