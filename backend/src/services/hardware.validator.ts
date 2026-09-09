// The AI can only trigger scraping for hardware and peripherals. This local list is the
// safety net: even if the model replies with kind "search", the query is rejected here
// unless it refers to a known category or brand.

const HARDWARE_TERMS = [
  "processador",
  "cpu",
  "placa de video",
  "placa de v\u00eddeo",
  "gpu",
  "placa mae",
  "placa-m\u00e3e",
  "memoria ram",
  "mem\u00f3ria ram",
  "memoria",
  "mem\u00f3ria",
  "ssd",
  "hd",
  "hdd",
  "nvme",
  "armazenamento",
  "fonte",
  "gabinete",
  "cooler",
  "water cooler",
  "fan",
  "monitor",
  "teclado",
  "mouse",
  "headset",
  "fone",
  "webcam",
  "caixa de som",
  "soundbar",
  "controle",
  "notebook",
  "computador",
  "pc gamer",
];

const HARDWARE_KEYWORDS = [
  "rtx",
  "gtx",
  "rx ",
  "ryzen",
  "intel",
  "core i",
  "amd",
  "nvidia",
  "ddr4",
  "ddr5",
  "sata",
  "1440p",
  "1080p",
  "4k",
  "gamer",
];

const BRANDS = [
  "logitech",
  "razer",
  "corsair",
  "redragon",
  "hyperx",
  "steelseries",
  "kingston",
  "xpg",
  "samsung",
  "sandisk",
  "western digital",
  "seagate",
  "gigabyte",
  "msi",
  "asus",
  "evga",
  "asrock",
  "thermaltake",
  "cooler master",
  "aerocool",
  "nzxt",
  "acer",
  "lenovo",
  "galax",
  "manli",
  "zte",
  "pichau",
  "kabum",
  "terabyte",
  "patoloco",
];

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeHardwareText(value: string): string {
  return stripAccents(value).toLocaleLowerCase("pt-BR");
}

export function isHardwareQuery(query: string): boolean {
  const normalized = normalizeHardwareText(query.trim());

  if (!normalized) {
    return false;
  }

  const terms = [...HARDWARE_TERMS, ...HARDWARE_KEYWORDS, ...BRANDS];

  return terms.some((term) => normalized.includes(term));
}