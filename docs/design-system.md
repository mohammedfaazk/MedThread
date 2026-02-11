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
--color-cream-bg: #F5F1E8
--color-warm-yellow: #FFD166
--color-soft-yellow: #FFF4D6
--color-charcoal: #2D2D2D
--color-dark-gray: #3A3A3A
--color-medical-orange: #FF8C42
--color-light-orange: #FFF3E8
--color-trust-blue: #2F6FED
--color-success-green: #2AA876
--color-alert-red: #E5484D
--color-light-gray: #E8E8E8
--color-medium-gray: #9E9E9E
```

### Usage
- **Cream Background**: Main app background for warmth
- **Warm Yellow**: Primary highlights, active states, progress indicators
- **Soft Yellow**: Hover states, subtle emphasis
- **Charcoal/Dark Gray**: Primary text, dark UI elements, cards
- **Medical Orange**: Doctor badges, medical-specific highlights
- **Light Orange**: Medical backgrounds, doctor reply surfaces
- **Trust Blue**: Links, informational elements
- **Success Green**: Positive feedback, recovery indicators
- **Alert Red**: Warnings, emergency alerts
- **Light/Medium Gray**: Borders, disabled states, secondary text

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
- Large cards: 24px
- Default cards: 20px
- Pills/Badges: 999px (fully rounded)
- Small elements: 12px
- Buttons: 999px (fully rounded)

## Shadows

### Soft Card Shadow
```css
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
```

### Elevated Shadow
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Subtle Inner Shadow
```css
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
```

## Components

### Post Card
- Background: White
- Border Radius: 20px
- Padding: 24px
- Shadow: Soft card shadow (0 4px 20px rgba(0, 0, 0, 0.06))
- Hover: Slight elevation increase + subtle scale
- Border: None (shadow only)

### Thread Reply
- Doctor replies: Soft yellow background (#FFF4D6) with orange accent
- Regular replies: White background
- Border Radius: 16px
- Nested indicator: Left border line in warm yellow

### Symptom Tag
- Padding: 8px 16px
- Border Radius: 999px (pill)
- Background: Soft yellow (#FFF4D6)
- Text: Charcoal (#2D2D2D)
- Hover: Warm yellow (#FFD166)

### Doctor Badge
- Background: Charcoal (#2D2D2D)
- Text: White
- Border Radius: 999px
- Padding: 6px 12px
- Icon: Checkmark in warm yellow
- Reputation score displayed

### Buttons

#### Primary
```css
background: #2D2D2D (charcoal)
color: white
padding: 12px 28px
border-radius: 999px
hover: background: #3A3A3A
transition: all 150ms ease
```

#### Secondary (Accent)
```css
background: #FFD166 (warm yellow)
color: #2D2D2D
padding: 12px 28px
border-radius: 999px
hover: background: #FFC94D
transition: all 150ms ease
```

#### Tertiary (Outline)
```css
background: transparent
border: 2px solid #E8E8E8
color: #2D2D2D
padding: 12px 28px
border-radius: 999px
hover: border-color: #FFD166
transition: all 150ms ease
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
