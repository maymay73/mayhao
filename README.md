# Visual Inspiration 🎨

A Pinterest-style visual inspiration platform built with HTML, CSS, JavaScript, and Bootstrap. Ready to deploy on GitHub Pages.

## Features

- 🔍 **Image Search** — powered by the Unsplash API
- ❤️ **Like & Save** — persistent via localStorage
- 📁 **Collections** — create, manage, and browse custom collections
- 🎯 **For You Feed** — personalized based on your liked/saved images
- 🔐 **Auth Pages** — Register, Login, Reset Password (localStorage simulation)
- 📱 **Fully Responsive** — mobile, tablet, and desktop

## Project Structure

```
/
├── index.html          # Homepage
├── style.css           # All styles
├── script.js           # Core JS (API, cards, storage, auth)
└── pages/
    ├── explore.html    # Search & browse
    ├── foryou.html     # Personalized feed
    ├── collections.html # Saved collections
    ├── login.html      # Sign in
    ├── register.html   # Create account
    └── reset.html      # Password reset
```

## Setup

### 1. Get an Unsplash API Key (free)

1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your **Access Key**

### 2. Add your key

Open `script.js` and replace the value in `CONFIG`:

```js
const CONFIG = {
  UNSPLASH_KEY: 'YOUR_ACCESS_KEY_HERE',  // ← paste here
  ...
};
```

### 3. Deploy to GitHub Pages

1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your site will be live at `https://username.github.io/repository-name/`

> ℹ️ If no API key is configured, the site falls back to [Picsum Photos](https://picsum.photos) placeholder images so the UI always looks complete.

## Technologies

- HTML5, CSS3, Vanilla JavaScript
- [Bootstrap 5.3](https://getbootstrap.com)
- [Bootstrap Icons](https://icons.getbootstrap.com)
- [Google Fonts — Syne + DM Sans](https://fonts.google.com)
- [Unsplash API](https://unsplash.com/developers)
- localStorage for all persistence
