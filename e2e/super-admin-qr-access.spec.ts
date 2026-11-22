import { expect, test } from "@playwright/test";

const email = process.env.E2E_SUPER_ADMIN_EMAIL;
const password = process.env.E2E_SUPER_ADMIN_PASSWORD;

test.describe("Super Admin QR report access", () => {
  test.skip(!email || !password, "Set E2E_SUPER_ADMIN_EMAIL and E2E_SUPER_ADMIN_PASSWORD to run this test.");

  test("requires confirmation and preserves the setting after cancel", async ({ page }) => {
    await page.goto("/");
    const introContinue = page.getByRole("button", { name: "Continue to login" });
    if (await introContinue.isVisible().catch(() => false)) await introContinue.click();

    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/portal/);

    await page.goto("/portal?view=settings");
    await expect(page.getByRole("heading", { name: "Role-group access" })).toBeVisible();
    await expect(page.getByText("Only the Super Admin can control whether families can open reports using a QR code or link.")).toBeVisible();

    const lock = page.getByRole("radio", { name: /Lock public reports/ });
    const unlock = page.getByRole("radio", { name: /Unlock public reports/ });
    const unlockAll = page.getByRole("button", { name: "Unlock all public reports" });
    await expect(lock).toBeVisible();
    await expect(unlock).toBeVisible();
    await expect(unlockAll).toBeVisible();

    const initiallyUnlocked = await unlock.isChecked();
    const target = initiallyUnlocked ? lock : unlock;
    const original = initiallyUnlocked ? unlock : lock;
    if (initiallyUnlocked) {
      await target.check();
      await page.getByRole("button", { name: "Save role-group access" }).click();
    } else {
      await unlockAll.click();
    }
    const dialog = page.getByRole("dialog", { name: "Confirm role-group access changes" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/No learner records, report cards, or learner QR codes will be deleted/)).toBeVisible();
    const visibleChangeCount = await dialog.locator("li").count();
    expect(visibleChangeCount).toBeGreaterThan(0);
    expect(visibleChangeCount).toBeLessThanOrEqual(6);
    await expect(dialog.getByRole("button", { name: "Confirm and save" })).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(original).toBeChecked();

    if (initiallyUnlocked) {
      await target.check();
      await page.getByRole("button", { name: "Save role-group access" }).click();
    } else {
      await unlockAll.click();
    }
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirm and save" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("Role-group viewing and download permissions saved.")).toBeVisible();
    await page.reload();
    await expect(target).toBeChecked();

    // Restore the persisted setting so this test is safe to run against a shared school environment.
    await original.check();
    await page.getByRole("button", { name: "Save role-group access" }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirm and save" }).click();
    await expect(page.getByText("Role-group viewing and download permissions saved.")).toBeVisible();
    await page.reload();
    await expect(original).toBeChecked();
  });
});
