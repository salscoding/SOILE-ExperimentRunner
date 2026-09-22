import { describe, expect, it } from "vitest";
import { getNodeDimensions } from "../nodeDimensions";

describe("getNodeDimensions", () => {
  it("uses border-box dimensions instead of the smaller content box", () => {
    const entry = {
      borderBoxSize: [{ inlineSize: 200, blockSize: 120 }],
      contentRect: { width: 198, height: 118 },
    } as unknown as ResizeObserverEntry;

    expect(getNodeDimensions(entry)).toEqual({ width: 200, height: 120 });
  });

  it("falls back to the element's border-box dimensions", () => {
    const entry = {
      borderBoxSize: [],
      contentRect: { width: 198, height: 118 },
      target: { offsetWidth: 200, offsetHeight: 120 },
    } as unknown as ResizeObserverEntry;

    expect(getNodeDimensions(entry)).toEqual({ width: 200, height: 120 });
  });
});
