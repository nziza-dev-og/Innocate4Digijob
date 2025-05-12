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

    # Genkit Google AI API Key (Needed for AI features)
    # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```
3.  **Deployment Environment Variables (IMPORTANT):**
    *   When deploying to platforms like Vercel, Netlify, or others, you **MUST** configure these same environment variables in your project settings on that platform.
    *   **For Vercel:** Go to your Project Settings -> Environment Variables and add each `NEXT_PUBLIC_...` variable and `GOOGLE_API_KEY` with their corresponding values from your `.env` file.
    *   **Failure to set these variables in your deployment environment will cause build errors (like `auth/invalid-api-key`) or runtime errors for Firebase and AI features.**

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

