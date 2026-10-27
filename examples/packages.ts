import { traky } from "./traky.js";

const listed = await traky.packages.list();
console.log(listed.total, "paquetes");

const misiil = await traky.packages.listFromMisiil();
console.log(misiil.total, "paquetes de Misiil");

const statuses = await traky.statuses.list({ category: "package" });
const offices = await traky.offices.list();
const status = statuses.data.find((row) => row.isActive) ?? statuses.data[0];
const office = offices.data.find((row) => row.isActive) ?? offices.data[0];
if (!status || !office) {
  throw new Error("Hace falta un estado de paquete y una sucursal.");
}

const created = await traky.packages.create({
  registrationDate: new Date().toISOString(),
  trackingNumber: `SDK${Date.now()}`,
  itemStatusId: status.id,
  locationId: office.id,
  weight: 1,
  comments: "Ejemplo del SDK",
});
console.log(created.receiptNumber, created.packageNumber);

const one = await traky.packages.retrieve(created.id);
await traky.packages.update(one.id, { warehouseComments: "Ejemplo SDK" });
await traky.packages.delete(one.id);
