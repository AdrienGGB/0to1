# Today's Updates

Here is a recap of the changes made today:

- **Fixed Supabase Authentication:**
    - Corrected the `createPagesServerClient` call in all API routes.
    - Fixed the `supabaseAdmin` client initialization to use the correct environment variable.
    - Removed unnecessary `base64-` decoding.
    - Added a check for the `OPENROUTER_API_KEY`.

- **Improved Lesson Generation:**
    - Updated the lesson generation prompt to produce less dev-oriented content.
    - The prompt now includes the full course structure for better lesson alignment.
    - The `enhance-lesson` API route was updated to provide the course structure to the prompt.

- **Removed Magic Link:**
    - The magic link sign-in functionality was removed from the authentication page.

- **Fixed Course Page Loading:**
    - Correctly set `userId` in `localStorage` on authentication.

- **Fixed New Course Creation:**
    - Fixed authentication in the `generate-course` API route.