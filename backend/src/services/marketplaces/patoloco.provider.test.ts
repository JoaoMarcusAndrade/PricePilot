import assert from "node:assert/strict";
import test from "node:test";
import { parsePatolocoSearchPage } from "./patoloco.provider.js";

test("maps available Patoloco search cards into normalized offers", () => {
  const offers = parsePatolocoSearchPage(`
    <article id="variacao3125" class="product">
      <a class="product-image" href="/ssd-patriot-burst"><img src="https://patoloco.com.br/ssd.jpg"></a>
      <div class="product-info"><a href="/ssd-patriot-burst"><h3 class="tit">SSD 480 GB Patriot Burst Elite</h3></a></div>
      <p class="price-old">R$ 571,12</p>
      <p class="price-new"><span class="h1 text-success">R$ 427,20</span></p>
      <p class="price-installment">12x de R$ 41,88 sem juros</p>
    </article>
  `, 5);

  assert.equal(offers.length, 1);
  assert.equal(offers[0].id, "patoloco:3125");
  assert.equal(offers[0].price, 427.2);
  assert.equal(offers[0].originalPrice, 571.12);
  assert.equal(offers[0].availability, "in-stock");
  assert.equal(offers[0].installmentsInterestFree, true);
  assert.match(offers[0].installments ?? "", /12x de R\$ 41,88/);
});
