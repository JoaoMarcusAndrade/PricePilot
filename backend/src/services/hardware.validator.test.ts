import assert from "node:assert/strict";
import test from "node:test";
import { isHardwareQuery, normalizeHardwareText } from "./hardware.validator.js";

test("normalizes accents and case before matching", () => {
  assert.equal(normalizeHardwareText("Placa de VÍDEO RTX"), "placa de video rtx");
});

test("accepts hardware and peripherals queries", () => {
  assert.equal(isHardwareQuery("RTX 5070 12GB"), true);
  assert.equal(isHardwareQuery("quero uma placa de video para jogar em 1440p ate R$ 3.000"), true);
  assert.equal(isHardwareQuery("SSD NVMe 1TB"), true);
  assert.equal(isHardwareQuery("memoria ddr5 32gb"), true);
  assert.equal(isHardwareQuery("mouse razer"), true);
});

test("rejects out-of-scope queries", () => {
  assert.equal(isHardwareQuery(""), false);
  assert.equal(isHardwareQuery("me conta uma piada"), false);
  assert.equal(isHardwareQuery("comprei um carro 0km unico dono"), false);
  assert.equal(isHardwareQuery(" "), false);
});