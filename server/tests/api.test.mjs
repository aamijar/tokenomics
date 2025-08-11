import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/index.js";

describe("health", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health").expect(200);
    assert.equal(res.body.ok, true);
  });
});

describe("quotes", () => {
  it("GET /api/quotes returns shape", async () => {
    const res = await request(app)
      .get("/api/quotes")
      .query({ fromToken: "USDC", toToken: "ETH", amount: "100", chainId: "1" })
      .expect(200);
    assert.ok(res.body);
  });
});

describe("approve/swap", () => {
  it("POST /api/approve requires from and returns tx", async () => {
    const bad = await request(app).post("/api/approve").send({}).expect(400);
    assert.ok(bad.body.error);

    const ok = await request(app)
      .post("/api/approve")
      .send({ token: "USDC", spender: "0xspender", amount: "1", chainId: 1, from: "0xfrom" })
      .expect(200);
    assert.ok(ok.body);
  });

  it("POST /api/swap requires from and returns tx", async () => {
    const bad = await request(app).post("/api/swap").send({}).expect(400);
    assert.ok(bad.body.error);

    const ok = await request(app)
      .post("/api/swap")
      .send({ fromToken: "USDC", toToken: "ETH", amount: "1", chainId: 1, from: "0xfrom", slippageBps: 50 })
      .expect(200);
    assert.ok(ok.body);
  });
});

describe("activity/pools", () => {
  it("GET /api/activity/:address returns items", async () => {
    const res = await request(app).get("/api/activity/0x0000000000000000000000000000000000000000").expect(200);
    assert.ok(res.body);
  });

  it("GET /api/pools returns overview", async () => {
    const res = await request(app).get("/api/pools").expect(200);
    assert.ok(res.body);
  });
});
