import { expect } from "chai";
import expressions from "../../src/constants/expressions.js";

describe("The expressions object", () => {
  it("is unmodifiable.", () => {
    expect(expressions).to.be.frozen;
  });
});
