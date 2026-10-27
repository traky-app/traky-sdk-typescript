import { traky } from "./traky.js";

const page = await traky.receipts.list({ limit: 10 });
console.log(page.data.length, "recibos en esta página");

const statuses = await traky.statuses.list({ category: "package" });
const offices = await traky.offices.list();
const status = statuses.data.find((row) => row.isActive) ?? statuses.data[0];
const office = offices.data.find((row) => row.isActive) ?? offices.data[0];
if (!status || !office) {
  throw new Error("Hace falta un estado de paquete y una sucursal.");
}

const created = await traky.receipts.create({
  registrationDate: new Date().toISOString(),
  locationId: office.id,
  itemStatusId: status.id,
  warehouseComments: "Ejemplo SDK",
  packages: [
    { trackingNumber: `SDK-A-${Date.now()}`, weight: 1 },
    { trackingNumber: `SDK-B-${Date.now()}`, weight: 2 },
  ],
});
console.log(created.receiptNumber, created.packageCount, "paquetes");

const loaded = await traky.receipts.retrieve(created.id);
const second = loaded.packages?.[1];
await traky.receipts.update(loaded.id, {
  comments: "Ropa",
  ...(second ? { packages: [{ id: second.id, weight: 3 }] } : {}),
});
await traky.receipts.delete(loaded.id);
