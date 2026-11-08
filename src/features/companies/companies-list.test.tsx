import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCompanies } from "@/server/companies/store";
import { stubApiFetch } from "@/test/api-fetch";
import { renderCompanies } from "@/test/render-companies";

function bodyRows() {
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

describe("companies list", () => {
  beforeEach(() => {
    resetCompanies();
    stubApiFetch();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("search filters the rows and writes q to the URL", async () => {
    const onUrlUpdate = vi.fn();
    renderCompanies("", onUrlUpdate);
    await screen.findAllByRole("button", { name: /^(Acme|Fjord)/ });

    await userEvent.type(screen.getByLabelText("Search companies"), "fjord");

    await vi.waitFor(() => expect(bodyRows()).toHaveLength(5));
    expect(bodyRows().every((row) => /Fjord/.test(row.textContent ?? ""))).toBe(true);
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: expect.stringContaining("q=fjord") }),
    );
  });

  it("status filter narrows the rows and resets the page", async () => {
    const onUrlUpdate = vi.fn();
    renderCompanies("?page=2", onUrlUpdate);
    await screen.findAllByText("21-40 of 40");

    await userEvent.selectOptions(screen.getByLabelText("Status"), "qualified");

    await screen.findAllByText("1-8 of 8");
    expect(bodyRows()).toHaveLength(8);
    const { queryString } = onUrlUpdate.mock.lastCall?.[0] ?? { queryString: "" };
    expect(queryString).toContain("status=qualified");
    expect(queryString).not.toContain("page=");
  });

  it("keeps the same table element across a filter change", async () => {
    renderCompanies();
    const table = await screen.findByRole("table");
    await screen.findAllByText("1-20 of 40");

    await userEvent.selectOptions(screen.getByLabelText("Status"), "rejected");
    await screen.findAllByText("1-8 of 8");

    expect(screen.getByRole("table")).toBe(table);
  });

  it("shows the empty state when nothing matches", async () => {
    renderCompanies("?q=zzzz");
    expect(await screen.findByText("No companies match your filters.")).toBeInTheDocument();
  });
});
