import { Traky } from "../src/index.js";

const apiKey = process.env.TRAKY_API_KEY;
if (!apiKey) {
  throw new Error("Define TRAKY_API_KEY (prefijo trk_).");
}

const traky = new Traky({ apiKey });

const organization = await traky.organization.retrieve();
console.log(organization.name, organization.slug);

const packages = await traky.packages.list();
console.log(packages.total, "paquetes", packages.exportedAt);
