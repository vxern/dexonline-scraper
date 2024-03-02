import { expect } from "chai";
import links from "../../src/constants/links.js";

describe("The links object", () => {
  it("is unmodifiable.", () => {
    expect(links).to.be.frozen;
  });
});
