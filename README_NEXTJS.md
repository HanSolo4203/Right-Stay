# Axiom Intelligence - Next.js Project

A modern, responsive AI platform landing page built with Next.js 14, React, TypeScript, and Tailwind CSS.

## 🚀 Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 🎯 **TypeScript** for type safety
- 🎭 **Lucide React** for beautiful icons
- 🔥 **shadcn/ui** ready (components.json configured)
- 📱 **Fully Responsive** design
- 🌙 **Dark mode** optimized
- ✨ **Smooth scroll animations** with IntersectionObserver
- 🖼️ **Next.js Image** optimization

## 📦 Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles & Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   └── sections/            # Page sections
│       ├── Header.tsx
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── TestimonialSection.tsx
│       ├── PricingSection.tsx
│       ├── FAQSection.tsx
│       └── Footer.tsx
├── hooks/
│   └── useScrollAnimation.ts # Custom scroll animation hook
├── lib/
│   └── utils.ts             # Utility functions
├── public/
│   └── images/              # Static images
└── package.json
```

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Adding shadcn/ui Components

The project is pre-configured for shadcn/ui. To add components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc...
```

Components will be added to `components/ui/` automatically.

## 🎯 Key Components

### Header
- Responsive navigation
- Mobile menu with smooth transitions
- Call-to-action buttons

### Hero Section
- Full-screen hero with background image
- Animated text reveals
- Feature tags
- Primary CTA buttons

### Features Section
- Three feature cards with scroll animations
- Performance metrics visualization
- Face detection demo
- Progress bars and charts

### Testimonial Section
- Customer quote with attribution
- Partner logos
- Full-screen background

### Pricing Section
- Three pricing tiers
- Monthly/Annual toggle
- Feature lists with icons
- Highlighted "Most Popular" plan

### FAQ Section
- Expandable accordion items
- Six common questions
- Smooth open/close animations

### Footer
- Multiple navigation columns
- Social media links
- Newsletter signup
- Legal links and compliance badge

## 🎬 Scroll Animations

The project includes a custom `useScrollAnimation` hook that triggers animations when elements scroll into view:

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function MyComponent() {
  useScrollAnimation(); // Activates scroll animations
  
  return (
    <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out both' }}>
      {/* Content */}
    </div>
  );
}
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color palette.

### Fonts
The project uses:
- **Inter** for body text
- **Manrope** for headings

Update in `app/layout.tsx` to change fonts.

### Images
Replace images in `public/images/` with your own assets.

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

```bash
npm run build
```

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
npm run build
npm start
```

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

Feel free to fork and customize for your needs!

---

Built with ❤️ using Next.js and React

