import { traky } from "./traky.js";

const offices = await traky.offices.list();
for (const office of offices.data) {
  console.log(office.type, office.id, office.name, office.city);
}

const warehouses = await traky.offices.list({ type: "warehouse" });
console.log(warehouses.data[0]?.pricePerPoundClient);
