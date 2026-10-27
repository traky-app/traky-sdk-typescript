import { traky } from "./traky.js";

const offices = await traky.offices.list();
for (const office of offices.data) {
  console.log(office.id, office.name, office.city, office.countryCode);
}
