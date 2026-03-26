# Nonprofit Control Tower

An operational intelligence layer for modern nonprofits, built with React, TypeScript, and Supabase.

## Quick Start

Choose your deployment path:

| I want to... | Go here |
|--------------|---------|
| **Deploy with Lovable (10 min)** | [Lovable Quickstart](./docs/00-getting-started/lovable-quickstart.md) |
| **Self-host on my infrastructure** | [Self-Host Guide](./docs/00-getting-started/self-host-quickstart.md) |
| **Browse all documentation** | [Documentation](./docs/README.md) |

## Features

- 📊 **Dashboard** — Role-specific analytics (Executive Director, Development Director, Finance Manager, Operations Manager)
- 💰 **Grants Management** — Track grant lifecycle, deadlines, and fund utilization
- 🎪 **Events** — Post-event engagement intelligence and follow-up automation
- 📋 **Board Reports** — Generate board-ready KPI summaries and financial snapshots
- 🔍 **Data Health** — Surface CRM data quality issues (duplicates, incomplete profiles)
- 💱 **Reconciliation** — Match transactions across payment processors and CRM/finance systems
- 🤖 **AI Agent Teams** — 16 specialized agents across 4 teams (Donor, Meeting, Strategy, Project)
- 📚 **Knowledge Base** — Semantic search across documents
- 🔐 **Role-Based Access** — Admin, moderator, and user roles
- 🔑 **SSO Authentication** — Google and Microsoft sign-in

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Edge Functions + Auth) |
| **Deployment** | Lovable.dev or Self-hosted |
| **AI** | Lovable AI (included) or OpenAI/Anthropic |

## Documentation

See [docs/README.md](./docs/README.md) for complete documentation including:

- Architecture overview
- Module documentation (nonprofit operations + AI agents)
- Deployment guides
- Integration setup
- Admin configuration

## Roadmap

See [docs/nonprofit-control-tower-roadmap.md](./docs/nonprofit-control-tower-roadmap.md) for the living roadmap.

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Built with ❤️ using [Lovable.dev](https://lovable.dev) + [Supabase](https://supabase.com)**
