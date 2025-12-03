# How to Enable Real-Time Emails (Gmail)

To send real emails to users (like "Forgot Password" links), you need to configure the server with a valid email account. The easiest way is to use a **Gmail App Password**.

## Step 1: Get a Gmail App Password
1.  Go to your [Google Account Settings](https://myaccount.google.com/).
2.  Navigate to **Security**.
3.  Under "How you sign in to Google", enable **2-Step Verification** if it's not already on.
4.  Once 2-Step Verification is on, search for **"App passwords"** in the search bar at the top (or look under 2-Step Verification settings).
5.  Create a new App Password:
    *   **App name**: SmartSpend
    *   Click **Create**.
6.  Copy the 16-character password generated (e.g., `abcd efgh ijkl mnop`).

## Step 2: Update your `.env` file
Open the file `d:\NARENDAR_Desktop\Projects\Project_app\server\.env` and add/update the following lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com  <-- Replace with your Gmail address
SMTP_PASSWORD=abcd efgh ijkl mnop  <-- Replace with the 16-char App Password
FROM_EMAIL=noreply@smartspend.com
FROM_NAME=SmartSpend
```

## Step 3: Restart the Server
After saving the `.env` file, the server needs to be restarted for changes to take effect.
I will handle the restart, or you can run `npm start` in the server directory.
