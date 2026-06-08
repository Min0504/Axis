import type { VerifiedProduct } from "./types";

/**
 * Starter verified laptop seed (lead category).
 *
 * Values are base-configuration specs transcribed from each manufacturer's
 * official page. `price` is intentionally omitted — it changes too often and
 * by config/region to certify (see schema: price is non-primary).
 *
 * ⚠️ Before production: re-check each value against `source`. Specs are stated
 * with care but base configs and panel options change between model years.
 */
export const laptops: VerifiedProduct[] = [
  {
    id: "macbook-air-13-m3",
    canonicalName: "맥북 에어 13 M3",
    aliases: ["맥북 에어 m3", "macbook air m3", "맥북에어 m3", "맥북 에어 13", "macbook air 13 m3", "맥북 에어", "macbook air"],
    category: "laptop",
    source: "https://www.apple.com/macbook-air/specs/",
    fetchedAt: "2026-05",
    tier: 1,
    specs: {
      model_name: "MacBook Air 13-inch M3",
      os: "macOS",
      cpu: "Apple M3",
      gpu: "Apple M3 GPU",
      ram_gb: "16",
      storage_gb: "256",
      display_inch: "13.6",
      brightness_nits: "500",
      panel: "IPS (Liquid Retina)",
      resolution: "2560×1664",
      refresh_hz: "60",
      weight_g: "1240",
      battery_wh: "52.6",
      ports: "Thunderbolt/USB4 ×2, MagSafe 3"
    }
  },
  {
    id: "macbook-air-15-m3",
    canonicalName: "맥북 에어 15 M3",
    aliases: ["맥북 에어 15", "macbook air 15", "맥북에어 15", "macbook air 15 m3", "맥북 에어 15 m3"],
    category: "laptop",
    source: "https://www.apple.com/macbook-air/specs/",
    fetchedAt: "2026-05",
    tier: 1,
    specs: {
      model_name: "MacBook Air 15-inch M3",
      os: "macOS",
      cpu: "Apple M3",
      gpu: "Apple M3 GPU",
      ram_gb: "16",
      storage_gb: "256",
      display_inch: "15.3",
      brightness_nits: "500",
      panel: "IPS (Liquid Retina)",
      resolution: "2880×1864",
      refresh_hz: "60",
      weight_g: "1510",
      battery_wh: "66.5",
      ports: "Thunderbolt/USB4 ×2, MagSafe 3"
    }
  },
  {
    id: "lg-gram-16",
    canonicalName: "LG 그램 16",
    aliases: ["lg 그램 16", "그램 16", "lg gram 16", "gram 16", "lg 그램", "그램", "lg gram"],
    category: "laptop",
    source: "https://www.lge.co.kr/gram",
    fetchedAt: "2026-05",
    tier: 1,
    specs: {
      model_name: "LG gram 16",
      os: "Windows 11",
      cpu: "Intel Core Ultra 7 155H",
      gpu: "Intel Arc Graphics",
      ram_gb: "16",
      storage_gb: "512",
      display_inch: "16",
      brightness_nits: "350",
      panel: "IPS",
      resolution: "2560×1600",
      refresh_hz: "60",
      weight_g: "1199",
      battery_wh: "80",
      ports: "Thunderbolt 4 ×2, USB-A ×2, HDMI"
    }
  },
  {
    id: "galaxy-book4-pro-14",
    canonicalName: "갤럭시 북4 프로 14",
    aliases: ["갤럭시북4 프로", "갤럭시 북4 프로", "galaxy book4 pro", "갤럭시북4프로", "갤럭시북 프로", "갤럭시북"],
    category: "laptop",
    source: "https://www.samsung.com/sec/notebooks/galaxy-book4-pro/",
    fetchedAt: "2026-05",
    tier: 1,
    specs: {
      model_name: "Galaxy Book4 Pro 14",
      os: "Windows 11",
      cpu: "Intel Core Ultra 7 155H",
      gpu: "Intel Arc Graphics",
      ram_gb: "16",
      storage_gb: "512",
      display_inch: "14",
      brightness_nits: "400",
      panel: "OLED (AMOLED)",
      resolution: "2880×1800",
      refresh_hz: "120",
      weight_g: "1170",
      battery_wh: "63",
      ports: "Thunderbolt 4 ×2, USB-A, HDMI, microSD"
    }
  }
];
