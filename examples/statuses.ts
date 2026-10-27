import { traky } from "./traky.js";

const all = await traky.statuses.list();
console.log(all.data.length, "estados");

const packages = await traky.statuses.list({ category: "package" });
for (const status of packages.data) {
  console.log(status.position, status.label, status.id);
}
