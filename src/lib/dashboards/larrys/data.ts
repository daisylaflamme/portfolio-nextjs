import raw from "../../../data/larrys-secret.json" with { type: "json" };
import type { LarrysData } from "./types.ts";

/** The dashboard dataset, typed once here. */
export const larrysData = raw as LarrysData;
