import { expect } from "chai";
import copyrightedDictionaries from "../../src/constants/copyright.js";

describe("The copyright object", () => {
  it("is unmodifiable.", () => {
    expect(copyrightedDictionaries).to.be.frozen;
  });
});
