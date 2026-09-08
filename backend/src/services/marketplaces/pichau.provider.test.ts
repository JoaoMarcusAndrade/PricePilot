import assert from "node:assert/strict";
import test from "node:test";
import { parsePichauSearchPage } from "./pichau.provider.js";

test("maps Pichau search cards into normalized offers", () => {
  const offers = parsePichauSearchPage(`
    <a data-cy="list-product" href="/placa-de-video-rtx-4060">
      <div class="product_item">
        <img alt="RTX 4060" src="https://media.pichau.com.br/rtx-4060.jpg">
        <h2 class="product_info_title">Placa de Video RTX 4060</h2>
        <div class="price_from"><span class="strikeThrough">R$ 2,999.99</span></div>
        <div class="price_vista">R$ 2,199.99</div>
        <div class="price_total">R$ 2,588.22</div>
        <p class="price_parcelado_text">Em ate 12x de <span>R$ 215.69</span> Sem juros no cartao</p>
        <div class="availability_span_available">3 UNID</div>
      </div>
    </a>
  `, 5);

  assert.equal(offers.length, 1);
  assert.equal(offers[0].id, "pichau:/placa-de-video-rtx-4060");
  assert.equal(offers[0].price, 2199.99);
  assert.equal(offers[0].originalPrice, 2999.99);
  assert.equal(offers[0].cardPrice, 2588.22);
  assert.equal(offers[0].availability, "in-stock");
  assert.equal(offers[0].installmentsInterestFree, true);
  assert.match(offers[0].installments ?? "", /^12x de R\$/);
});
