import { describe, expect, it } from "vitest";
import { extractRuleBasedSpecs } from "@/lib/specs/extract/rules";

describe("extractRuleBasedSpecs", () => {
  it("extracts iPhone specs from official-page text", () => {
    const text = [
      "저장 용량 iPhone 16 128GB 크기 및 무게",
      "iPhone 16 무게: 170g 디스플레이 iPhone 16 Super Retina XDR 디스플레이 15.5cm",
      "칩 A18 칩 카메라 48MP Fusion 메인",
      "전원 및 배터리 iPhone 16 동영상 재생 최대 22시간"
    ].join(" ");

    expect(extractRuleBasedSpecs("smartphone", "아이폰 16", text)).toMatchObject({
      chipset: "A18",
      display_inch: "15.5cm",
      battery: "22시간",
      weight_g: "170",
      camera_mp: "48",
      storage_gb: "128"
    });
  });

  it("extracts older iPhone Pro specs from Apple Support text", () => {
    const text = [
      "iPhone 14 Pro - Technical Specifications Capacity 128GB 256GB 512GB 1TB",
      "Weight: 7.27 ounces (206 grams)",
      "Display Super Retina XDR display 6.1-inch (diagonal) all-screen OLED display",
      "ProMotion technology with adaptive refresh rates up to 120Hz",
      "1000 nits max brightness (typical); 1600 nits peak brightness (HDR); 2000 nits peak brightness (outdoor)",
      "Chip A16 Bionic chip",
      "Camera Pro camera system 48MP Main: 24 mm",
      "Operating System iOS",
      "Power and Battery Video playback: Up to 23 hours"
    ].join(" ");

    expect(extractRuleBasedSpecs("smartphone", "아이폰14pro", text)).toMatchObject({
      os: "iOS",
      chipset: "A16 Bionic",
      display_inch: "6.1",
      battery: "23 hours",
      weight_g: "206",
      camera_mp: "48",
      storage_gb: "128",
      refresh_hz: "120",
      brightness_nits: "2000"
    });
  });

  it("extracts Galaxy specs from official-page text", () => {
    const text = [
      "크기 (Main Display) 156.4mm 최대 주사율 (Main Display) 120 Hz",
      "후면 카메라 - 화소 (Multiple) 50.0 MP + 10.0 MP + 12.0 MP",
      "무게(g) 162 배터리 용량(mAh, Typical) 4000 ROM Size (GB) 256"
    ].join(" ");

    expect(extractRuleBasedSpecs("smartphone", "갤럭시 S25", text)).toMatchObject({
      display_inch: "156.4mm",
      battery: "4000mAh",
      weight_g: "162",
      camera_mp: "50.0",
      storage_gb: "256",
      refresh_hz: "120"
    });
  });

  it("extracts Galaxy specs from official English feature text", () => {
    const text = [
      "Top features S25 S25+ Camera Our most advanced AI ProVisual Engine 12MP Front Camera 50MP Wide-angle Camera",
      "Processor The most powerful processor for Galaxy Snapdragon® 8 Elite for Galaxy",
      "Battery Long-lasting battery life to keep you going all day 4000mAh Up to 29 hrs of video playback",
      "Storage Plenty of space to store it all and more 256GB | 128GB storage 12GB memory",
      "What is the difference between Galaxy S25 and S25+? Galaxy S25 has a 6.2-inch display and a 4,000 mAh battery capacity"
    ].join(" ");

    expect(extractRuleBasedSpecs("smartphone", "Galaxy S25", text)).toMatchObject({
      chipset: "Snapdragon® 8 Elite for Galaxy",
      display_inch: "6.2-inch",
      battery: "4000mAh",
      camera_mp: "50",
      storage_gb: "256GB | 128GB"
    });
  });

  it("extracts Galaxy Plus specs from official English feature text", () => {
    const text = [
      "Top features S25 S25+ Camera Our most advanced AI ProVisual Engine 12MP Front Camera 50MP Wide-angle Camera",
      "Camera Our most advanced AI ProVisual Engine 12MP Front Camera 50MP Wide-angle Camera",
      "Processor The most powerful processor for Galaxy Snapdragon® 8 Elite for Galaxy Processor The most powerful processor for Galaxy Snapdragon® 8 Elite for Galaxy",
      "Battery Long-lasting battery life to keep you going all day 4000mAh Up to 29 hrs of video playback",
      "Battery Long-lasting battery life to keep you going all day 4900mAh Up to 30 hrs of video playback",
      "Storage Plenty of space to store it all and more 256GB | 128GB storage 12GB memory",
      "Storage Plenty of space to store it all and more 512GB | 256GB storage 12GB memory",
      "Galaxy S25 has a 6.2-inch display and a 4,000 mAh battery capacity, whereas Galaxy S25+ has a 6.7-inch display"
    ].join(" ");

    expect(extractRuleBasedSpecs("smartphone", "Galaxy S25+", text)).toMatchObject({
      display_inch: "6.7-inch",
      battery: "4900mAh",
      storage_gb: "512GB | 256GB"
    });
  });

  it("extracts MacBook Air laptop specs from official-page text", () => {
    const text = [
      "칩 Apple M5 칩 10코어 CPU 8코어 GPU",
      "메모리 16GB 16GB 통합 메모리",
      "저장 장치 1 512GB 512GB SSD",
      "디스플레이 Liquid Retina 디스플레이 34.5cm(대각선) LED 백라이트 디스플레이(IPS 기술), 2 2560 x 1664 기본 해상도 500 니트 밝기",
      "배터리 및 전원 3 동영상 스트리밍 최대 18시간 무선 인터넷 사용 최대 15시간 53.8와트시 리튬 폴리머 배터리 내장",
      "Thunderbolt 4(USB-C) 포트 2개",
      "무게: 1.23kg 운영체제 macOS"
    ].join(" ");

    expect(extractRuleBasedSpecs("laptop", "맥북 에어", text)).toMatchObject({
      cpu: "Apple M5",
      gpu: "8코어 GPU",
      ram_gb: "16",
      storage_gb: "512",
      display_inch: "34.5cm",
      brightness_nits: "500",
      panel: "IPS (Liquid Retina)",
      resolution: "2560 x 1664",
      battery_wh: "53.8",
      weight_g: "1230",
      ports: "Thunderbolt 4(USB-C) ×2",
      os: "macOS"
    });
  });

  it("extracts Galaxy Book laptop specs from official support text", () => {
    const text = [
      "CPU Intel® Core™ Ultra 7 Processor 155H (UP to 4.8 GHz 24MB L3 Cache)",
      "그래픽카드 Intel® Arc™ Graphics",
      "디스플레이 크기 40.6 cm (16.0 inch) 해상도 2880 x 1800 (WQXGA+) 종류 Dynamic AMOLED 2X, Anti-Reflective",
      "메모리 32 GB 메모리 타입 LPDDR5X 저장장치 용량 512 GB 저장장치 타입 NVMe SSD",
      "운영체제 Windows 11 Home",
      "배터리 용량 (Typical)(Wh) 76",
      "무게 (kg) 1.66"
    ].join(" ");

    expect(extractRuleBasedSpecs("laptop", "갤럭시북", text)).toMatchObject({
      cpu: "Intel® Core™ Ultra 7 Processor 155H",
      gpu: "Intel® Arc™ Graphics",
      ram_gb: "32",
      storage_gb: "512",
      display_inch: "16.0",
      panel: "Dynamic AMOLED 2X",
      resolution: "2880 x 1800",
      battery_wh: "76",
      weight_g: "1660",
      os: "Windows 11 Home"
    });
  });
});
