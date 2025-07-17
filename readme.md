Smart Complaint Box
A full-stack web application built with Next.js and Supabase that provides a secure and efficient platform for users to submit complaints and for administrators to manage them in real-time.

[Link to Live Demo] 👈 (You will add this link after we deploy the project)

Key Features
This project demonstrates a wide range of modern web development features:

📝 Secure Complaint Submission: A user-friendly, responsive form for submitting complaints, including optional file attachments (images or PDFs).

⚡ Real-time Admin Dashboard: A secure dashboard that displays new complaints the moment they are submitted, without needing to refresh the page, thanks to Supabase Realtime subscriptions.

🔐 Admin Authentication: The admin dashboard is protected by a secure login system using JWTs stored in httpOnly cookies.

📧 Email Notifications: Administrators receive an instant email notification for every new complaint submitted, sent via the Resend API.

📁 File Uploads & Storage: Users can attach files to their complaints, which are securely uploaded to and served from Supabase Storage.

📱 Fully Responsive Design: The user-facing form and the admin dashboard are designed to work flawlessly on desktop, tablet, and mobile devices.

🔍 Search & Filtering: The dashboard includes functionality to search all complaints and filter to show only unread ones.

💅 Modern UI: Built with Tailwind CSS and shadcn/ui for a clean, professional, and accessible user interface.

Tech Stack
Framework: Next.js (App Router)

Language: TypeScript

Backend & Database: Supabase (PostgreSQL, Auth, Storage, Realtime)

Styling: Tailwind CSS

UI Components: shadcn/ui

Email Service: Resend

Deployment: Vercel

Getting Started
To run this project on your local machine, follow these steps.

1. Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2. Install Dependencies
npm install

3. Set Up Environment Variables
Create a new file named .env.local in the root of your project and add the following variables. You will need to get these keys from your own Supabase and Resend accounts.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Admin Credentials & Session
ADMIN_EMAIL=the_email_to_receive_notifications
ADMIN_USERNAME=your_chosen_admin_username
ADMIN_PASSWORD=your_chosen_admin_password
SESSION_SECRET=a_random_string_of_at_least_32_characters

4. Run the Development Server
npm run dev

Open http://localhost:3000 with your browser to see the result.