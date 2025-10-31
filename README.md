# 🖐️ Hand Tracking Shooting Game

An interactive **web-based shooting game** powered by **MediaPipe**, **OpenCV**, and **p5.js**.  
You control the ship using your **hand gestures** — no keyboard or mouse required.  
Originally developed for **exhibitions** (e.g., school festivals) to allow hands-free gameplay.

---

## 🚀 Overview

- Real-time **hand tracking** with MediaPipe Hands  
- **Python backend** (hand detection) ↔ **p5.js frontend** (browser game) via Socket.IO  
- **Demo Mode** starts automatically when no hand is detected  
- **Game starts** after 4 seconds of continuous hand detection  
- **Game ends** after 30 seconds or 10 seconds of hand loss  
- Automatically returns to Demo Mode for unattended operation  
- Works with both **internal** and **external** webcams  

---

## 🧠 Verified Environment

| Component | Version / Hardware |
|------------|--------------------|
| OS | Ubuntu 22.04 LTS|
| Python | 3.10.12 |
| OpenCV | 4.10+ |
| MediaPipe | 0.10+ |
| Flask | 3.0+ |
| python-socketio | 5.11+ |
| Hardware | ThinkPad E14 Gen5 (Ryzen 5 7530U / 24GB RAM) |
| Camera | Integrated 720p + USB HD external camera |

Runs smoothly at **25–30 FPS** on most mid-range laptops.  
No GPU required.

---

## ⚙️ Dependencies

Dependencies are tracked with [uv](https://docs.astral.sh/uv/). The lockfile contains the exact versions for:

- OpenCV  
- MediaPipe  
- Flask & Werkzeug  
- python-socketio  
- NumPy  
- Uvicorn (serves the web front-end)

Install uv if needed:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```
Check the official docs for platform-specific instructions if the script is unsuitable.

---

## ▶️ How to Run the Project

### 1️⃣ Clone this repository
```
git clone https://github.com/hakase61912/Gestura.git

cd Gestura
```

### 2️⃣ Install dependencies
```
uv sync
```

Installs everything into `.venv` based on `pyproject.toml` / `uv.lock`.

### 3️⃣ Activate the virtual environment
```
source .venv/bin/activate
```

On Windows (PowerShell):
```
.venv\Scripts\Activate.ps1
```

### 4️⃣ Start the hand tracking server
```
uv run detector.py
```

- Opens your webcam and begins hand tracking  
- Displays FPS, hand state, and direction info  
- Starts the Socket.IO server at: `http://127.0.0.1:9001`

#### 💡 Using an external camera
Open `detector.py` and change:
```python
cap = cv2.VideoCapture(0)
```
→ Replace `0` with the camera index (`1`, `2`, etc.) according to your environment.  

Check available devices (Linux only):
```
v4l2-ctl --list-devices
```

On Windows, use the built-in **Camera app** to determine which device number to use.

---

### 5️⃣ Launch the web front-end
Open another terminal (activate the virtual environment there as well) and run:
```
uv run server.py
```

Then visit `http://127.0.0.1:8000` in your browser.

**Behavior:**
- Starts in **DEMO MODE** (ship moves automatically)  
- Detects a hand held in view for 4 seconds → **Game starts**  
- If no hand detected for 10 seconds → **Game over**  
- Game automatically ends after 30 seconds and returns to Demo Mode  

---

### 6️⃣ Stop the program
- Press `Ctrl + C` in both terminals  
- Close the browser tab  

---

## 🕹️ Controls

| Action | Gesture |
|--------|----------|
| Move Left | Tilt or move hand left |
| Move Right | Tilt or move hand right |
| Shoot | Automatically fires continuously |
| Start | Keep hand visible for 4 seconds |
| End | Remove hand for 10 seconds |

Session duration: **30 seconds**

---

## 📁 Folder Structure

```
.
├── detector.py          # Hand tracking server (MediaPipe + Socket.IO)
├── index.html           # HTML entry point
├── sketch.js            # Main game logic (p5.js)
└── server.py            # Flask-on-uvicorn wrapper for static assets
```

---

## 🧩 Troubleshooting

| Problem | Solution |
|----------|-----------|
| Camera not found | Change `cv2.VideoCapture(0)` index to `1` or `2` |
| “Emit error” logs | Harmless; Socket.IO auto-reconnects |
| Game not starting | Ensure `detector.py` is running before opening browser |
| Low FPS | Lower camera resolution or improve lighting |
| Hand not detected | Improve brightness and contrast |
| External camera unresponsive | Verify device index with `v4l2-ctl --list-devices` |

---

## 🖼️ Exhibition Notes

- Runs **offline** after installation  
- Perfect for **interactive demos** or **school festivals**  
- Use strong lighting and stable camera placement  
- Connect laptop to a **large display** for best visibility  
- Demo Mode ensures seamless unattended operation  

Recommended camera resolution: **640×480** or **720p**

---

## 📜 License

MIT License  
© 2025 Hakase61912

---

## 🧑‍💻 Credits

Developed by **Hakase61912**  
Built with ❤️ using **p5.js**, **OpenCV**, and **MediaPipe**.
