import { expect, test, type Page } from "@playwright/test";

async function openMenu(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /je commence/ }).click();
  await expect(page.getByRole("heading", { name: "Sur quoi voulez-vous répondre ?" })).toBeVisible();
}

async function startSurvey(page: Page) {
  await openMenu(page);
  await page.getByRole("button", { name: "Tous les thèmes, mélangés" }).click();
  await expect(page.locator("article")).toBeVisible();
}

async function getDeckSize(page: Page): Promise<number> {
  const progress = await page.getByText(/^Carte \d+ sur \d+$/).innerText();
  return Number(progress.split(" sur ")[1]);
}

async function dragCard(page: Page, dx: number, dy: number) {
  // The previous card lingers during its exit animation; drag only once it is gone.
  await expect(page.locator("article")).toHaveCount(1);
  const box = await page.locator("article").boundingBox();
  if (!box) {
    throw new Error("No card on screen");
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 1; step <= 10; step++) {
    await page.mouse.move(x + (dx * step) / 10, y + (dy * step) / 10);
  }
  await page.mouse.up();
}

test("answers every card with gestures, buttons and keys, then thanks", async ({ page }) => {
  const answers: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/answers")) {
      answers.push((request.postDataJSON() as { answer: string }).answer);
    }
  });

  await startSurvey(page);
  const deckSize = await getDeckSize(page);

  await dragCard(page, 200, 0);
  await expect(page.getByText(`Carte 2 sur ${deckSize}`)).toBeVisible();
  await dragCard(page, 0, -200);
  await expect(page.getByText(`Carte 3 sur ${deckSize}`)).toBeVisible();
  await page.getByRole("button", { name: "Non", exact: true }).click();
  await expect(page.getByText(`Carte 4 sur ${deckSize}`)).toBeVisible();
  await page.keyboard.press("ArrowDown");

  for (let index = 4; index < deckSize; index++) {
    await expect(page.getByText(`Carte ${index + 1} sur ${deckSize}`)).toBeVisible();
    await page.getByRole("button", { name: "Oui", exact: true }).click();
  }

  await expect(page.getByRole("heading", { name: "Merci" })).toBeVisible();
  await expect.poll(() => answers.length).toBe(deckSize);
  expect(answers.slice(0, 4)).toEqual(["yes", "dont_know", "no", "prefer_not"]);
});

test("a short drag snaps back without answering", async ({ page }) => {
  await startSurvey(page);
  const deckSize = await getDeckSize(page);
  await dragCard(page, 40, 0);
  await expect(page.getByText(`Carte 1 sur ${deckSize}`)).toBeVisible();
});

async function answerDeck(page: Page): Promise<string[]> {
  const deckSize = await getDeckSize(page);
  const statements: string[] = [];
  for (let index = 0; index < deckSize; index++) {
    await expect(page.getByText(`Carte ${index + 1} sur ${deckSize}`)).toBeVisible();
    statements.push(await page.locator("article h2").last().innerText());
    await page.getByRole("button", { name: "Oui", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Merci" })).toBeVisible();
  return statements;
}

test("chains a new deck without repeating cards", async ({ page }) => {
  await startSurvey(page);
  const first = await answerDeck(page);
  expect(first).toHaveLength(12);
  await page.getByRole("button", { name: /Continuer/ }).click();
  const second = await answerDeck(page);
  expect(second.filter((statement) => first.includes(statement))).toEqual([]);
});

test("does not show answered cards again on the same device", async ({ page }) => {
  await startSurvey(page);
  await answerDeck(page);
  const continueButton = page.getByRole("button", { name: /Continuer/ });
  while (await continueButton.isVisible()) {
    await continueButton.click();
    await answerDeck(page);
  }
  await expect(page.getByText("Vous avez répondu à toutes les cartes disponibles.")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /je commence/ }).click();
  await expect(page.getByText(/déjà répondu à toutes les cartes/)).toBeVisible();
});

test("keeps the four answer buttons on screen on a small phone", async ({ page }) => {
  await startSurvey(page);
  for (const name of ["Non", "Oui", "Je ne sais pas", "Je préfère ne pas répondre"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  }
});

test("answers one picked theme and shows its progress", async ({ page }) => {
  const modes: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/answers")) {
      modes.push((request.postDataJSON() as { deckMode: string }).deckMode);
    }
  });

  await openMenu(page);
  await expect(page.getByText(/^0 carte répondue sur \d+$/)).toBeVisible();
  const theme = page.getByRole("button", { name: /^Logement/ });
  await expect(theme).toContainText("0 sur 3");
  await theme.click();

  const deckSize = await getDeckSize(page);
  expect(deckSize).toBe(3);
  for (let index = 0; index < deckSize; index++) {
    await expect(page.getByText(`Carte ${index + 1} sur ${deckSize}`)).toBeVisible();
    await expect(page.locator("article").last()).toContainText("Logement");
    await page.getByRole("button", { name: "Non", exact: true }).click();
  }

  await expect(page.getByText("Vous avez fait le tour du thème «\u00a0Logement\u00a0».")).toBeVisible();
  await expect.poll(() => modes).toEqual(["theme", "theme", "theme"]);

  await page.getByRole("button", { name: "Choisir un thème" }).click();
  await expect(page.getByText(/^3 cartes répondues sur \d+$/)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Logement/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /^Logement/ })).toContainText("Terminé");
});

test("records mixed decks as mixed and leaves a deck for the theme list", async ({ page }) => {
  const modes: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/answers")) {
      modes.push((request.postDataJSON() as { deckMode: string }).deckMode);
    }
  });

  await startSurvey(page);
  await page.getByRole("button", { name: "Oui", exact: true }).click();
  await expect(page.getByText(/^Carte 2 sur/)).toBeVisible();
  await page.getByRole("button", { name: "Thèmes" }).click();
  await expect(page.getByText(/^1 carte répondue sur \d+$/)).toBeVisible();
  await expect.poll(() => modes).toEqual(["mixed"]);
});
