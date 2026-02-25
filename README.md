# SAAS Onboarding Dashboard

A beautiful, interactive onboarding dashboard built with React and Tailwind CSS.

## Features

- **Step-by-Step Onboarding Flow**: Guide users through 5 comprehensive onboarding steps
- **Progress Tracking**: Visual progress bar showing completion percentage
- **Interactive UI**: Smooth animations and transitions
- **Responsive Design**: Works perfectly on all screen sizes
- **Customizable**: Easy to modify steps, colors, and content
- **Mock-Ready**: Perfect for prototyping and demos

## Onboarding Steps Included

1. **Create Your Profile** - Personal information setup
2. **Company Information** - Organization details
3. **Configure Preferences** - Customize experience and notifications
4. **Payment Setup** - Billing information
5. **Review & Launch** - Final review and account activation

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## Customization

### Modify Onboarding Steps

Edit the `onboardingSteps` array in [src/components/OnboardingDashboard.jsx](src/components/OnboardingDashboard.jsx):

```javascript
const onboardingSteps = [
  {
    id: 1,
    title: 'Your Step Title',
    description: 'Step description',
    icon: YourIcon,
    color: 'bg-blue-500',
    fields: [
      { label: 'Field Name', type: 'text', placeholder: 'Placeholder' }
    ]
  },
  // Add more steps...
]
```

### Change Color Scheme

Update colors in [tailwind.config.js](tailwind.config.js):

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Project Structure

```
├── src/
│   ├── components/
│   │   └── OnboardingDashboard.jsx    # Main dashboard component
│   ├── App.jsx                         # Root component
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Global styles
├── index.html                          # HTML template
├── tailwind.config.js                  # Tailwind configuration
├── vite.config.js                      # Vite configuration
└── package.json                        # Dependencies
```

## Mockup Features

This dashboard is designed to be easily mockupable:

- **Dummy Data Ready**: All fields use placeholder data
- **Visual Feedback**: Instant visual response to interactions
- **No Backend Required**: Fully functional without API calls
- **Demo Mode**: Perfect for presentations and prototypes

## Google Reviews Feature

Automatically scrape and display 5-star Google reviews on therapist websites.

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌───────────┐
│  Dashboard UI │────▶│  API Routes  │────▶│  Supabase │
│  (React)      │◀────│  (Next.js)   │◀────│  (Postgres)│
└──────────────┘     └──────┬───────┘     └───────────┘
                            │ async
                     ┌──────▼───────┐     ┌───────────┐
                     │  Scrape Job  │────▶│   Apify    │
                     │  (background)│◀────│  (scraper) │
                     └──────────────┘     └───────────┘
```

**Flow:** Therapist pastes Google Maps URL → API validates URL → background job calls Apify → 5-star reviews with text are filtered, sanitized, and stored → widget renders reviews on the public site.

### Key Files

| File | Purpose |
|------|---------|
| `src/services/googleReviews.js` | Apify scraper + URL validation + sanitization |
| `src/repositories/googleReviews.js` | Supabase data access layer |
| `src/jobs/scrapeReviews.js` | Background scrape pipeline |
| `src/components/GoogleReviewsSection.jsx` | Dashboard UI (connect/status/refresh) |
| `src/components/site-editor/GoogleReviewsWidget.jsx` | Public widget (carousel/grid + JSON-LD) |
| `supabase/migrations/001_google_reviews.sql` | Database schema |
| `supabase/seed_google_reviews.sql` | Dev seed data (15 sample reviews) |

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/therapist/reviews/connect` | `X-Therapist-Id` | Connect Google Maps URL, starts scraping |
| `POST` | `/api/therapist/reviews/refresh` | `X-Therapist-Id` | Refresh reviews (15-day cooldown) |
| `GET` | `/api/therapist/reviews` | `X-Therapist-Id` | Dashboard data (source + reviews + canRefresh) |
| `GET` | `/api/public/reviews/[therapistId]` | None | Public reviews for widget (1h cache) |

### Environment Variables

Add to `.env.local`:

```bash
APIFY_API_TOKEN=your_apify_token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup

1. Run `supabase/migrations/001_google_reviews.sql` in Supabase SQL Editor
2. (Optional) Run `supabase/seed_google_reviews.sql` for dev sample data

### Business Rules

- **Filter:** Only 5-star reviews with non-empty text are stored
- **Cap:** Maximum 15 reviews per therapist
- **Cooldown:** 15 days between refreshes
- **Rate limit:** 1 refresh request per 60 seconds (in-memory)
- **Sanitization:** All review text/names are stripped of HTML/XSS
- **SEO:** Widget emits JSON-LD `schema.org/Review` structured data

### Apify Pricing

~$0.55 per 1,000 reviews scraped. With the 15-day cooldown, cost per therapist is negligible.

### Running Tests

```bash
npx vitest run
```

64 tests across 4 files: URL validation, sanitization, filtering, cooldown logic, widget utilities, integration pipeline.

### Auth (TODO)

Currently uses a placeholder `X-Therapist-Id` header. Replace with real authentication (Supabase Auth, NextAuth, etc.) before production.

## License

MIT
