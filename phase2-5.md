## Feedback & Clarification Requests — Phase 2–5

### 1. **Interactivity in Static Markdown**

* The plan includes *"instant feedback"* and *"hidden answers"* for **Mini Practice** and **Knowledge Check**.
* Markdown by itself cannot provide this functionality — these require either:

  * A **frontend parser** that converts special syntax into interactive elements (accordion, reveal buttons, quizzes, etc.), or
  * Generation of **HTML/JS** alongside Markdown.
* Clarification needed: Should **Gemini CLI** generate only structured Markdown with special tags, or full interactive-ready HTML/JS blocks?

---

### 2. **Callouts (Tips, Pitfalls, Pro Tricks)**

* Current draft uses Markdown blockquotes (`>`), but these lack semantic meaning for advanced styling.
* Suggestion:

  * Adopt **custom fenced blocks** or **Admonition syntax** (if the Markdown renderer supports it), e.g.:

    ```md
    :::tip Pro Tip
    Always initialize variables before using them.
    :::

    :::warning Pitfall
    Avoid using mutable default arguments in Python functions.
    :::
    ```
* This will make rendering and styling more consistent.

---

### 3. **Lesson Generation Input Flow**

* The document states Gemini CLI will "generate a new lesson," but:

  * It’s unclear **how the user provides input** (raw topic? structured JSON? partial Markdown?).
  * Suggestion: Define a **standard prompt template** for lesson generation, so inputs are predictable and output remains consistent.

---

### 4. **Full Example with All Elements**

* The “short form” example is helpful but incomplete.
* Request: Include **one full-length lesson** showing:

  * Title, learning objectives
  * Multiple sections (content, examples, callouts)
  * At least one **Mini Practice** with “hidden answer”
  * One **Knowledge Check** with feedback
  * Code block that can be tested for correctness

---

### 5. **Executable Code Verification**

* The doc mentions verifying that example code runs without errors.
* Questions:

  * Will **Gemini CLI** run the code locally to check execution?
  * Or will we rely on a **testing script** that processes code blocks after generation?
  * This impacts whether code is generated blindly or tested before inclusion.

---

### **Summary**

The structure is strong, but **clarity is needed** on:

* How interactivity will be implemented and parsed.
* Whether Gemini CLI outputs plain structured Markdown or ready-to-use HTML/JS.
* The exact input format for generating lessons.
* Inclusion of one **full demo lesson**.
* The process for verifying executable code.


