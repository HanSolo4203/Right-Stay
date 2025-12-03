# ⚠️ Restart Required

## What Changed

Updated `next.config.js` to allow images from Unsplash domain.

## Action Required

**Restart your development server:**

1. Stop the current server (press `Ctrl+C` in the terminal)
2. Start it again: `npm run dev`

## Why?

Next.js requires a restart when `next.config.js` changes. This is a one-time thing - after restart, all Unsplash images will load properly!

## What Was Added

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
  ],
}
```

This tells Next.js it's safe to load and optimize images from `images.unsplash.com`.

---

**After restarting, refresh your browser and the property photos will appear!** 📸✨

