import assert from "node:assert/strict";
import test from "node:test";
import { parseTerabyteSearchPage } from "./terabyte.provider.js";

test("maps Terabyte search cards into normalized offers", () => {
  const offers = parseTerabyteSearchPage(`
    <article class="product-item" data-tss-estoque="1">
      <button data-tss-add="28595"></button>
      <a href="/produto/28595/placa-de-video" class="product-item__name">Placa de Video RTX 4060</a>
      <img src="https://img.terabyteshop.com.br/rtx-4060.jpg" class="image-thumbnail">
      <div class="product-item__new-price"><span>R$ 4.399,99</span></div>
      <div class="product-item__juros"><span>12x de R$ 431,38 sem juros</span></div>
    </article>
  `, 5);

  assert.equal(offers.length, 1);
  assert.equal(offers[0].id, "terabyte:28595");
  assert.equal(offers[0].price, 4399.99);
  assert.equal(offers[0].priceType, "cash");
  assert.equal(offers[0].availability, "in-stock");
  assert.equal(offers[0].imageUrl, "https://img.terabyteshop.com.br/rtx-4060.jpg");
  assert.match(offers[0].installments ?? "", /12x de R\$ 431,38/);
});
