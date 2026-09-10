import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Clear any existing user data
    await page.evaluate(() => localStorage.clear());
    // Navigate to the test page
    await page.click('button:has-text("User Test")');
    await expect(page.locator("h1")).toHaveText("User CRUD Test Page");
});

test.describe("User CRUD E2E", () => {
    test("creates a user and displays state", async ({ page }) => {
        await page.fill('input[name="firstName"]', "Alice");
        await page.selectOption('select[name="ageBucket"]', "AGE_20_22");
        await page.selectOption('select[name="gender"]', "FEMALE");
        await page.click('button[type="submit"]');

        const state = page.locator('[data-testid="user-state"]');
        await expect(state).toContainText('"firstName": "Alice"');
        await expect(state).toContainText('"ageBucket": "AGE_20_22"');
        await expect(state).toContainText('"gender": "FEMALE"');
        await expect(state).toContainText('"anonymousId"');
        await expect(state).toContainText('"health": 100');

        const log = page.locator('[data-testid="log"]');
        await expect(log).toContainText("Created user");
    });

    test("persists user across page refresh", async ({ page }) => {
        await page.fill('input[name="firstName"]', "Bob");
        await page.selectOption('select[name="ageBucket"]', "AGE_17_19");
        await page.selectOption('select[name="gender"]', "MALE");
        await page.click('button[type="submit"]');

        await expect(page.locator('[data-testid="user-state"]')).toContainText('"firstName": "Bob"');

        // Reload and go back to test page
        await page.reload();
        await page.click('button:has-text("User Test")');

        // User should persist — no create form, shows user state
        const state = page.locator('[data-testid="user-state"]');
        await expect(state).toContainText('"firstName": "Bob"');
    });

    test("updates user progression", async ({ page }) => {
        await page.fill('input[name="firstName"]', "Carol");
        await page.selectOption('select[name="ageBucket"]', "AGE_23_25");
        await page.selectOption('select[name="gender"]', "UNDISCLOSED");
        await page.click('button[type="submit"]');

        await page.click('button:has-text("Add Subject")');

        const state = page.locator('[data-testid="user-state"]');
        await expect(state).toContainText('"uncac"');

        const log = page.locator('[data-testid="log"]');
        await expect(log).toContainText('Added subject "uncac"');
    });

    test("cycles gracie mood", async ({ page }) => {
        await page.fill('input[name="firstName"]', "Dave");
        await page.selectOption('select[name="ageBucket"]', "AGE_20_22");
        await page.selectOption('select[name="gender"]', "MALE");
        await page.click('button[type="submit"]');

        // Default mood is "encouraging", cycling goes to "neutral"
        await page.click('button:has-text("Cycle Gracie Mood")');

        const state = page.locator('[data-testid="user-state"]');
        await expect(state).toContainText('"mood": "neutral"');
    });

    test("deletes user and shows create form", async ({ page }) => {
        await page.fill('input[name="firstName"]', "Eve");
        await page.selectOption('select[name="ageBucket"]', "AGE_17_19");
        await page.selectOption('select[name="gender"]', "FEMALE");
        await page.click('button[type="submit"]');

        await page.click('button:has-text("Delete User")');

        const state = page.locator('[data-testid="user-state"]');
        await expect(state).toHaveText("No user");

        // Create form should reappear
        await expect(page.locator('input[name="firstName"]')).toBeVisible();

        // Verify localStorage is cleared
        const stored = await page.evaluate(() =>
            localStorage.getItem("gracie_user")
        );
        expect(stored).toBeNull();
    });
});
