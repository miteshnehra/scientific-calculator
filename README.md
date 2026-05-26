# 🔬 Scientific Calculator — Python Flask

A full-stack scientific calculator with a dark, minimal UI built with Python Flask.

## Features

| Category | Functions |
|---|---|
| Basic | Addition, Subtraction, Multiplication, Division |
| Trig | sin, cos, tan, sin⁻¹, cos⁻¹, tan⁻¹ |
| Logarithms | log (base-10), ln (natural log) |
| Roots & Powers | √, ∛, x², x³, xʸ, 1/x, \|x\| |
| Constants | π (Pi), e (Euler's number) |
| Misc | n! (factorial), ± toggle, backspace |
| Angle Modes | DEG, RAD, GRAD |
| Conversions | deg↔rad, deg↔grad |
| Memory | MS, MR, M+, M−, MC, M? |
| History | Last 12 calculations, click to recall |
| Keyboard | Full keyboard support |

## Tech Stack
- **Backend**: Python + Flask (math done server-side using Python's `math` module)
- **Frontend**: HTML, CSS, JavaScript
- **Fonts**: DM Mono + Syne (Google Fonts)

---

## 🚀 How to Run Locally

```bash
# Step 1: Install Flask
pip install -r requirements.txt

# Step 2: Start the server
python app.py

# Step 3: Open in browser
# http://127.0.0.1:5000
```

---

## 📤 How to Push to GitHub

### First time ever using Git?

**1. Install Git**
Download from https://git-scm.com/downloads

**2. Configure your identity (one time only)**
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**3. Create a repo on GitHub**
- Go to https://github.com → click **+** → **New repository**
- Name it `scientific-calculator`
- Do NOT check "Initialize with README"
- Click **Create repository**

**4. Open terminal in your project folder, then run:**
```bash
git init
git add .
git commit -m "Initial commit: Scientific Calculator"
git remote add origin https://github.com/YOUR_USERNAME/scientific-calculator.git
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

**5. Done!** Visit your repo at `https://github.com/YOUR_USERNAME/scientific-calculator`

### Updating after making changes
```bash
git add .
git commit -m "Describe your change here"
git push
```

---

## Project Structure

```
scientific-calculator/
├── app.py              ← Flask server + all math logic (Python)
├── requirements.txt    ← Python dependencies
├── README.md           ← This file
├── .gitignore          ← Files Git should ignore
├── templates/
│   └── index.html      ← Calculator UI (HTML)
└── static/
    ├── css/
    │   └── style.css   ← Dark theme styles
    └── js/
        └── calc.js     ← Button logic + API calls
```

## How It Works

1. You click a button in the browser
2. `calc.js` sends a POST request to Flask with the operation + numbers
3. `app.py` uses Python's `math` module to compute the result
4. The result is sent back as JSON and shown on the display
