import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

describe("root page", () => {
  it("redirects to /companies", async () => {
    const { default: HomePage } = await import("@/app/page");
    expect(() => HomePage()).toThrow("redirect:/companies");
  });
});
