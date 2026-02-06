import { test, expect } from "@playwright/test";

test("carrega landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/StockFy/i);
});

test("página de entrar", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByPlaceholder("ID ou nome")).toBeVisible();
});
