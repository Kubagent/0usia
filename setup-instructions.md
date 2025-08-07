# Ovsia V4 Setup Instructions

## Required Packages

Install the following packages to begin development:

### Core Dependencies
```bash
# Next.js and React
npm install next@latest react@latest react-dom@latest

# TypeScript
npm install -D typescript @types/react @types/node @types/react-dom

# Styling
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install sass  # Optional, if you need SCSS

# Animation
npm install framer-motion@latest

# Utilities
npm install clsx
```

### Integration Dependencies
```bash
# Notion API (for CMS)
npm install @notionhq/client

# Mailchimp API (for email forms)
npm install @mailchimp/mailchimp_marketing

# Analytics
npm install @vercel/analytics
```

## Setup Steps

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```
   Note: Since we already have a directory structure, you may need to answer "no" to some prompts about overwriting files.

2. **Initialize Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

3. **Configure TypeScript**
   ```bash
   npx tsc --init
   ```

4. **Set Up Cloudflare Pages Integration**
   Create a `_worker.js` file in the root directory for Cloudflare Pages compatibility.

## Development Workflow

1. Start with Phase 1 script to set up project architecture:
   ```bash
   npm run phase1
   ```

2. Review the agent outputs in the `agent-outputs/` directory

3. Implement the recommendations in the Next.js application code

4. Continue with subsequent phases as each is completed
