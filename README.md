# 0xSENTINEL — Web3 Vulnerability Scanner 🛡️

> A high-performance, browser-based static analysis tool for Solidity smart contracts — no setup, no backend, instant results.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## ✨ What It Does

0xSENTINEL lets you paste any Solidity smart contract and receive an instant security report — no wallets, no API keys, no Python setup required. The analysis engine scans your code for common vulnerability patterns and returns a **0–100 Security Score** along with detailed remediation advice for every detected issue.

---

## 🔍 Detected Vulnerabilities

| # | Vulnerability | Severity | What It Catches |
|---|---|---|---|
| 1 | **Reentrancy** | 🔴 High | `.call{value:...}(` — unsafe external calls with ETH transfer |
| 2 | **Phishing via tx.origin** | 🔴 High | `tx.origin` used for authorization |
| 3 | **Unchecked Low-Level Call** | 🟡 Medium | `.call(`, `.delegatecall(`, `.staticcall(` with unchecked return |
| 4 | **Weak Randomness** | 🟡 Medium | `block.timestamp`, `block.difficulty`, `now` used as entropy |
| 5 | **Floating Pragma** | 🔵 Low | `pragma solidity ^x.x.x` — unlocked compiler version |

**Security Score formula:**
```
score = max(0, 100 − (High×20 + Medium×10 + Low×5))
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web3-scanner.git
cd web3-scanner

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main scanner UI (two-column layout)
│   ├── layout.tsx            # Root layout wrapper
│   ├── globals.css           # Cyberpunk theme + CSS variables
│   ├── actions.ts            # Next.js Server Action — calls analyzer
│   ├── vulnerabilities/
│   │   └── page.tsx          # Full vulnerability database listing
│   └── docs/
│       └── page.tsx          # How-it-works & best practices
├── components/
│   ├── Layout.tsx            # Sticky header, nav, footer shell
│   ├── CodeEditor.tsx        # Code input with line numbers
│   └── Results.tsx           # Score card + vulnerability cards
└── lib/
    └── analyzer.ts           # Core regex-based detection engine
```

---

## 🗺️ App Pages

- **`/`** — Paste your contract, hit **ANALYZE**, view the report side by side
- **`/vulnerabilities`** — Browse all detected vulnerability types with full descriptions and remediations
- **`/docs`** — Learn how the scanner works, supported checks, and Solidity best practices

---

## 🎨 Design

The UI uses a **cyberpunk / terminal aesthetic**:
- Deep black background (`#0a0a0a`) with an animated CSS grid overlay
- Neon green (`#00ff9d`) as the primary accent
- Glassmorphism panels with `backdrop-filter: blur`
- Framer Motion slide-in animations on all result cards
- Color-coded severity: 🔴 Red / 🟡 Yellow / 🔵 Blue

---

## 🔮 Roadmap

- [ ] AST-based analysis using `@solidity-parser/parser` for higher accuracy
- [ ] Solidity syntax highlighting in the code editor
- [ ] Drag-and-drop `.sol` file upload
- [ ] Export report as PDF / JSON
- [ ] Scan history stored in `localStorage`
- [ ] More checks: integer overflow, access control, selfdestruct misuse
- [ ] Live/debounced auto-scan as you type
- [ ] AI-powered "Fix it for me" suggestions
- [ ] Integration with Slither / Mythril via backend API

---

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
