import { expect, test } from "@playwright/test";

test("signup, search, shelve, read, rate, and share a public profile", async ({
  page,
}) => {
  const stamp = Date.now();
  const username = `reader${stamp}`;
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill("Test Reader");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(`${username}@example.com`);
  await page.getByLabel("Password").fill("strong-test-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/search");
  await page.getByRole("searchbox", { name: "Search books" }).fill("Test Book");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("heading", { name: "The Test Book" }),
  ).toBeVisible();
  await page.getByRole("heading", { name: "The Test Book" }).click();
  await expect(page).toHaveURL(/\/books\/OL123W/);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "The Test Book" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add book" }).click();
  await expect(page.getByRole("button", { name: "Move" })).toBeVisible();

  await page.goto("/shelves/want");
  await page.getByLabel("Shelf").selectOption("read");
  await page.getByRole("button", { name: "Move" }).click();
  await expect(
    page.getByRole("heading", { name: "The Test Book" }),
  ).toHaveCount(0);
  await page.goto("/shelves/read");
  await page.getByRole("heading", { name: "The Test Book" }).click();
  await page.getByLabel("Your rating").selectOption("5");
  await page.getByRole("button", { name: "Save rating" }).click();
  await page.goto(`/u/${username}`);
  await expect(
    page.getByRole("heading", { name: "The Test Book" }),
  ).toBeVisible();
  const csv = await page.request.get("/api/export");
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain("The Test Book");
  const feed = await page.request.get(`/u/${username}/feed.xml`);
  expect(feed.status()).toBe(200);
  expect(consoleErrors).toEqual([]);
});
