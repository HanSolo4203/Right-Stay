# Contact Page Documentation

## 📄 Overview

The contact page follows the same design system as the home page with smooth scroll animations, glassmorphism effects, and responsive design.

## 🎨 Page Sections

### 1. **Contact Hero** (`ContactHero.tsx`)
- Full-screen hero with background image (mountain landscape)
- Headline and description
- Quick contact info badges (Email, Phone, Location)
- Smooth fade-in animations

### 2. **Contact Form** (`ContactForm.tsx`)
- Two-column layout (info + form)
- Form fields:
  - Full Name (required)
  - Email Address (required)
  - Company (optional)
  - Subject dropdown (required)
  - Message textarea (required)
- Success state with checkmark animation
- Auto-reset after 3 seconds
- Scroll animations on both columns

### 3. **Contact Info** (`ContactInfo.tsx`)
- Four info cards with gradient icons:
  - 📍 Headquarters location
  - 🕐 Business hours
  - 🌍 Global presence
  - 👥 Support availability
- Interactive map section with CTA
- Staggered scroll animations

### 4. **Footer** (Reused component)
- Newsletter signup
- Social links
- Navigation columns

## 🎯 Features

✅ **Fully functional contact form** with validation  
✅ **Success/error states** with animations  
✅ **Multiple contact methods** displayed prominently  
✅ **Responsive design** (mobile, tablet, desktop)  
✅ **Scroll-triggered animations** using IntersectionObserver  
✅ **Glassmorphism effects** on all cards  
✅ **Smooth transitions** on all interactive elements  

## 🖼️ Images Used

- **Hero background:** `6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg` (mountain landscape)
- **Form background:** `d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg` (3D abstract)
- **Map placeholder:** `993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg` (portrait)

## 🔗 Route

**URL:** `/contact`  
**File:** `app/contact/page.tsx`

## 🎨 Design Tokens

### Colors Used:
- Sky: `from-sky-400 to-blue-500`
- Emerald: `from-emerald-400 to-emerald-500`
- Amber: `from-amber-300 to-amber-400`
- Purple: `from-purple-400 to-purple-500`

### Typography:
- Headings: `Manrope` font family
- Body: `Inter` font family

### Animations:
- Fade + Slide in from bottom
- Timing: 1s ease-out
- Staggered delays: 0.1s - 0.7s

## 💡 Customization

### Update Contact Information

Edit `ContactHero.tsx`:
```tsx
{ icon: Mail, label: 'your-email@domain.com', href: 'mailto:your-email@domain.com' },
{ icon: Phone, label: '+1 (555) 000-0000', href: 'tel:+15550000000' },
```

### Update Office Locations

Edit `ContactInfo.tsx` - update the `content` fields in the info cards array.

### Form Submission

The form currently shows a success state. To connect to a backend:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Add your API call here
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (response.ok) {
    setSubmitted(true);
  }
};
```

## 📱 Responsive Breakpoints

- **Mobile:** < 768px (single column, stacked layout)
- **Tablet:** 768px - 1024px (2 columns for form)
- **Desktop:** > 1024px (full multi-column layout)

## 🎭 Component Structure

```
ContactPage
├── Header (shared)
├── ContactHero
│   ├── Background Image
│   ├── Title & Description
│   └── Contact Badges
├── ContactForm
│   ├── Left Column (Info)
│   │   ├── Description
│   │   └── Department Cards
│   └── Right Column (Form)
│       ├── Input Fields
│       └── Submit Button
├── ContactInfo
│   ├── Office Cards (4)
│   └── Map Section
└── Footer (shared)
```

## 🚀 Next Steps

1. Connect form to backend API
2. Add form validation error messages
3. Integrate with email service (SendGrid, etc.)
4. Add reCAPTCHA for spam protection
5. Set up analytics tracking for form submissions

---

Built with Next.js 14, React, TypeScript, and Tailwind CSS ❤️

