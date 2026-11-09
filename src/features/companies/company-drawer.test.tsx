import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  findCompany,
  resetCompanies,
  updateCompany,
} from "@/server/companies/store";
import { apiFetch, stubApiFetch } from "@/test/api-fetch";
import { renderCompanies } from "@/test/render-companies";

const COMPANY_ID = "company-02";

async function openDrawer() {
  renderCompanies(`?company=${COMPANY_ID}`);
  const name = await screen.findByLabelText("Name");
  await vi.waitFor(() =>
    expect(name).toHaveValue(findCompany(COMPANY_ID)?.name),
  );
  return name;
}

function patchCalls(fetchSpy: ReturnType<typeof stubApiFetch>) {
  return fetchSpy.mock.calls.filter(([, init]) => init?.method === "PATCH");
}

describe("company drawer", () => {
  let fetchSpy: ReturnType<typeof stubApiFetch>;

  beforeEach(() => {
    resetCompanies();
    fetchSpy = stubApiFetch();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the typed input on 409, loads the latest and saves again", async () => {
    const name = await openDrawer();
    const stored = findCompany(COMPANY_ID);
    if (!stored) throw new Error("seed company missing");
    updateCompany(stored, { name: "Other" });

    await userEvent.clear(name);
    await userEvent.type(name, "Mine");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(/Someone else changed this company/),
    ).toBeInTheDocument();
    expect(name).toHaveValue("Mine");

    await userEvent.click(screen.getByRole("button", { name: "Load latest" }));
    expect(await screen.findByText("Latest saved: Other")).toBeInTheDocument();
    expect(name).toHaveValue("Mine");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Company saved.")).toBeInTheDocument();
    expect(findCompany(COMPANY_ID)).toMatchObject({ name: "Mine", version: 3 });
  });

  it("keeps the draft and shows an error when Load latest fails", async () => {
    const name = await openDrawer();
    const stored = findCompany(COMPANY_ID);
    if (!stored) throw new Error("seed company missing");
    updateCompany(stored, { name: "Other" });

    await userEvent.clear(name);
    await userEvent.type(name, "Mine");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText(/Someone else changed this company/);

    fetchSpy.mockImplementation(async (input, init) =>
      !init?.method || init.method === "GET"
        ? Response.json({ detail: "boom" }, { status: 500 })
        : apiFetch(input, init),
    );
    await userEvent.click(screen.getByRole("button", { name: "Load latest" }));

    expect(await screen.findByText("Could not save. Try again.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Mine");
  });

  it("closes the dialog when the drawer is removed without close()", async () => {
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { unmount } = renderCompanies(`?company=${COMPANY_ID}`);
    expect((await screen.findByRole("dialog")).hasAttribute("open")).toBe(true);

    closeSpy.mockClear();
    unmount();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("shows a client error and sends no request for an empty name", async () => {
    const name = await openDrawer();

    await userEvent.clear(name);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findAllByText("Name is required")).not.toHaveLength(0);
    expect(name).toBeInvalid();
    expect(name).toHaveFocus();
    expect(patchCalls(fetchSpy)).toHaveLength(0);
  });

  // The client and server share one schema, so the server's 422 is forced with a canned response.
  it("shows an API 422 on its field", async () => {
    const name = await openDrawer();
    fetchSpy.mockImplementation((input, init) =>
      init?.method === "PATCH"
        ? Promise.resolve(
            Response.json(
              {
                detail: [
                  {
                    loc: ["body", "name"],
                    msg: "Name already taken",
                    type: "value_error",
                  },
                ],
              },
              { status: 422 },
            ),
          )
        : apiFetch(input, init),
    );

    await userEvent.type(name, " X");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name already taken")).toBeInTheDocument();
    expect(name).toBeInvalid();
  });

  it("does not close the dialog while typing", async () => {
    const name = await openDrawer();
    const dialog = screen.getByRole("dialog");
    const onClose = vi.fn();
    dialog.addEventListener("close", onClose);

    await userEvent.type(name, "abc");

    expect(dialog).toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();
  });
});
