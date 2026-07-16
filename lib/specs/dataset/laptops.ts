import { appleLaptops } from "./laptops-apple";
import { lgLaptops } from "./laptops-lg";
import { samsungLaptops } from "./laptops-samsung";
import type { VerifiedProduct } from "./types";

/**
 * 노트북 검증 데이터셋 — 공식/검증 소스 기반 수동 데이터.
 *
 * 세부 제조사 데이터는 파일 크기와 충돌을 줄이기 위해 분리한다.
 */
export const laptops: VerifiedProduct[] = [
  ...appleLaptops,
  ...lgLaptops,
  ...samsungLaptops
];
