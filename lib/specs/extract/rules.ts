import type { Category } from "@/lib/types";

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function nthMatch(text: string, pattern: RegExp, index: number): string | null {
  const matches = Array.from(text.matchAll(pattern));
  return matches[index]?.[1]?.trim() ?? null;
}

function maxNumericMatch(text: string, pattern: RegExp): string | null {
  const values = Array.from(text.matchAll(pattern))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return String(Math.max(...values));
}

function normalizedProductName(productName: string): string {
  return productName.toLowerCase().replace(/\s+/g, " ").trim();
}

function isIphone(productName: string): boolean {
  return /iphone|아이폰/i.test(productName);
}

function toGrams(value: string): string {
  return String(Math.round(Number(value) * 1000));
}

function extractIphoneModel(productName: string): string | null {
  return firstMatch(productName, [/(?:iphone|아이폰)\s*(\d{2}(?:\s*pro\s*max|\s*pro|\s*plus)?)/i]);
}

function extractAppleSmartphoneSpecs(productName: string, text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const model = extractIphoneModel(productName);
  const escapedModel = model?.replace(/\s+/g, "\\s*");
  const modelPattern = escapedModel ? `(?:iPhone|아이폰)\\s*${escapedModel}` : "iPhone\\s*\\d+";

  const storage = firstMatch(text, [new RegExp(`${modelPattern}\\s+(\\d+)GB`, "i"), /저장 용량\s+\d?\s*(\d+)GB/i]);
  const supportStorage = firstMatch(text, [/(?:Capacity|저장 용량)[\s\S]{0,80}?(\d+)\s*GB/i]);
  const weight = firstMatch(text, [
    new RegExp(`${modelPattern}\\s+무게:\\s*(\\d+)g`, "i"),
    new RegExp(`${modelPattern}\\s+Weight:\\s*(?:[\\d.]+ ounces \\()?(\\d+) grams`, "i"),
    /무게:\s*(\d+)g/i,
    /Weight:\s*(?:[\d.]+ ounces \()?(\d+) grams/i
  ]);
  const battery = firstMatch(text, [
    new RegExp(`${modelPattern}\\s+동영상 재생 최대\\s*([\\d]+시간)`, "i"),
    /동영상 재생:\s*최대\s*([\d]+시간)/i,
    new RegExp(`${modelPattern}[\\s\\S]{0,120}?video playback\\s*up to\\s*([\\d]+ hours)`, "i"),
    /Video playback:?\s*Up to\s*([\d]+ hours)/i
  ]);
  const display = firstMatch(text, [
    new RegExp(`${modelPattern}\\s+Super Retina[\\s\\S]{0,80}?(\\d+(?:\\.\\d+)?cm)`, "i"),
    /디스플레이\s+Super Retina[\s\S]{0,80}?(\d+(?:\.\d+)?cm)/i,
    new RegExp(`${modelPattern}[\\s\\S]{0,120}?(\\d+(?:\\.\\d+)?)[‑-]?inch`, "i"),
    /Display[\s\S]{0,80}?(\d+(?:\.\d+)?)[‑-]?inch/i
  ]);
  const refresh = firstMatch(text, [
    /(?:up to|최대)\s*(\d+)\s*Hz/i,
    /(\d+)\s*Hz\s*(?:adaptive|가변|주사율)/i
  ]);
  const brightness = maxNumericMatch(text, /(\d+)\s*nits?/gi);
  const camera = firstMatch(text, [
    /(\d+)MP\s+Fusion\s+메인/i,
    /(\d+)MP\s+Fusion\s+Main/i,
    /(\d+)MP\s+메인/i,
    /(\d+)MP\s+Main/i
  ]);
  const chipset = firstMatch(text, [
    /\b(A\d+(?:\s+Bionic|\s+Pro)?)\s+칩/i,
    /\b(A\d+(?:\s+Bionic|\s+Pro)?)\s+chip/i
  ]);
  const os = firstMatch(text, [/(?:Operating System|운영체제)\s+(iOS)/i]);

  if (os) specs.os = os;
  if (chipset) specs.chipset = chipset;
  if (display) specs.display_inch = display;
  if (battery) specs.battery = battery;
  if (weight) specs.weight_g = weight;
  if (camera) specs.camera_mp = camera;
  if (storage ?? supportStorage) specs.storage_gb = storage ?? supportStorage ?? "";
  if (refresh) specs.refresh_hz = refresh;
  if (brightness) specs.brightness_nits = brightness;

  return specs;
}

function extractSamsungSmartphoneSpecs(productName: string, text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const normalized = normalizedProductName(productName);
  const variantIndex = /\+|plus|플러스/.test(normalized) ? 1 : 0;
  const display = firstMatch(text, [
    /크기 \(Main Display\)\s*([\d.]+mm)/i,
    /Size \(Main[ _]Display\)\s*([\d.]+mm)/i
  ]);
  const battery = firstMatch(text, [
    /배터리 용량\(mAh, Typical\)\s*(\d+)/i,
    /Battery Capacity\(mAh, Typical\)\s*(\d+)/i
  ]);
  const weight = firstMatch(text, [/무게\(g\)\s*(\d+)/i, /Weight\(g\)\s*(\d+)/i]);
  const camera = firstMatch(text, [
    /후면 카메라 - 화소 \(Multiple\)\s*([\d.]+)\s*MP/i,
    /Rear Camera - Resolution \(Multiple\)\s*([\d.]+)\s*MP/i
  ]);
  const storage = firstMatch(text, [/ROM Size \(GB\)\s*(\d+)/i, /스토리지\(GB\)\s*(\d+)/i]);
  const refresh = firstMatch(text, [
    /최대 주사율 \(Main Display\)\s*(\d+)\s*Hz/i,
    /Max Refresh Rate \(Main Display\)\s*(\d+)\s*Hz/i
  ]);
  const featureDisplay = variantIndex === 1
    ? firstMatch(text, [/Galaxy S25\+ has a ([\d.]+-inch) display/i])
    : firstMatch(text, [/Galaxy S25 has a ([\d.]+-inch) display/i]);
  const featureBattery = nthMatch(text, /(\d{4})mAh\s+Up to\s+\d+\s+hrs? of video playback/gi, variantIndex);
  const featureCamera = firstMatch(text, [/(\d+)MP Wide-angle Camera/i]);
  const featureStorage = nthMatch(text, /((?:\d+GB\s*\|\s*)*\d+GB)\s+storage\s+\d+GB memory/gi, variantIndex);
  const featureChipset = firstMatch(text, [/(Snapdragon®?\s*8\s*Elite\s*for\s*Galaxy)/i]);

  if (featureChipset) specs.chipset = featureChipset;
  if (display ?? featureDisplay) specs.display_inch = display ?? featureDisplay ?? "";
  if (battery ?? featureBattery) specs.battery = `${battery ?? featureBattery}mAh`;
  if (weight) specs.weight_g = weight;
  if (camera ?? featureCamera) specs.camera_mp = camera ?? featureCamera ?? "";
  if (storage ?? featureStorage) specs.storage_gb = storage ?? featureStorage ?? "";
  if (refresh) specs.refresh_hz = refresh;

  return specs;
}

function extractAppleLaptopSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const cpu = firstMatch(text, [/(Apple M\d+)\s*칩/i, /(Apple M\d+)\s*chip/i]);
  const gpu = firstMatch(text, [/(\d+코어 GPU)/i, /(\d+-core GPU)/i]);
  const ram = firstMatch(text, [/메모리\s+(\d+)GB\s+\d+GB 통합 메모리/i, /Memory\s+(\d+)GB/i]);
  const storage = firstMatch(text, [/저장 장치\s+\d?\s*(\d+)GB\s+\d+GB SSD/i, /Storage\s+(\d+)GB\s+\d+GB SSD/i]);
  const display = firstMatch(text, [/Liquid Retina 디스플레이\s+([\d.]+cm)/i, /Liquid Retina display\s+([\d.]+-inch)/i]);
  const resolution = firstMatch(text, [/([\d]{4}\s*x\s*[\d]{4}) 기본 해상도/i, /([\d]{4}-by-[\d]{4}) native resolution/i]);
  const brightness = firstMatch(text, [/(\d+)\s*니트\s*밝기/i, /(\d+)\s*nits?\s*brightness/i]);
  const battery = firstMatch(text, [/([\d.]+)와트시 리튬/i, /Built-in\s+([\d.]+)[‑-]?watt[‑-]?hour/i]);
  const weightKg = firstMatch(text, [/무게:\s*([\d.]+)kg/i, /Weight:\s*[\d.]+ pounds \(([\d.]+) kg\)/i]);
  const ports = firstMatch(text, [/(Thunderbolt 4\(USB-C\)) 포트 2개/i, /(Two Thunderbolt 4 \(USB-C\) ports)/i]);

  if (cpu) specs.cpu = cpu;
  if (cpu && gpu) specs.gpu = gpu.includes("core") ? `${cpu} ${gpu}` : gpu;
  if (ram) specs.ram_gb = ram;
  if (storage) specs.storage_gb = storage;
  if (display) specs.display_inch = display;
  if (display) specs.panel = "IPS (Liquid Retina)";
  if (resolution) specs.resolution = resolution.replace("-by-", " x ");
  if (brightness) specs.brightness_nits = brightness;
  if (battery) specs.battery_wh = battery;
  if (weightKg) specs.weight_g = toGrams(weightKg);
  if (ports) specs.ports = ports.includes("Two") ? "Thunderbolt 4(USB-C) ×2" : `${ports} ×2`;
  if (/macOS/i.test(text)) specs.os = "macOS";

  return specs;
}

function extractSamsungLaptopSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const cpu = firstMatch(text, [/CPU\s+(.+?Processor\s+\d+[A-Z]?)(?:\s*\(|\s+그래픽카드)/i]);
  const gpu = firstMatch(text, [/그래픽카드\s+(.+?)\s+(?:그래픽카드 타입|디스플레이 크기)/i]);
  const display = firstMatch(text, [/디스플레이 크기\s+[\d.]+\s*cm\s+\(([\d.]+)\s*inch\)/i]);
  const resolution = firstMatch(text, [/해상도\s+([\d]{4}\s*x\s*[\d]{4})/i]);
  const panel = firstMatch(text, [/종류\s+(.+?)\s+(?:터치스크린|메모리\/저장장치|메모리\s+\d+\s*GB)/i]);
  const ram = firstMatch(text, [/메모리\s+(\d+)\s*GB\s+메모리 타입/i]);
  const storage = firstMatch(text, [/저장장치 용량\s+(\d+)\s*GB/i]);
  const battery = firstMatch(text, [/배터리 용량 \(Typical\)\(Wh\)\s*([\d.]+)/i]);
  const weightKg = firstMatch(text, [/무게 \(kg\)\s*([\d.]+)/i]);
  const os = firstMatch(text, [/운영체제\s+(Windows \d+ [A-Za-z]+)/i]);

  if (cpu) specs.cpu = cpu;
  if (gpu) specs.gpu = gpu;
  if (ram) specs.ram_gb = ram;
  if (storage) specs.storage_gb = storage;
  if (display) specs.display_inch = display;
  if (panel) specs.panel = panel.replace(/,\s*Anti-Reflective/i, "");
  if (resolution) specs.resolution = resolution;
  if (battery) specs.battery_wh = battery;
  if (weightKg) specs.weight_g = toGrams(weightKg);
  if (os) specs.os = os;

  return specs;
}

export function extractRuleBasedSpecs(
  category: Category,
  productName: string,
  text: string
): Record<string, string> {
  const normalized = normalizedProductName(productName);
  if (category === "smartphone") {
    if (isIphone(normalized)) return extractAppleSmartphoneSpecs(productName, text);
    if (/galaxy|갤럭시/i.test(normalized)) return extractSamsungSmartphoneSpecs(productName, text);
  }

  if (category === "laptop") {
    if (/macbook|맥북/i.test(normalized)) return extractAppleLaptopSpecs(text);
    if (/galaxy\s*book|갤럭시\s*북|갤럭시북/i.test(normalized)) return extractSamsungLaptopSpecs(text);
  }

  return {};
}
