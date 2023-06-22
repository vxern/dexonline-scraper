import { describe, it } from "mocha";
import { expect } from "chai";
import { zip } from "../src/utils.js";

describe("utils.ts", () => {
	it("zip()", () => {
		expect(zip(["a"], ["b"])).to.deep.equal([["a", "b"]], "Handles arrays of the same size.");
		expect(zip(["a"], ["b", "c"])).to.deep.equal([["a", "b"]], "Handles arrays of different sizes.");
		expect(zip(["a", "b"], ["c", "d"])).to.deep.equal(
			[
				["a", "c"],
				["b", "d"],
			],
			"Handles more than one element in each array.",
		);
	});
});
