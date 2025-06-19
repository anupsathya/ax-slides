# 🛠️ ax-slides — Weekly Meeting Slide Management Tool

**ax-slides** is a Next.js web application that streamlines weekly research lab meetings by offering a clean web interface for accessing Google Slides and a backend system for archiving and rotating slide decks automatically.

---

## 🚀 Features

- ✅ Simple two-button UI:
  - **"Add Slides"** – Opens the editable slide deck for the current week
  - **"Present"** – Opens the deck in fullscreen presentation mode
- ✅ Automated archiving with a single click or scheduled job
- ✅ Uses Google Slides API to:
  - Copy slides from the "Current" deck to an "Archive" deck
  - Clear the "Current" deck (preserving a blank/template slide)
- ✅ Built with scalability and maintainability in mind
- ✅ Designed for low-friction use during in-person lab meetings

---

## 🗂️ Project Structure

```markdown

ax-slides/
├── pages/
│   ├── index.tsx            # Web interface
│   ├── \_app.tsx             # App wrapper
│   └── api/
│       └── archive.ts       # Serverless archive logic
├── styles/
│   ├── Home.module.css      # Button and layout styles
│   └── globals.css          # Global styles
├── public/                  # Static assets (if needed)
└── package.json             # Dependencies and scripts

```

---

## ⚙️ Technologies Used

- **Frontend**: Next.js, React, TypeScript, CSS Modules
- **Backend**: Vercel serverless functions (`pages/api/archive.ts`)
- **Google Integration**: Slides API, Drive API via service account
- **Deployment**: Vercel

---

## 🔐 Required Environment Variables

Set these variables in Vercel or a local `.env.local` file:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON stringified credentials of the Google service account |
| `CURRENT_SLIDES_ID` | File ID of the "Lab Meeting – Current" Google Slides deck |
| `ARCHIVE_SLIDES_ID` | File ID of the "Lab Meeting Archive" Google Slides deck |

### 📝 How to Find a Slide ID:

From the URL:

```markdown

[https://docs.google.com/presentation/d/FILE\_ID\_HERE/edit](https://docs.google.com/presentation/d/FILE_ID_HERE/edit)

```

---

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/your-org/ax-slides.git
cd ax-slides
npm install
````

### 2. Set up Google Cloud Service Account

- Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Create a new project
- Enable the **Google Slides API** and **Drive API**
- Create a **service account** and download its JSON key
- Share both Slides decks with the service account email as **Editor**
- Stringify the JSON and set it in your `.env.local`:

  ```env
  GOOGLE_SERVICE_ACCOUNT_KEY={ ...stringified JSON... }
  ```

### 3. Add Slide IDs

```env
CURRENT_SLIDES_ID=your_current_deck_id
ARCHIVE_SLIDES_ID=your_archive_deck_id
```

---

## 🧪 Development & Testing

To run locally:

```bash
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

To manually trigger archiving:

```bash
curl -X POST http://localhost:3000/api/archive
```

---

## 🧩 Extending Functionality

This project is designed to be modular. Future features might include:

* ✅ **Slack Notifications** — Notify a lab channel after archiving
* ✅ **Scheduled Archiving** — Use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
* ✅ **Admin Access Control** — Add secret headers or user auth
* ✅ **Slide Timestamping** — Add a title slide marking the archive date
* ✅ **Error Logging** — Add Sentry, Logtail, or file-based logs

---

## 📅 Scheduled Archiving (Optional)

Create a Vercel Cron Job to auto-run every Monday:

```json
{
  "schedule": "0 8 * * 1",
  "path": "/api/archive"
}
```

---

## 🧼 Archive Function Logic

In `pages/api/archive.ts`, the following happens:

1. Authenticate with Google using a service account
2. Fetch all slides from the **Current** deck
3. Use `importSlides` to append them to the **Archive** deck
4. Delete all slides from **Current**, except the template if needed
5. Return `200 OK` on success or detailed error if failed

---

## 📜 License

MIT — freely usable and modifiable. Please credit if forked.

---

## 👋 Maintainers & Handoff

- Built by: Anup Sathya
- Easy to hand off by updating:
  - `GOOGLE_SERVICE_ACCOUNT_KEY`
  - Slide sharing permissions
  - Vercel project ownership

---
