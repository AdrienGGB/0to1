import { readFileSync } from "node:fs";

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

function cardKey(themeFile: string, cardId: string): string {
  const { cards } = JSON.parse(readFileSync(`content/cards/${themeFile}.json`, "utf8")) as {
    cards: { id: string; version: number }[];
  };
  const card = cards.find((candidate) => candidate.id === cardId)!;
  return `${card.id}@${card.version}`;
}

async function seedAnswers(page: Page, answers: Record<string, string>) {
  await page.addInitScript((seeded) => {
    if (!window.sessionStorage.getItem("seeded")) {
      window.localStorage.setItem("requete.answered.v1", JSON.stringify(Object.keys(seeded)));
      window.localStorage.setItem("requete.answers.v1", JSON.stringify(seeded));
      window.sessionStorage.setItem("seeded", "1");
    }
  }, answers);
}

test("summarises the person's own answers and compares above the threshold", async ({ page }) => {
  const needKey = cardKey("logement", "logement-cout-difficulte");
  const otherNeedKey = cardKey("sante", "sante-renoncement-non");
  await seedAnswers(page, {
    [cardKey("logement", "logement-priorite-haute")]: "yes",
    [needKey]: "yes",
    [otherNeedKey]: "no",
    [cardKey("solidarites", "solidarites-solitude-difficulte")]: "no",
  });
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      json: {
        cards: {
          [needKey]: {
            total: 1240,
            counts: { yes: 720, no: 372, dont_know: 99, prefer_not: 49 },
            since: "2026-10-20T08:00:00Z",
          },
        },
        message: null,
      },
    }),
  );

  await openMenu(page);
  await page.getByRole("button", { name: "Voir mon bilan" }).click();
  await expect(page.getByRole("heading", { name: "Votre bilan" })).toBeVisible();
  await expect(page.getByText(/^Vous avez répondu à 4 cartes\./)).toBeVisible();

  const priorities = page.getByRole("region", { name: "Les thèmes qui comptent pour vous" });
  await expect(priorities.getByRole("listitem")).toHaveText(["Logement"]);

  const needs = page.getByRole("region", { name: /peuvent indiquer une difficulté/ });
  await expect(needs.getByRole("listitem").filter({ has: page.locator("p.font-medium") })).toHaveCount(2);
  await expect(needs).toContainText("Coût du logement");
  await expect(needs).toContainText("1 240 réponses");
  await expect(needs).toContainText("Oui 58 %");
  await expect(needs).toContainText("Renoncement aux soins pour raisons financières");
  await expect(needs).toContainText("Pas encore assez de réponses pour comparer");
  await expect(needs).not.toContainText("Solitude");
});

test("sends one priority message of up to three themes", async ({ page }) => {
  await seedAnswers(page, { [cardKey("logement", "logement-adapte")]: "yes" });
  const messages: unknown[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/messages")) {
      messages.push(request.postDataJSON());
    }
  });

  await openMenu(page);
  await page.getByRole("button", { name: "Voir mon bilan" }).click();
  const send = page.getByRole("button", { name: "Envoyer mes choix" });
  await expect(send).toBeDisabled();
  for (const theme of ["Logement", "Santé", "Solidarités"]) {
    await page.getByRole("button", { name: theme, exact: true }).click();
  }
  await expect(page.getByRole("button", { name: "Numérique", exact: true })).toBeDisabled();
  await send.click();

  await expect(page.getByText(/^Vos choix sont enregistrés, de façon anonyme/)).toContainText(
    "Logement, Santé, Solidarités",
  );
  expect(messages).toHaveLength(1);
  expect(messages[0]).toMatchObject({
    choice: "themes",
    themeIds: ["logement", "sante", "solidarites"],
    displaySeed: expect.any(Number),
  });

  await page.reload();
  await openMenu(page);
  await page.getByRole("button", { name: "Voir mon bilan" }).click();
  await expect(page.getByRole("button", { name: "Envoyer mes choix" })).toHaveCount(0);
});

test("clears the device after confirmation", async ({ page }) => {
  await seedAnswers(page, { [cardKey("logement", "logement-adapte")]: "yes" });
  await openMenu(page);
  await page.getByRole("button", { name: "Voir mon bilan" }).click();
  await page.getByRole("button", { name: "Effacer mes réponses de cet appareil" }).click();
  await page.getByRole("button", { name: "Effacer", exact: true }).click();
  await expect(page.getByText(/^0 carte répondue sur \d+$/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Voir mon bilan" })).toHaveCount(0);
});

test("shows the full distribution of the priority question past the threshold", async ({ page }) => {
  await seedAnswers(page, { [cardKey("logement", "logement-adapte")]: "yes" });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "requete.message.v1",
      JSON.stringify({ choice: "themes", themeIds: ["logement"] }),
    );
  });
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      json: {
        cards: {},
        message: {
          total: 250,
          counts: { logement: 100, sante: 60, dont_know: 20 },
          since: "2026-10-20T08:00:00Z",
        },
      },
    }),
  );

  await openMenu(page);
  await page.getByRole("button", { name: "Voir mon bilan" }).click();
  const message = page.getByRole("region", { name: "Votre message" });
  await expect(message).toContainText("Sur cette question, 250 réponses");
  await expect(message).toContainText("le total dépasse 100 %");
  await expect(message).toContainText("Logement : choisi dans 40 % des réponses à cette question");
  await message.getByText("Voir tous les thèmes").click();
  await expect(message.getByText("Santé : 24 %")).toBeVisible();
  await expect(message.getByText("Numérique : 0 %")).toBeVisible();
  await expect(message.getByText("Je ne sais pas : 8 %")).toBeVisible();
});
