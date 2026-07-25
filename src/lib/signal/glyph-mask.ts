import type { GlyphMask } from "@/lib/pointer-field";

/**
 * Rasterize a headline's line elements to a coverage mask in a canvas's own
 * coordinate space (CSS pixels, origin at the canvas top-left), so the field
 * can tell which fragments fall inside the letterforms and resolve the word.
 *
 * The engine stays DOM-free: the *caller* owns the fonts and layout and hands
 * the built mask to the pure field functions. This helper is the one place that
 * touches the DOM to build it, shared by the global engine and (until it is
 * retired) the legacy `HeroField`.
 *
 * Returns `null` when there is nothing to rasterize yet — no lines, zero size,
 * or a canvas that has not been laid out — in which case the field runs
 * ambient-only rather than erroring.
 */

/** Mask oversample. A 2× coverage buffer gives the stroke-direction gradient
 *  something smoother than a 1px-hard edge to read. */
const MASK_SUPERSAMPLE = 2;
/** Slack around the headline box so round line caps at the ink edge are not
 *  clipped by the mask bounds. */
const MASK_PADDING = 10;

export function buildGlyphMask(
  canvas: HTMLCanvasElement,
  heading: HTMLElement,
  lineSelector = "[data-hero-line]",
): GlyphMask | null {
  const lines = Array.from(heading.querySelectorAll<HTMLElement>(lineSelector));
  if (lines.length === 0) return null;

  const canvasRect = canvas.getBoundingClientRect();
  if (canvasRect.width === 0 || canvasRect.height === 0) return null;

  // Union bounding box of every line, in canvas-local CSS pixels.
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const line of lines) {
    const rect = line.getBoundingClientRect();
    left = Math.min(left, rect.left - canvasRect.left);
    top = Math.min(top, rect.top - canvasRect.top);
    right = Math.max(right, rect.right - canvasRect.left);
    bottom = Math.max(bottom, rect.bottom - canvasRect.top);
  }

  const originX = left - MASK_PADDING;
  const originY = top - MASK_PADDING;
  const cssWidth = right - left + MASK_PADDING * 2;
  const cssHeight = bottom - top + MASK_PADDING * 2;
  if (cssWidth <= 0 || cssHeight <= 0) return null;

  const scale = 1 / MASK_SUPERSAMPLE;
  const maskWidth = Math.ceil(cssWidth * MASK_SUPERSAMPLE);
  const maskHeight = Math.ceil(cssHeight * MASK_SUPERSAMPLE);

  const off = document.createElement("canvas");
  off.width = maskWidth;
  off.height = maskHeight;
  const ctx = off.getContext("2d");
  if (!ctx) return null;

  ctx.scale(MASK_SUPERSAMPLE, MASK_SUPERSAMPLE);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (const line of lines) {
    const rect = line.getBoundingClientRect();
    // `rect` is the line *block*, which is full-width; its `left` is not where
    // the text ink starts once the headline is centered (or right-aligned). A
    // range over the line's contents gives the text's true horizontal box, so
    // the mask registers against the rendered glyphs instead of the block edge.
    const range = document.createRange();
    range.selectNodeContents(line);
    const textRect = range.getBoundingClientRect();
    const styles = getComputedStyle(line);
    // Build the font shorthand by hand — `styles.font` is empty in several
    // browsers when the longhands are set individually.
    ctx.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

    const text = line.textContent ?? "";
    const metrics = ctx.measureText(text);
    // Match the browser's line-box model, not the ink box: the font's em box
    // (font-bounding ascent + descent) is centered in the line box with equal
    // leading top and bottom, and the alphabetic baseline sits at the font
    // ascent within it. Using ink metrics instead misregisters the mask
    // against the DOM text — it reads as a strikethrough.
    const fontAscent =
      metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent;
    const fontDescent =
      metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent;
    const leading = (rect.height - (fontAscent + fontDescent)) / 2;

    // Horizontal from the text box (accounts for centering); vertical from the
    // block's line box (the leading model above is relative to it).
    const lineLeft = textRect.left - canvasRect.left - originX;
    const lineTop = rect.top - canvasRect.top - originY;
    const baseline = lineTop + leading + fontAscent;

    ctx.fillText(text, lineLeft, baseline);
  }

  const image = ctx.getImageData(0, 0, maskWidth, maskHeight).data;
  const alpha = new Uint8ClampedArray(maskWidth * maskHeight);
  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = image[i * 4 + 3];
  }

  return { alpha, width: maskWidth, height: maskHeight, originX, originY, scale };
}
