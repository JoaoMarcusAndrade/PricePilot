import assert from "node:assert/strict";
import test from "node:test";
import { parseKabumSearchPage } from "./kabum.provider.js";

function nextDataHtml(products: unknown[]): string {
  const payload = {
    props: {
      pageProps: {
        data: JSON.stringify({ data: products }),
      },
    },
  };

  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script>`;
}

test("maps KaBuM search data without inventing unavailable fields", () => {
  const offers = parseKabumSearchPage(nextDataHtml([
    {
      code: 459144,
      name: "Placa de Video RX 7600",
      friendlyName: "placa-de-video-rx-7600",
      price: 2823.52,
      priceWithDiscount: 2399.99,
      oldPrice: 2999.99,
      maxInstallment: "10x de R$ 282,35",
      available: true,
      image: "https://images.kabum.com.br/produtos/rx7600.jpg",
      averageRating: 4.8,
      ratingCount: 158,
    },
    {
      code: 921271,
      name: "Produto sem avaliacao",
      friendlyName: "produto-sem-avaliacao",
      priceWithDiscount: 99.9,
      available: false,
    },
  ]), 5);

  assert.equal(offers.length, 2);
  assert.equal(offers[0].id, "kabum:459144");
  assert.equal(offers[0].price, 2399.99);
  assert.equal(offers[0].priceType, "cash");
  assert.equal(offers[0].originalPrice, 2999.99);
  assert.equal(offers[0].cardPrice, 2823.52);
  assert.match(offers[0].installments ?? "", /^10x de R\$\s*282,35$/);
  assert.equal(offers[0].installmentsInterestFree, true);
  assert.equal(offers[0].availability, "in-stock");
  assert.equal(offers[0].rating, 4.8);
  assert.equal(offers[0].reviewCount, 158);
  assert.equal(offers[1].availability, "out-of-stock");
  assert.equal(offers[1].rating, undefined);
});

test("uses product JSON-LD as a partial fallback", () => {
  const offers = parseKabumSearchPage(`
    <script id="productSchema" type="application/ld+json">
      {"@type":"Product","name":"SSD NVMe 1TB","image":"https://images.kabum.com.br/ssd.jpg","offers":{"url":"https://www.kabum.com.br/produto/1/ssd-nvme","price":"499.90","availability":"https://schema.org/InStock"}}
    </script>
  `, 5);

  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 499.9);
  assert.equal(offers[0].priceType, "listed");
  assert.equal(offers[0].availability, "in-stock");
});
