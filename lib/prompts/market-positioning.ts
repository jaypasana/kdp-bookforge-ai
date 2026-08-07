/**
 * Market positioning (spec section 19 "Market Positioning") is generated as
 * part of the single KDP package call in kdp-package.ts (the `positioning`
 * field) rather than as its own OpenAI round-trip — the two overlap almost
 * entirely (ideal customer, pain points, goals, USP) and splitting them
 * would just double token spend for no quality benefit. This file exists so
 * the prompt-library file list matches spec section 7; the actual
 * schema/prompt lives in ./kdp-package.
 */
export {
  kdpPackageSchema as marketPositioningParentSchema,
  type KdpPackage,
} from "./kdp-package";
