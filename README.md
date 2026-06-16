# Habesha Eats 🇪🇹 🇪🇷

Habesha Eats is a premium, modern, 3D-animated discovery and delivery platform for Ethiopian and Eritrean cuisine. It is built using **Next.js (App Router)**, **React**, **GSAP** (for high-end animations), and **Lenis** (for smooth scrolling).

---

## 📁 Repository Structure

Below is an overview of the key directories and files in this codebase:

```bash
habesha-eats/
├── app/                  # Next.js App Router pages, styles, and layouts
│   ├── checkout/         # Checkout page
│   ├── discover/         # Discover restaurants page
│   ├── order/            # Order confirmation and status page
│   ├── profile/          # User profile page
│   ├── restaurant/       # Individual restaurant view pages
│   ├── globals.css       # Core global styles (CSS variables, reset)
│   ├── app.css           # General application layout and component classes
│   ├── sections.css      # Component and landing page section-specific styles
│   └── layout.jsx        # Root HTML structure, providers (CartContext, etc.)
├── components/           # Reusable UI components & animations
│   ├── CustomCursor.jsx  # Interactive mouse cursor styling
│   ├── SmoothScroll.jsx  # Lenis smooth-scrolling wrapper
│   ├── FloatingBeans.jsx # Parallax floating coffee beans background
│   └── HeroSection.jsx   # Landing page Hero section
├── lib/                  # Utilities, custom hooks, and mock database
│   ├── CartContext.js    # Global cart state management
│   ├── data.js           # Mock restaurants, dishes, and reviews data
│   └── useFrameSequence.js # Canvas scroll-linked animation engine
├── public/               # Static assets (images, logos, webp video frames)
└── scripts/              # Local scripts (e.g. video to frame conversion)
```

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have **Node.js 18+** installed on your system.

### Installation & Local Development
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/filmonnezif/habesha-eats.git
   cd habesha-eats
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🚀 Adding Features & Backend

### 1. Adding Frontend Features
- **Pages/Routes**: Create folders under `/app` containing a `page.jsx` file to define new routes (e.g., `/app/about/page.jsx` resolves to `/about`).
- **Components**: Create new reusable React components in the `/components` directory. Ensure any animations utilize **GSAP** and match the smooth, premium theme of the app.
- **Styling**: Make use of CSS variables defined in `globals.css` to keep typography and color schemes consistent.

### 2. Integrating a Backend
Since the app is built on Next.js, you can implement a backend using Next.js **Route Handlers** (API routes):
1. **API Endpoints**: Create folders under `app/api` containing a `route.js` file.
   - *Example*: `app/api/restaurants/route.js`
   ```javascript
   import { NextResponse } from 'next/server';
   import { restaurants } from '@/lib/data';

   export async function GET() {
     return NextResponse.json(restaurants);
   }
   ```
2. **Database Integration**:
   - To persist user profiles, orders, and ratings, integrate an ORM like **Prisma** or **Mongoose**.
   - Connect to a database (such as PostgreSQL, MySQL, or MongoDB) by defining a `.env.local` file with your connection strings.
   - Reference the database client within your API routes instead of reading from `lib/data.js`.

---

## 🔀 Git Workflow & Pull Requests

To maintain codebase health, prevent deployment bugs, and avoid merge conflicts, follow this workflow:

### 1. Branching Strategy
Never commit directly to the `main` branch. Always create a feature branch:
```bash
# Get the latest updates from remote main
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b bugfix/your-fix-name
```

### 2. How to Avoid Merge Conflicts
Merge conflicts happen when multiple developers edit the same lines of a file. Follow these guidelines to avoid them:
* **Pull Frequently**: Pull from `main` often to keep your local branch up to date.
* **Rebase or Merge Main**: Before submitting a Pull Request, merge the latest `main` branch back into your feature branch:
  ```bash
  git checkout main
  git pull origin main
  git checkout feature/your-feature-name
  git merge main
  ```
  Resolve any conflicts locally, verify the application still builds successfully (`npm run build`), and then push.
* **Keep PRs Small**: Write granular, single-purpose branches. Avoid working on multiple features in one branch.

### 3. Submitting a Pull Request (PR)
Once your feature is complete and tested locally:
1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: describe the feature clearly"
   ```
2. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open GitHub and navigate to [filmonnezif/habesha-eats](https://github.com/filmonnezif/habesha-eats).
4. Click **Compare & pull request**.
5. Fill out the PR template explaining:
   - What changes were introduced.
   - How to manually verify/test the changes.
   - Any UI screenshots/recordings if applicable.
6. Submit the PR and wait for review. Once approved, merge it into `main`!
