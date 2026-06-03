import { test, expect } from "@playwright/test";
import { City } from "../src/models/City";
import * as cityService from "../src/services/cityService";

test.beforeEach(async ({ page })=>{
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());    
    await page.click('button:has-text("User Test")');
    await expect(page.locator("h1")).toHaveText("User CRUD Test Page");
});

test.describe("City CRUD E2E", () => {
    test('creates a city, saves city and gets the city', async ({ page }) => {

    await page.goto('http://umunu-kh777-77774-qaaca-cai.localhost:4943/');

    const city = cityService.createCity("Johannesburg");

    localStorage.setItem("city", JSON.stringify(city));

    const storedCity = JSON.parse(localStorage.getItem("city") || '{}');

    expect(storedCity.name).toBe("Johannesburg");
});
});

