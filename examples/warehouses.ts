import { traky } from "./traky.js";

const warehouses = await traky.warehouses.list();
for (const warehouse of warehouses.data) {
  console.log(
    warehouse.id,
    warehouse.name,
    warehouse.city,
    warehouse.pricePerPoundClient,
  );
}
