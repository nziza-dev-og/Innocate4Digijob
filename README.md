# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This project relies on environment variables for Firebase configuration and other secrets.

1.  **Create a `.env` file:** Copy the `.env.example` file (if one exists) or create a new file named `.env` in the root of the project.
2.  **Add Firebase Credentials:** Populate the `.env` file with your Firebase project configuration details. You can find these in your Firebase project settings.
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

    # Add other secrets like the admin code
    NEXT_PUBLIC_ADMIN_SECRET_CODE=YOUR_ADMIN_SECRET_CODE
    ```
3.  **Deployment Environment Variables (IMPORTANT):**
    *   When deploying to platforms like Vercel, Netlify, or others, you **MUST** configure these same environment variables in your project settings on that platform.
    *   **For Vercel:** Go to your Project Settings -> Environment Variables and add each `NEXT_PUBLIC_...` variable with their corresponding values from your `.env` file.
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

This component displays a user-friendly error message when critical Firebase environment variables are missing. It checks for these variables on the client-side and renders an informative message instead of crashing the app.

**How it works:**
- The component checks if all `NEXT_PUBLIC_FIREBASE_...` variables are present in `process.env`.
- If any are missing, it displays an error overlay with instructions.
- It prevents the main application content (`children`) from rendering if there's a configuration error.

**Usage:**
The component wraps the main application layout in `src/app/layout.tsx`.

**To resolve the error:**
Follow the instructions in the "Environment Variables" section above to set up your `.env` file correctly, both locally and in your deployment environment.
