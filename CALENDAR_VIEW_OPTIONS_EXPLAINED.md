# Calendar View Options Explained

## Overview
The Appointment Calendar has three view modes: **Month**, **Week**, and **Day**. These buttons allow users to switch between different time perspectives for viewing their appointments.

## Location in Code
File: `apps/web/src/components/appointments/AppointmentCalendar.tsx`

## The View Selector Buttons

```tsx
{/* View Selector */}
<div className="flex gap-1">
  {['month', 'week', 'day'].map(v => (
    <button
      key={v}
      onClick={() => setView(v as any)}
      className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
        view === v
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {v.charAt(0).toUpperCase() + v.slice(1)}
    </button>
  ))}
</div>
```

## How It Works

### 1. State Management
```tsx
const [view, setView] = useState<'month' | 'week' | 'day'>('month')
```
- Stores the current view mode
- Default is 'month' view
- Can be: 'month', 'week', or 'day'

### 2. Button Rendering
The code creates three buttons dynamically:
- **Month** button
- **Week** button  
- **Day** button

### 3. Active State Styling
```tsx
view === v
  ? 'bg-blue-600 text-white'           // Active: Blue background, white text
  : 'bg-gray-100 text-gray-700'        // Inactive: Gray background, dark text
```

## Current Implementation Status

### ✅ What's Working
- **UI Buttons**: All three buttons render correctly
- **State Management**: View state changes when buttons are clicked
- **Visual Feedback**: Active button shows blue background
- **Smooth Transitions**: Hover effects work properly

### ⚠️ What's NOT Implemented Yet
The view state changes, but the calendar display doesn't actually change. Currently, it ALWAYS shows the month view regardless of which button is clicked.

## What Each View SHOULD Do

### 📅 Month View (Currently Working)
**What it shows:**
- Full calendar grid (7 columns × 5-6 rows)
- All days of the current month
- Up to 2 appointments per day visible
- "+X more" indicator if more than 2 appointments

**Use case:**
- Overview of the entire month
- Planning ahead
- Seeing patterns in appointment scheduling

### 📆 Week View (NOT Implemented)
**What it SHOULD show:**
- 7 columns (one per day of the week)
- Hourly time slots (e.g., 8 AM - 8 PM)
- All appointments for the current week
- More detailed time visualization

**Use case:**
- Detailed view of the current week
- Hour-by-hour scheduling
- Better for managing daily schedules

### 📋 Day View (NOT Implemented)
**What it SHOULD show:**
- Single day view
- Hourly breakdown (e.g., 8 AM - 8 PM in 30-min or 1-hour slots)
- All appointments for the selected day
- Most detailed time view

**Use case:**
- Focus on a single day
- Minute-by-minute scheduling
- Best for busy days with many appointments

## Why Week and Day Views Aren't Working

Looking at the code, the view state changes but there's no conditional rendering based on the view:

```tsx
{/* Calendar Grid */}
<div className="p-3">
  {/* This always renders the month view */}
  <div className="grid grid-cols-7 gap-1 mb-1">
    {/* Month view code... */}
  </div>
</div>
```

**Missing:** Conditional logic like:
```tsx
{view === 'month' && <MonthView />}
{view === 'week' && <WeekView />}
{view === 'day' && <DayView />}
```

## How to Implement Week and Day Views

### Option 1: Add Conditional Rendering
```tsx
<div className="p-3">
  {view === 'month' && (
    // Current month view code
  )}
  
  {view === 'week' && (
    // New week view code
    <WeekViewComponent 
      currentDate={currentDate}
      appointments={appointments}
    />
  )}
  
  {view === 'day' && (
    // New day view code
    <DayViewComponent 
      currentDate={currentDate}
      appointments={appointments}
    />
  )}
</div>
```

### Option 2: Use a Library
Popular calendar libraries that support all three views:
- **FullCalendar** - Most popular, feature-rich
- **React Big Calendar** - Lightweight, good for appointments
- **React Calendar** - Simple, customizable

## Visual Comparison

### Month View (Current)
```
Sun  Mon  Tue  Wed  Thu  Fri  Sat
                    1    2    3
 4    5    6    7    8    9   10
11   12   13   14   15   16   17
18   19   20   21   22   23   24
25   26   27   28   29   30   31
```

### Week View (Should Be)
```
        Mon 15  Tue 16  Wed 17  Thu 18  Fri 19  Sat 20  Sun 21
8 AM    -----   -----   -----   -----   -----   -----   -----
9 AM    [Apt]   -----   -----   -----   -----   -----   -----
10 AM   -----   [Apt]   -----   -----   -----   -----   -----
11 AM   -----   -----   [Apt]   -----   -----   -----   -----
...
```

### Day View (Should Be)
```
Monday, April 15, 2026

8:00 AM  ─────────────────
8:30 AM  ─────────────────
9:00 AM  [Appointment 1]
9:30 AM  [Appointment 1]
10:00 AM ─────────────────
10:30 AM [Appointment 2]
11:00 AM ─────────────────
...
```

## Summary

**Current Status:**
- ✅ Buttons work and look good
- ✅ State changes when clicked
- ❌ Display doesn't change (always shows month)

**To Make It Fully Functional:**
1. Add conditional rendering based on `view` state
2. Create WeekView component with hourly slots
3. Create DayView component with detailed hourly breakdown
4. Update navigation buttons to work with week/day views
5. Add time slot selection for creating appointments

**User Experience:**
- Users can click the buttons, but nothing changes yet
- It's a visual-only feature at the moment
- Full implementation would require significant additional code

Would you like me to implement the Week and Day views to make these buttons fully functional?
