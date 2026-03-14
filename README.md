# عطر الطبيعة —  (Demo)Natural Soap Store

متجر صابون طبيعي مصنوع يدويًا | Arabic RTL E-commerce Frontend

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🗂 Folder Structure

```
natural-soap-store/
├── public/
│   ├── favicon.svg
│   └── images/               # Local images (optional)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Fixed nav with hamburger + cart icon
│   │   ├── Hero.jsx           # Hero section with animated bubbles
│   │   ├── ProductCard.jsx    # Individual product card
│   │   ├── ProductGrid.jsx    # Products listing with filters
│   │   ├── ProductModal.jsx   # Product detail modal
│   │   ├── CartSidebar.jsx    # Slide-in cart panel
│   │   ├── AboutSection.jsx   # Values + stats
│   │   ├── Footer.jsx         # Footer with links
│   │   └── StarRating.jsx     # Reusable star rating
│   ├── context/
│   │   └── CartContext.jsx    # Cart state management
│   ├── data/
│   │   └── products.js        # Mock product data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Tailwind + global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠 Tech Stack

- **React 18** — UI library
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Utility-first styling
- **Google Fonts** — El Messiri (display) + Tajawal (body)

## 🌟 Features

- ✅ Fully Arabic RTL layout
- ✅ Mobile-first responsive design
- ✅ Animated hero with floating decorative elements
- ✅ Product filter tabs
- ✅ Product detail modal with quantity selector
- ✅ Shopping cart sidebar with add/remove/update
- ✅ Smooth hover animations and transitions
- ✅ Accessible semantic HTML with ARIA labels
- ✅ Keyboard navigation support (Escape closes modals)
- ✅ Image fallback handling
