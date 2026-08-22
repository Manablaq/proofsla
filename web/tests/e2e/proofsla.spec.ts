import { expect, test, type Page } from "@playwright/test";

const client = "0x5bb49021001200fe8156a81c7fcf097e535e7181";
const provider = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

function sla(overrides: Record<string, string> = {}) {
  return {
    id: "4",
    client,
    provider,
    serviceDescription: "ProofSLA Bradbury validator adjudication test",
    requirements:
      "The provider must return HTTP 200 and the response body must contain the exact text PROOFSLA_ADJUDICATION_OK.",
    minorProviderBps: "8000",
    majorProviderBps: "2000",
    maxEvidenceAgeSeconds: "86400",
    escrowAmount: "10000000000000000",
    state: "RESOLVED",
    primaryEvidenceUrl: "https://example.com/primary.txt",
    primaryEvidenceSha256: "a".repeat(64),
    corroborationUrl: "https://example.com/corroboration.txt",
    corroborationSha256: "b".repeat(64),
    evidenceObservedAt: "1787352600",
    createdAt: "2026-08-21T22:48:00+00:00",
    acceptedAt: "2026-08-21T22:50:00+00:00",
    completedAt: "2026-08-21T22:57:00+00:00",
    resolvedAt: "2026-08-21T23:01:00+00:00",
    verdict: "MET",
    evidenceStatus: "CORROBORATED",
    providerAward: "10000000000000000",
    clientAward: "0",
    reason:
      "Both evidence records confirm HTTP 200 and PROOFSLA_ADJUDICATION_OK.",
    ...overrides,
  };
}

async function mockDashboard(
  page: Page,
  options: { account?: string; state?: string; claimable?: string } = {},
) {
  const account = options.account ?? provider;
  const state = options.state ?? "RESOLVED";
  const claimable = options.claimable ?? "20000000000000000";

  await page.addInitScript(
    ({ walletAccount }) => {
      const listeners = new Map<string, Array<(payload: unknown) => void>>();

      window.ethereum = {
        async request({ method }) {
          if (method === "eth_accounts") return [];
          if (method === "eth_requestAccounts") return [walletAccount];
          if (method === "eth_chainId") return "0x107d";
          if (
            method === "wallet_switchEthereumChain" ||
            method === "wallet_addEthereumChain"
          ) {
            return null;
          }
          throw new Error(`Unexpected wallet RPC method in test: ${method}`);
        },
        on(event, listener) {
          listeners.set(event, [...(listeners.get(event) ?? []), listener]);
        },
        removeListener(event, listener) {
          listeners.set(
            event,
            (listeners.get(event) ?? []).filter((item) => item !== listener),
          );
        },
      };
    },
    { walletAccount: account },
  );

  await page.route("**/api/proofsla/dashboard**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: "4",
        slas: [sla({ state })],
        claimable,
      }),
    });
  });
}

test("landing page has theme control and app entry", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Service promises/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch ProofSLA" }).first()).toBeVisible();

  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(html).toHaveClass(/dark/);

  await page.getByRole("link", { name: "Launch ProofSLA" }).first().click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("heading", { name: "Your agreements" }),
  ).toBeVisible();
});

test("create SLA form starts with blank escrow and accessible labels", async ({
  page,
}) => {
  await mockDashboard(page);
  await page.goto("/app");

  await page.getByRole("button", { name: "Create SLA" }).first().click();

  await expect(
    page.getByRole("heading", { name: "Create a service SLA" }),
  ).toBeVisible();
  await expect(page.getByLabel("Provider address")).toBeVisible();
  await expect(page.getByLabel("Measurable requirements")).toBeVisible();
  await expect(page.getByLabel("Escrow (GEN)")).toHaveValue("");
  await expect(page.getByLabel("Evidence freshness (hours)")).toHaveValue("24");
});

test("wallet connection loads provider SLA and claimable balance", async ({
  page,
}) => {
  await mockDashboard(page, {
    account: provider,
    state: "RESOLVED",
    claimable: "20000000000000000",
  });
  await page.goto("/app");

  await page.getByRole("button", { name: "Connect wallet" }).first().click();

  await expect(page.getByText("0xf39f…2266")).toBeVisible();
  await expect(page.getByText("0.02 GEN").first()).toBeVisible();
  await expect(page.getByText("RESOLVED").first()).toBeVisible();
  await expect(page.getByText("PROVIDER").first()).toBeVisible();
  await expect(page.getByText("CORROBORATED").first()).toBeVisible();
});

test("completed client SLA makes adjudication the primary action", async ({
  page,
}) => {
  await mockDashboard(page, {
    account: client,
    state: "COMPLETED",
    claimable: "0",
  });
  await page.goto("/app");

  await page.getByRole("button", { name: "Connect wallet" }).first().click();

  await expect(
    page.getByRole("button", { name: "Adjudicate with validators" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Accept without review" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Direct acceptance skips validator review/i),
  ).toBeVisible();
});

test.describe("mobile landing", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile navigation opens without horizontal overflow", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(
      page.getByRole("link", { name: "How it works", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Launch app", exact: true }),
    ).toBeVisible();

    const bodyWidth = await page.locator("body").evaluate((body) => body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
