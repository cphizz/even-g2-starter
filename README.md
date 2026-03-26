# Even Realities G2 — Starter App

A minimal working starter for building Even Realities G2 smart glasses apps.
No glasses required — use the Even Hub Simulator to develop and test.

## Quick Start

```bash
# Install dependencies
npm install

# Install the simulator globally (one time)
npm install -g @evenrealities/evenhub-simulator

# Terminal 1 — start dev server
npm run dev

# Terminal 2 — start simulator (use your local IP from ipconfig/ifconfig)
evenhub-simulator http://YOUR_LOCAL_IP:5173
```

The simulator opens two windows:
- **Browser** — your phone control panel
- **Glasses Display** — exactly what appears on the G2 lenses

## Gesture Controls

| Gesture | Action |
|---------|--------|
| Tap | Say hello |
| Double tap | Show info |
| Triple tap | Go home |
| Scroll up | Screen A |
| Scroll down | Screen B |

## Key Rules Every G2 Developer Must Know

| Rule | Detail |
|------|--------|
| Display | 576×288px, green micro-LED |
| `createStartUpPageContainer` | Call **once only** at startup |
| `rebuildPageContainer` | Full screen change (slight flicker) |
| `textContainerUpgrade` | Fast in-place update, no flicker |
| Event container | Must be **full 576×288** — small containers miss scroll events |
| `isEventCapture` | Exactly **one** container must be `1` per page |
| Max containers | 4 per page |
| Content limit | 1000 chars (startup/rebuild), 2000 chars (upgrade) |
| `CLICK_EVENT = 0` | Becomes `undefined` in SDK — always check both |
| Scroll cooldown | Use 300ms cooldown to prevent duplicates |
| Container names | Max 16 characters |

## Reference Repos

- **pong-even-g2** (confirmed working): https://github.com/nickustinov/pong-even-g2
- **G2_Gym_App** (clean architecture): https://github.com/r-castelo/G2_Gym_App  
- **even-g2-notes** (full reverse-engineered docs): https://github.com/nickustinov/even-g2-notes
