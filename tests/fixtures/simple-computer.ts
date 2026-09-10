import type { Page } from "@playwright/test";

// Exercise the real editor and sandbox without waiting for the 3D room.
export async function useSimpleComputer(page: Page) {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl" || type === "webgl2") return null;
      return getContext.apply(this, [type, ...args] as never);
    } as typeof getContext;
  });
}
