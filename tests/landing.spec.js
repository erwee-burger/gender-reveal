import { expect, test } from "@playwright/test";
import { siteConfig } from "../src/config.js";

const aggregateInsights = {
  total: 4,
  threshold: 3,
  visible: true,
  gender: [
    { value: "boy", label: "Boy", count: 3 },
    { value: "girl", label: "Girl", count: 1 }
  ],
  birthDates: [
    { value: "2026-06-08", label: "08 Jun", count: 2 },
    { value: "2026-06-10", label: "10 Jun", count: 2 }
  ],
  birthTimes: [
    { value: "night", label: "Night", count: 0 },
    { value: "morning", label: "Morning", count: 1 },
    { value: "afternoon", label: "Afternoon", count: 2 },
    { value: "evening", label: "Evening", count: 1 }
  ],
  weights: [
    { value: "under-2-5", label: "Under 2.5 kg", count: 0 },
    { value: "2-5-2-9", label: "2.5-2.9 kg", count: 1 },
    { value: "3-0-3-4", label: "3.0-3.4 kg", count: 2 },
    { value: "3-5-3-9", label: "3.5-3.9 kg", count: 1 },
    { value: "4-plus", label: "4.0 kg+", count: 0 }
  ],
  lengths: [
    { value: "50-51", label: "50-51.9 cm", count: 3 },
    { value: "52-53", label: "52-53.9 cm", count: 1 }
  ],
  hairColours: [
    { value: "brown", label: "Brown", count: 3 },
    { value: "blonde", label: "Blonde", count: 1 }
  ],
  eyeColours: [
    { value: "blue", label: "Blue", count: 2 },
    { value: "brown", label: "Brown", count: 2 }
  ],
  nameLetters: [
    { value: "P", label: "P", count: 2 },
    { value: "S", label: "S", count: 2 }
  ]
};

async function mockPredictionApi(page, insights = aggregateInsights) {
  await page.addInitScript((mockInsights) => {
    window.__PIKKEWYN_PREDICTION_API_MOCK__ = {
      getPredictionInsights: async () => ({ data: mockInsights, error: null }),
      predictionNameExists: async (name) => ({
        data: name.trim().toLowerCase() === "ouma sannie",
        error: null
      }),
      submitPrediction: async () => ({ error: null })
    };
  }, insights);
}

test("renders the landing page", async ({ page }) => {
  await mockPredictionApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "The Pikkewyn Case File" })).toBeVisible();
  await expect(page.locator(".site-shell")).toHaveAttribute("data-theme", siteConfig.theme);
  await expect(page.getByLabel("Reveal window").getByText("7-13 June 2026")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Guess Board" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One place for every suspicious update." })).toBeVisible();

});

test("scrolls to the latest evidence section", async ({ page }) => {
  await mockPredictionApi(page);
  await page.goto("/");

  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "View the Latest Evidence" }).click();
  await expect(page.getByRole("heading", { name: "Operation Sokkie Biltong" })).toBeInViewport();
  const after = await page.evaluate(() => window.scrollY);

  expect(after).toBeGreaterThan(before);
});

test("shows the gold fish speech bubble when clicked", async ({ page }) => {
  await mockPredictionApi(page);
  await page.goto("/");
  await page.addStyleTag({
    content: ".gold-fish-button { animation: none !important; transform: translate3d(120px, 120px, 0) !important; }"
  });

  await expect(page.getByTestId("school-fish")).toHaveCount(24);
  await page.getByTestId("gold-fish").click();
  await expect(page.locator(".fish-bubble.is-visible")).toBeVisible();
});

test("keeps detailed insights sealed until three guesses exist", async ({ page }) => {
  await mockPredictionApi(page, {
    ...aggregateInsights,
    total: 2,
    visible: false,
    gender: [],
    birthDates: [],
    birthTimes: [],
    weights: [],
    lengths: [],
    hairColours: [],
    eyeColours: [],
    nameLetters: []
  });
  await page.goto("/");

  const insights = page.getByTestId("prediction-insights");
  await expect(insights).toContainText("Total locked guesses");
  await expect(insights).toContainText("2");
  await expect(insights).toContainText("1 more guess needed");
  await expect(insights.getByRole("heading", { name: "Gender signal" })).toHaveCount(0);
});

test("shows anonymous aggregate charts without guest names", async ({ page }) => {
  await mockPredictionApi(page);
  await page.goto("/");

  const insights = page.getByTestId("prediction-insights");
  await expect(insights.getByRole("heading", { name: "Gender signal" })).toBeVisible();
  await expect(insights.getByText("Boy")).toBeVisible();
  await expect(insights.getByText("Girl")).toBeVisible();
  await expect(insights.getByRole("heading", { name: "Birth date window" })).toBeVisible();
  await expect(insights.getByRole("heading", { name: "Weight" })).toBeVisible();
  await expect(insights.getByRole("heading", { name: "Length" })).toBeVisible();
  await expect(insights.getByRole("heading", { name: "Hair colour" })).toBeVisible();
  await expect(insights.getByRole("heading", { name: "Name initial" })).toHaveCount(0);
  await expect(insights).not.toContainText("Secret Tester");
});

test("baby pool duplicate warning and submission use the prediction API wrapper", async ({ page }) => {
  await mockPredictionApi(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Kliek hier om te raai" }).click();
  await page.getByLabel("Your name").fill("Ouma Sannie");
  await expect(page.getByText('"Ouma Sannie" has already voted!')).toBeVisible();

  await page.getByLabel("Your name").fill("Secret Tester");
  await page.getByLabel("Boy").check();
  await page.getByLabel("Birth date").fill("2026-06-08");
  await page.getByLabel("Birth time").fill("14:30");
  await page.getByLabel("Weight (kg)").fill("3.2");
  await page.getByLabel("Length (cm)").fill("51");
  await page.getByLabel("Hair colour").selectOption("brown");
  await page.getByLabel("Eye colour").selectOption("blue");
  await page.getByLabel("Name's first letter").fill("P");
  await page.getByRole("button", { name: "Lock in my prediction" }).click();

  await expect(page.getByTestId("pool-confirmed")).toContainText("You're in, Secret Tester");
});
