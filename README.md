# FlatSync

Decide together, before you fall in love with a flat.

FlatSync is a collaborative flat-hunting tool for groups of roommates. Each person fills in their own dealbreakers and preferences separately, and FlatSync cross-checks every listing against everyone's rules — surfacing honest, per-person trade-offs before anyone gets emotionally attached to a place.

**Live app:** https://flatsync-theta.vercel.app

## Highlights

- Hard-constraint filtering + soft-preference scoring per roommate
- Live commute times via OSRM routing (`/api/commute`)
- Trade-off radar chart, fairness index, and constraint-conflict detection
- What-if sliders, consensus voting, room-rent splitter, net living cost calculator
- Shareable URL state, WhatsApp exports, printable Agreement Brief (PDF), decision audit log

## Getting started

```bash
npm install
npm run dev
```

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI on Radix · Framer Motion · Zustand
