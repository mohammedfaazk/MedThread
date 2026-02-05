# MedThread Design System

## Design Philosophy

MedThread's design reflects:
- **Calmness**: Soothing colors and generous spacing
- **Clinical Trust**: Professional, credible appearance
- **High Clarity**: Clear information hierarchy
- **Low Cognitive Overload**: Simple, focused interfaces
- **Human Warmth**: Approachable and supportive

## Color Palette

### Primary Colors
```css
--color-white: #FFFFFF
--color-medical-orange: #FF8C42
--color-light-orange: #FFF3E8
--color-trust-blue: #2F6FED
--color-success-green: #2AA876
--color-alert-red: #E5484D
```

### Usage
- **Medical Orange**: Primary actions, doctor badges, highlights
- **Light Orange**: Backgrounds, surfaces, subtle emphasis
- **Trust Blue**: Secondary actions, informational elements
- **Success Green**: Positive feedback, recovery indicators
- **Alert Red**: Warnings, emergency alerts

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Inter', sans-serif;
```

### Scale
- **Large Title**: 28px / 1.75rem
- **Section Heading**: 22px / 1.375rem
- **Body Text**: 16px / 1rem
- **Medical Data Labels**: 14px / 0.875rem
- **Small Text**: 12px / 0.75rem

### Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System

8px grid system:
```
xs: 8px
sm: 16px
md: 24px
lg: 32px
xl: 48px
xxl: 64px
```

## Border Radius
- Default: 16px
- Pills/Badges: 999px (fully rounded)
- Small elements: 8px

## Shadows

### Card Shadow
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

### Elevated Shadow
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
```

## Components

### Post Card
- Background: White
- Border Radius: 16px
- Padding: 24px
- Shadow: Card shadow
- Hover: Slight elevation increase

### Thread Reply
- Doctor replies: Orange background (#FFF3E8)
- Regular replies: White background
- Border: 2px solid for doctors, 1px for others
- Nested indicator: Left border line

### Symptom Tag
- Padding: 6px 12px
- Border Radius: 999px (pill)
- Background: Light orange (#FFF3E8)
- Text: Medical orange (#FF8C42)

### Doctor Badge
- Border: 2px solid orange
- Background: White
- Icon: Checkmark in orange circle
- Reputation score displayed

### Buttons

#### Primary
```css
background: #FF8C42
color: white
padding: 12px 24px
border-radius: 999px
```

#### Secondary
```css
background: transparent
border: 2px solid #FF8C42
color: #FF8C42
padding: 12px 24px
border-radius: 999px
```

## Animations

### Page Transitions
- Duration: 200ms
- Easing: ease-in-out
- Effect: Fade + slight slide

### Thread Expansion
- Duration: 300ms
- Effect: Accordion with opacity fade

### Hover States
- Duration: 150ms
- Effect: Elevation change, color shift

### Doctor Reply Highlight
- Initial: Brief glow animation
- Duration: 500ms
- Effect: Pulse with orange tint

## Accessibility

### Contrast Ratios
- Body text: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Clear focus states

### Focus States
```css
outline: 2px solid #FF8C42
outline-offset: 2px
```

### Screen Reader Support
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

## Responsive Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile (< 768px)
- Single column layout
- Floating action button
- Swipe navigation

### Desktop (≥ 768px)
- Multi-panel layout
- Persistent sidebar
- Hover interactions

## Icons

Use emoji or simple SVG icons:
- Medical: 🏥 🩺 💊
- Actions: ✓ ✕ ➕ 💬
- Status: ⚠️ ✅ 🚨
- User: 👤 👨‍⚕️ 👩‍⚕️

## Best Practices

1. **Maintain generous spacing** - Never crowd elements
2. **Use consistent border radius** - 16px for cards, 999px for pills
3. **Highlight doctor content** - Always use orange accent
4. **Provide clear feedback** - Animations for all interactions
5. **Keep it calm** - Avoid aggressive colors or animations
6. **Prioritize readability** - Ample line height, clear hierarchy
