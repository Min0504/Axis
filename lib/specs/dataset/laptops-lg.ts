import type { VerifiedProduct } from "./types";

export const lgLaptops: VerifiedProduct[] = [
  // ── LG 그램 ──────────────────────────────────────────────────────────────
  {
    id: "lg-gram-16",
    canonicalName: "LG 그램 16",
    nameEn: "LG gram 16",
    aliases: ["lg 그램 16", "그램 16", "그램16", "lg그램16", "lg 그램16", "lg gram 16", "gram 16", "lg 그램", "그램", "lg gram"],
    category: "laptop",
    country: "KR",
    source: "https://www.lge.co.kr/notebooks",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram 16", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "16", brightness_nits: "350", panel: "IPS",
      resolution: "2560×1600", refresh_hz: "60", weight_g: "1199", battery_wh: "80",
      ports: "Thunderbolt 4 ×2, USB-A ×2, HDMI, USB-C", launch_price_krw: "169만원부터", release_date: "2024년 1월"
    }
  },
  {
    id: "lg-gram-14",
    canonicalName: "LG 그램 14",
    nameEn: "LG gram 14",
    aliases: ["lg 그램 14", "그램 14", "그램14", "lg그램14", "lg 그램14", "lg gram 14", "gram 14"],
    category: "laptop",
    country: "KR",
    source: "https://www.lge.co.kr/notebooks",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram 14", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "14", brightness_nits: "350", panel: "IPS",
      resolution: "1920×1200", refresh_hz: "60", weight_g: "980", battery_wh: "72",
      ports: "Thunderbolt 4 ×2, USB-A ×2, HDMI", launch_price_krw: "149만원부터", release_date: "2024년 1월"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LG 그램 Pro (2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "lg-gram-pro-16",
    canonicalName: "LG 그램 Pro 16",
    nameEn: "LG gram Pro 16",
    aliases: ["lg 그램 프로 16", "lg그램프로16", "lg gram pro 16", "그램 프로 16", "그램프로16", "gram pro 16"],
    category: "laptop",
    country: "KR",
    source: "https://www.lg.com/kr/laptops/lg-gram/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram Pro 16 (2024)", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "16.0", brightness_nits: "350", panel: "IPS (Anti-Glare)",
      resolution: "2560×1600", refresh_hz: "60", weight_g: "1199", battery_wh: "80",
      ports: "Thunderbolt 4 ×2, USB-C, USB-A ×2, HDMI, MicroSD", launch_price_krw: "189만원부터", release_date: "2024년 1월"
    }
  },
  {
    id: "lg-gram-pro-14",
    canonicalName: "LG 그램 Pro 14",
    nameEn: "LG gram Pro 14",
    aliases: ["lg 그램 프로 14", "lg그램프로14", "lg gram pro 14", "그램 프로 14", "그램프로14", "gram pro 14"],
    category: "laptop",
    country: "KR",
    source: "https://www.lg.com/kr/laptops/lg-gram/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram Pro 14 (2024)", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "14.0", brightness_nits: "350", panel: "IPS (Anti-Glare)",
      resolution: "2560×1600", refresh_hz: "60", weight_g: "980", battery_wh: "72",
      ports: "Thunderbolt 4 ×2, USB-C, USB-A ×2, HDMI, MicroSD", launch_price_krw: "169만원부터", release_date: "2024년 1월"
    }
  }
];
