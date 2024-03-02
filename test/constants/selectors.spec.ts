import { expect } from "chai";
import selectors from "../../src/constants/selectors.js";

describe("The selectors object", () => {
  it("is unmodifiable.", () => {
    expect(selectors).to.be.frozen;
  });
});
