import { expect, test } from "@playwright/test";
import { siteConfig } from "../src/config.js";

test("renders the landing page and Baby Hunch link", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "The Pikkewyn Case File" })).toBeVisible();
  await expect(page.locator(".site-shell")).toHaveAttribute("data-theme", siteConfig.theme);
  await expect(page.getByLabel("Reveal window").getByText("7-13 June 2026")).toBeVisible();
  await expect(page.getByRole("heading", { name: "One place for every suspicious update." })).toBeVisible();

  const babyPoolLink = page.getByRole("link", { name: "Join the Baby Pool" });
  await expect(babyPoolLink).toHaveAttribute(
    "href",
    "https://www.babyhunch.com/pool/P03162IR96EN"
  );
  await expect(babyPoolLink).toHaveAttribute("target", "_blank");
});

test("scrolls to the latest evidence section", async ({ page }) => {
  await page.goto("/");

  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "View the Latest Evidence" }).click();
  await expect(page.getByRole("heading", { name: "Chief Gender Security Officer" })).toBeInViewport();
  const after = await page.evaluate(() => window.scrollY);

  expect(after).toBeGreaterThan(before);
});

test("shows the gold fish speech bubble when clicked", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({
    content: ".gold-fish-button { animation: none !important; transform: translate3d(120px, 120px, 0) !important; }"
  });

  await expect(page.getByTestId("school-fish")).toHaveCount(24);
  await page.getByTestId("gold-fish").click();
  await expect(page.getByText("Ek is 'n normale vissie")).toBeVisible();
});
