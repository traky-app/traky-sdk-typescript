import { Traky } from "../src/index.js";

const apiKey = process.env.TRAKY_API_KEY;
if (!apiKey) {
  throw new Error("Define TRAKY_API_KEY (prefijo trk_).");
}

export const traky = new Traky({ apiKey });
