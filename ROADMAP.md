# Project Roadmap

This document outlines the plan to stabilize the `dev` branch, merge it into `main`, implement authentication, and prepare for deployment.

## Phase 1: Stabilize `dev` Branch (Lesson Enhancement)

**Objective:** Fix all issues related to the "Lesson Enhancement" feature.

1.  **Investigate UI Refresh Bug:**
    *   Analyze `frontend/pages/api/enhance-lesson.ts`.
    *   Examine frontend components (`Lesson.js`, `LessonContentRenderer.js`) to understand state management and data fetching after the enhancement call.
    *   Identify and fix the root cause of the UI not updating correctly.

2.  **Investigate Content Quality Issue:**
    *   Review the logic in `enhance-lesson.ts` and the associated LLM prompt.
    *   Add temporary logging to inspect the raw AI model output to find the source of the content issues.
    *   Refine the prompt or the data processing logic to improve the quality of the enhanced content.

3.  **Verification:**
    *   Thoroughly test the "Enhance Lesson" feature to confirm both the UI refresh and content quality issues are resolved.

## Phase 2: Merge, Authenticate, and Secure

**Objective:** Merge the stable `dev` branch into `main`, implement user authentication, and secure the data.

1.  **Merge `dev` into `main`:**
    *   After Phase 1 is complete and `dev` is stable, I will check out the `main` branch and merge `dev` into it.

2.  **Implement Supabase Authentication:**
    *   Integrate Supabase Auth helpers (`@supabase/auth-helpers-nextjs`) into the frontend.
    *   Create UI components for user sign-up, sign-in, and sign-out.
    *   Protect sensitive pages and API routes, requiring authentication.

3.  **Create Admin Account:**
    *   A specific user account will be designated for admin purposes. This can be achieved by creating a custom claim or a separate `profiles` table with a `role` column. This will provide you with an easy way to log in and manage the application.

4.  **Implement Row Level Security (RLS):**
    *   Define and apply RLS policies to all relevant Supabase tables to ensure users can only access their own data.
    *   These policies will be scripted and saved as new SQL migration files in `backend/supabase/migrations/`.

## Phase 3: Deployment

**Objective:** Deploy the application to Vercel.

1.  **Configure Environment:**
    *   Ensure all necessary environment variables (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`) are documented in `.env.example` and configured in the Vercel project settings.

2.  **Deploy & Verify:**
    *   Trigger a deployment on Vercel.
    *   Perform post-deployment checks to ensure all features, including authentication and lesson generation, are working correctly on the live environment.
