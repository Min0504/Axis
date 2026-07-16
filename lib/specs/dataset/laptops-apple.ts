import { appleAirLaptops } from "./laptops-apple-air";
import { appleProLaptops } from "./laptops-apple-pro";
import type { VerifiedProduct } from "./types";

export const appleLaptops: VerifiedProduct[] = [
  ...appleAirLaptops,
  ...appleProLaptops
];
