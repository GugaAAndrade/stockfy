import { test, expect } from "@playwright/test";

const bypassEnabled = process.env.NEXT_PUBLIC_BILLING_BYPASS === "1";

test.describe("fluxo principal", () => {
  test.skip(!bypassEnabled, "Defina NEXT_PUBLIC_BILLING_BYPASS=1 no servidor para rodar o fluxo.");

  test("cadastro -> login -> CRUD produto", async ({ page }) => {
    const suffix = Date.now();
    const tenantSlug = `e2e-${suffix}`;
    const tenantName = `Empresa E2E ${suffix}`;
    const name = `Usuario E2E ${suffix}`;
    const email = `e2e-${suffix}@stockfy.test`;
    const password = `Teste@${suffix}`;
    const categoryName = `Categoria ${suffix}`;
    const productName = `Produto ${suffix}`;
    const updatedName = `Produto Atualizado ${suffix}`;

    await page.goto("/cadastro?plan=starter");
    await page.getByPlaceholder("Seu nome").fill(name);
    await page.getByPlaceholder("Nome da empresa").fill(tenantName);
    await page.getByPlaceholder("ex: acme").fill(tenantSlug);
    await page.getByPlaceholder("voce@email.com").fill(email);
    await page.getByPlaceholder("Crie uma senha").fill(password);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(new RegExp(`/app/${tenantSlug}`));

    await page.goto(`/app/${tenantSlug}/produtos`);
    await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();

    const categoryForm = page.getByPlaceholder("Nome da categoria");
    await categoryForm.fill(categoryName);
    await page.getByRole("button", { name: "Adicionar categoria" }).click();
    await expect(page.getByText(categoryName)).toBeVisible();

    const createSection = page.getByRole("heading", { name: "Cadastrar Produto" }).locator("..");
    await createSection.getByPlaceholder("Nome").fill(productName);
    await createSection.getByRole("combobox").selectOption({ label: categoryName });
    await createSection.getByPlaceholder("Preço").fill("10");
    await createSection.getByPlaceholder("Estoque").fill("5");
    await createSection.getByPlaceholder("Estoque mínimo").fill("1");
    await createSection.getByRole("button", { name: "Salvar Produto" }).click();
    await expect(page.getByText(productName).first()).toBeVisible();

    const productRow = page.locator("tr", { hasText: productName });
    await productRow.hover();
    await productRow.getByRole("button", { name: "Editar" }).click();

    const modal = page.getByRole("heading", { name: "Editar Produto" }).locator("..");
    await modal.getByPlaceholder("Nome").fill(updatedName);
    await modal.getByRole("button", { name: "Atualizar Produto" }).click();
    await expect(page.getByText(updatedName).first()).toBeVisible();

    const updatedRow = page.locator("tr", { hasText: updatedName });
    await updatedRow.hover();
    await updatedRow.getByRole("button", { name: "Excluir" }).click();
    await page.getByRole("button", { name: "Excluir mesmo assim" }).click();
    await expect(page.getByText(updatedName)).toHaveCount(0);

    await page.goto(`/app/${tenantSlug}`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Atividades Recentes")).toBeVisible();

    await page.goto(`/app/${tenantSlug}/movimentacoes`);
    await expect(page.getByRole("heading", { name: "Movimentações" })).toBeVisible();

    await page.goto(`/app/${tenantSlug}/notificacoes`);
    await expect(page.getByRole("heading", { name: "Notificações" })).toBeVisible();

    await page.goto(`/app/${tenantSlug}/auditoria`);
    await expect(page.getByRole("heading", { name: "Auditoria" })).toBeVisible();
  });
});
