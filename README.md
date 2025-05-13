# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This project relies on environment variables for Firebase configuration and other secrets.

1.  **Create a `.env.local` file:** Copy the `.env.example` file (if one exists, otherwise create a new file) and rename it to `.env.local` in the root of the project. This file is for local development and should not be committed to version control.
2.  **Add Firebase Credentials & Admin Code:** Populate the `.env.local` file with your Firebase project configuration details and the admin secret code. You can find Firebase credentials in your Firebase project settings.
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_ADMIN_SECRET_CODE=YOUR_ADMIN_SECRET_CODE
    ```
3.  **Deployment Environment Variables (IMPORTANT):**
    *   When deploying to platforms like Vercel, Netlify, or others, you **MUST** configure these same environment variables in your project settings on that platform.
    *   **For Vercel:** Go to your Project Settings -> Environment Variables and add each `NEXT_PUBLIC_...` variable with their corresponding values from your `.env.local` file.
    *   **Failure to set these variables in your deployment environment will cause build errors (like `auth/invalid-api-key`) or runtime errors for Firebase.**

## Running Locally

```bash
npm run dev
```

This will start the development server, typically on `http://localhost:9002`.

## Building for Production

```bash
npm run build
```

This command builds the application for production usage. Ensure your environment variables are correctly set up before building.

## Configuration Error Component (`src/components/config-error.tsx`)

This component displays a user-friendly error message when critical Firebase or application environment variables are missing. It checks for these variables on the client-side and renders an informative message instead of crashing the app.

**How it works:**
- The component checks if all `NEXT_PUBLIC_FIREBASE_...` variables and `NEXT_PUBLIC_ADMIN_SECRET_CODE` are present in `process.env`.
- If any are missing, it displays an error overlay with instructions.
- It prevents the main application content (`children`) from rendering if there's a configuration error.

**Usage:**
The component wraps the main application layout in `src/app/layout.tsx`.

**To resolve the error:**
Follow the instructions in the "Environment Variables" section above to set up your `.env.local` file correctly for local development, and ensure they are also set in your deployment environment.
