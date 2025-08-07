# Ovsia V4 Website Development

A one-page animated website with 6 scroll-locked sections featuring smooth animations, alternating black/white backgrounds, and interactive elements.

## Project Structure

```
ovsia_v4/
├── docs/                      # Project documentation
│   ├── DEVELOPMENT_GUIDE.md   # Overall development approach and phases
│   ├── CLAUDE_REFERENCE.md    # Technical reference for Claude
│   └── TASK_BREAKDOWN.md      # Detailed task assignments to agents
├── scripts/                   # Development scripts
│   ├── agents/                # Agent integration system
│   │   ├── agent-integration.js  # Core agent loading and management
│   │   └── claude-agent-interface.js  # Claude integration
│   └── phases/                # Phase-specific development scripts
│       ├── phase1-setup.js    # Foundation & Architecture
│       ├── phase2-sections.js # Core Sections Development
│       ├── phase3-scroll.js   # Scroll System & Animations
│       ├── phase4-integrations.js  # Integrations & Content
│       ├── phase5-optimization.js  # Performance & SEO
│       └── phase6-deployment.js    # Deployment & QA
├── tools/                     # Utility tools
│   ├── test-agents.js         # Test script for agent integration
│   └── ovsia-development.js   # Main development orchestration
├── agents/                    # 45+ specialized agent markdown files
├── v3 duplicate/              # Previous version codebase for reference
├── agent-outputs/             # Generated outputs from agent tasks (created during execution)
└── package.json               # Project dependencies and scripts
```

## Setup Instructions

1. **Install Dependencies**

```bash
npm install
```

2. **Test Agent Integration**

```bash
npm run test-agents
```

3. **Run Development Process**

Run all phases in sequence:
```bash
npm run dev
```

Run a specific phase:
```bash
npm run phase1  # Replace with phase2, phase3, etc. for other phases
```

## Tech Stack

- **Frontend**: Next.js (React + TypeScript), Tailwind CSS, Framer Motion
- **Deployment**: Cloudflare Pages
- **Integrations**: Notion API (CMS), Mailchimp API (Email), Google Analytics/Matomo
- **Development**: Claude Code with specialized agents

## Development Phases

1. **Foundation & Architecture**: Project setup, architecture planning, V3 asset analysis
2. **Core Sections Development**: Building the 6 main sections with components and styling
3. **Scroll System & Animations**: Implementing scroll lock, transitions, and animations
4. **Integrations & Content**: Setting up CMS, forms, and analytics
5. **Performance & SEO**: Optimizing for speed, search, and accessibility
6. **Deployment & QA**: Final testing and production deployment

## Documentation

For detailed information about the development process, refer to:

- **Development Guide**: `docs/DEVELOPMENT_GUIDE.md`
- **Claude Reference**: `docs/CLAUDE_REFERENCE.md`
- **Task Breakdown**: `docs/TASK_BREAKDOWN.md`
# 0usia
