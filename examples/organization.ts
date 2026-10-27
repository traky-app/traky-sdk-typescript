import { traky } from "./traky.js";

const organization = await traky.organization.retrieve();
console.log(organization.id, organization.name, organization.slug);
