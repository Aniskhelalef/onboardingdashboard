# Design System Style Guide

This document outlines the design system used in the SAAS Onboarding Dashboard.

## Color Palette

### Primary Colors
- **Couleur 1 (Dark/Black)**: `#2D2D2D`
  - Used for: Primary text, headings, primary buttons (filled state)

- **Couleur 2 (Coral/Orange)**: `#E07856`
  - Used for: Primary brand color, CTAs, active states, links, highlights
  - Light variant: `#E89478`
  - Dark variant: `#C5623E`

- **Couleur 3 (Light Gray)**: `#F5F5F5`
  - Used for: Backgrounds, inactive states, subtle borders

### Tailwind Classes
- `color-1`: Dark/Black
- `color-2`: Coral/Orange (Primary brand)
- `color-2-light`: Light coral
- `color-2-dark`: Dark coral
- `color-3`: Light gray

## Typography

### Font Sizes
| Element | Size | Tailwind Class | Usage |
|---------|------|----------------|--------|
| H1 | 20px | `text-xl` | Main page titles |
| H2 | 18px | `text-lg` | Section headings |
| H3 | 16px | `text-base` | Subsection headings, step indicators |
| Body | 14px | `text-sm` | Main content, paragraphs, descriptions |
| Small | 12px | `text-xs` | Labels, helper text, meta info |
| Caption | 10px | `text-[10px]` | Tiny labels, badges |

### Font Weights
- Regular: 400 (default)
- Medium: 500 (`font-medium`)
- Semibold: 600 (`font-semibold`)
- Bold: 700 (`font-bold`)

## Buttons

### Primary Button (Black Filled)
```html
<button class="btn-primary">Button Text</button>
```
- Background: `color-1` (#2D2D2D)
- Text: White
- Shape: Pill-shaped (`rounded-pill`)
- Padding: `px-6 py-2.5`
- Hover: 90% opacity

### Secondary Button (Coral Outlined)
```html
<button class="btn-secondary">Button Text</button>
```
- Background: White
- Border: 2px `color-2` (#E07856)
- Text: `color-2`
- Shape: Pill-shaped
- Hover: `color-3` background

### Tertiary Button (Light Gray)
```html
<button class="btn-tertiary">Button Text</button>
```
- Background: `color-3` (#F5F5F5)
- Text: `color-1`
- Shape: Pill-shaped
- Hover: Slightly darker gray

## Form Elements

### Text Inputs
```html
<input class="input-base" type="text" placeholder="Enter text" />
```
- Border: 1px gray-300
- Border Radius: `rounded-2xl`
- Padding: `px-4 py-2.5`
- Focus: 2px ring `color-2`

### Select Dropdowns
```html
<select class="input-base">
  <option>Option 1</option>
</select>
```
- Same styling as text inputs
- Add dropdown icon/chevron

### Checkboxes
```html
<input type="checkbox" class="checkbox-custom" />
```
- Size: 20px (w-5 h-5)
- Border: 2px gray-300
- Border Radius: `rounded` (small radius, not pill)
- Checked: `color-1` background
- Focus ring: `color-2`

### Radio Buttons
```html
<input type="radio" class="radio-custom" />
```
- Size: 20px (w-5 h-5)
- Border: 2px gray-300
- Checked: `color-1` fill
- Focus ring: `color-2`

## Tags & Badges

### Active Tag
```html
<span class="tag-active">ALL</span>
```
- Background: `color-2`
- Text: White
- Shape: Pill-shaped
- Font: `text-small` medium weight

### Inactive Tag
```html
<span class="tag-inactive">Tag</span>
```
- Background: `color-3`
- Text: gray-700
- Shape: Pill-shaped
- Hover: Slightly darker gray

## Cards

### Standard Card
```html
<div class="card">
  <!-- Content -->
</div>
```
- Background: White
- Border: 1px gray-100
- Border Radius: `rounded-2xl`
- Padding: `p-6`
- Shadow: `shadow-sm`

## Border Radius

### Standard Radiuses
- **Pill**: `rounded-pill` (9999px) - For buttons, tags, badges
- **Large**: `rounded-2xl` (16px) - For cards, inputs, containers
- **Medium**: `rounded-xl` (12px) - For smaller elements
- **Small**: `rounded` (4px) - For checkboxes

## Spacing

Follow consistent spacing scale:
- XS: 4px (1)
- SM: 8px (2)
- MD: 12px (3)
- LG: 16px (4)
- XL: 24px (6)
- 2XL: 32px (8)

## Icons

- Primary icon color: `color-2` for active/accent icons
- Secondary icon color: `color-1` for regular icons
- Tertiary icon color: gray-500 for muted icons
- Size: Generally 20px (w-5 h-5) or 24px (w-6 h-6)

## States

### Hover States
- Buttons: Slight opacity change or background color shift
- Links: Change to darker variant of `color-2`
- Cards: Subtle shadow increase

### Active States
- Background: `color-2` for primary actions
- Border: `color-2` border for selections
- Text: `color-2` for active navigation

### Disabled States
- Background: `color-3`
- Text: gray-400
- Cursor: not-allowed
- Opacity: 50%

## Transitions

All interactive elements should have smooth transitions:
```css
transition-all duration-300 ease-out
```

## Shadows

- **Small**: `shadow-sm` - For subtle elevation (cards at rest)
- **Medium**: `shadow` - For moderate elevation (cards on hover)
- **Large**: `shadow-md` - For prominent elevation (modals, dropdowns)

## Best Practices

1. **Consistency**: Always use the defined color classes (`color-1`, `color-2`, `color-3`)
2. **Accessibility**: Ensure sufficient color contrast (4.5:1 minimum)
3. **Spacing**: Use consistent spacing from the scale
4. **Typography**: Use semantic heading levels (h1-h4)
5. **Buttons**: Choose the appropriate button style based on hierarchy
6. **Border Radius**: Use pill shape for buttons/tags, rounded-2xl for containers
