import { traky } from "./traky.js";
import type { StatusCreate } from "../src/index.js";

const all = await traky.statuses.list();
console.log(all.data.length, "estados");

const packages = await traky.statuses.list({ category: "package" });
for (const status of packages.data) {
  console.log(status.position, status.label, status.id);
}

const body: StatusCreate = {
  label: "En bodega",
  description: "El paquete está en la bodega",
  category: "package",
  icon: "package",
  position: 2,
};

const created = await traky.statuses.create(body);
const loaded = await traky.statuses.retrieve(created.id);
await traky.statuses.update(loaded.id, { isHiddenFromClient: true });
await traky.statuses.delete(loaded.id);
