export interface NodeDimensions {
  width: number;
  height: number;
}

/**
 * Return the node's border-box dimensions so the value can safely be applied
 * to an element using `box-sizing: border-box` without shrinking on every
 * ResizeObserver callback.
 */
export const getNodeDimensions = (
  entry: ResizeObserverEntry
): NodeDimensions => {
  const borderBoxSize = entry.borderBoxSize?.[0];
  if (borderBoxSize) {
    return {
      width: borderBoxSize.inlineSize,
      height: borderBoxSize.blockSize,
    };
  }

  const target = entry.target as HTMLElement;
  return {
    width: target.offsetWidth || entry.contentRect.width,
    height: target.offsetHeight || entry.contentRect.height,
  };
};
