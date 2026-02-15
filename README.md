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

## License

MIT
