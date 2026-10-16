# Velarion Markets - Production Windows VPS Deployment Manual

This guide details the complete procedure for deploying and running the **Velarion Markets Autonomous Live MT5 Trading Daemon** on a 24/7 Windows Cloud VPS.

---

## 1. System Architecture Overview

```
[ Institutional Trader / Web Client ]
                 │
                 ▼
     [ Vercel Hosted Platform ]
(https://velarion.vercel.app - Next.js)
                 │
                 │ Authenticated HTTPS / REST API
                 ▼
   [ Cloudflare Zero-Trust Tunnel ]
     (e.g., gateway.velarionmarkets.com)
                 │
                 ▼ (Port 8000 on 127.0.0.1)
  ┌────────────────────────────────────────────────────────┐
  │                   WINDOWS CLOUD VPS                    │
  │                                                        │
  │  [ FastAPI Uvicorn Server ]  ◄──►  [ Risk Engine ]     │
  │            ▲                       (13 Pre-Trade Gates)│
  │            │ IPC Python Bridge                         │
  │            ▼                                           │
  │  [ JustMarkets MT5 Terminal (terminal64.exe) ]         │
  │  - Symbol: XAUUSD.m                                    │
  │  - Account: JustMarkets-Live or JustMarkets-Demo3       │
  │  - Algo Trading: ENABLED (Green)                       │
  └──────────────────────────┬─────────────────────────────┘
                             │ Direct FIX / MT5 Broker Protocol
                             ▼
               [ Just Global Markets Ltd. ]
```

---

## 2. Server Prerequisites

* **Operating System**: Windows Server 2019 / 2022, or Windows 10/11 Pro (64-bit).
* **Hardware Specs**: Minimum 2 vCPU, 4 GB RAM, 40 GB SSD.
* **Network**: Dedicated IP or Cloudflare Tunnel with low latency to broker trade servers (London or Frankfurt recommended).
* **Software**:
  * **Python 3.10 to 3.12 (64-bit)**: Must be installed with "Add Python to PATH" checked.
  * **JustMarkets MetaTrader 5 (64-bit)**: Downloaded directly from your JustMarkets client cabinet.
  * **Git for Windows** (optional, or copy folder via RDP).

---

## 3. Step-by-Step VPS Setup Procedure

### Step 1: Install & Configure JustMarkets MT5
1. Log into your Windows VPS via Remote Desktop (RDP).
2. Install **JustMarkets MT5** (default path: `C:\Program Files\MetaTrader 5` or `C:\Program Files\JustMarkets MT5`).
3. Log in with your broker credentials:
   * **Login**: e.g., `1200533810`
   * **Password**: Your broker trading password
   * **Server**: Select `JustMarkets-Live` or `JustMarkets-Demo3`
4. In MT5, enable algorithmic execution:
   * Click **Tools** -> **Options** (or press `Ctrl + O`).
   * Navigate to the **Expert Advisors** tab.
   * Check **Allow Algorithmic Trading**.
   * Check **Allow DLL imports**.
   * Click **OK**.
5. On the top toolbar, ensure the **Algo Trading** icon is **GREEN** (or press `Ctrl + E`).

---

### Step 2: Clone or Copy the Repository
Open PowerShell and clone or copy the project to your chosen directory (e.g. `C:\Velarion\xauusd_ai_trader`):
```powershell
cd C:\
git clone https://github.com/ashiruma/xauusd-ai-trader.git Velarion
cd C:\Velarion
```

---

### Step 3: Run the Automated VPS Setup Script
In PowerShell (as Administrator), run:
```powershell
powershell -ExecutionPolicy Bypass -File deploy\vps\setup_vps.ps1
```
This script will:
* Verify 64-bit Python compatibility.
* Locate `terminal64.exe`.
* Initialize a Python virtual environment (`.venv`).
* Install all production dependencies from [`deploy/vps/requirements-vps.txt`](file:///D:/Abala/xauusd_ai_trader/deploy/vps/requirements-vps.txt).
* Create required runtime folders (`data/` and `logs/`).
* Generate `.env` from [`deploy/vps/vps.env.example`](file:///D:/Abala/xauusd_ai_trader/deploy/vps/vps.env.example).
* Perform a live MT5 connection pre-flight test.

---

### Step 4: Configure Environment & Risk Settings (`.env`)
Open `.env` in Notepad and verify your production risk limits:
```env
TRADING_MODE=LIVE
DATA_MODE=LIVE_MT5
MT5__SYMBOL=XAUUSD.m

# User Risk Governors
RISK__MAX_RISK_PER_TRADE_PCT=1.5
RISK__MAX_DAILY_LOSS_PCT=3.0
RISK__MAX_DRAWDOWN_PCT=8.0
RISK__MAX_OPEN_POSITIONS=1
RISK__MAX_SPREAD_POINTS=35.0

# Security Key (Shared with Vercel)
VELARION_INTERNAL_API_KEY=your-secure-internal-key-2026
```

---

### Step 5: Test the Resilient Daemon Launcher
Start the daemon manually in a command window to observe startup telemetry:
```powershell
deploy\vps\start_daemon.bat
```
You should see:
```
Connected to JustMarkets MT5! Account #1200533810. Streaming live gold ticks...
Uvicorn running on http://127.0.0.1:8000
```
*Note: If MT5 is closed, `start_daemon.bat` automatically launches `terminal64.exe`.*

---

### Step 6: Enable 24/7 Autostart on VPS Reboot
To guarantee the daemon restarts automatically if Windows restarts or updates:
```powershell
powershell -ExecutionPolicy Bypass -File deploy\vps\install_autostart_task.ps1
```
This registers `Velarion-Trading-Daemon` in Windows Task Scheduler to start on boot and user logon with auto-restart on failure.

---

### Step 7: Expose Secure HTTPS Endpoint (Cloudflare Tunnel)
To securely connect your hosted Vercel website to the VPS without opening firewall ports:
1. Go to the Cloudflare Zero Trust Dashboard -> **Networks** -> **Tunnels**.
2. Create a tunnel named `velarion-vps` and choose **Windows**.
3. Copy the tunnel token and run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File deploy\vps\setup_cloudflare_tunnel.ps1 -TunnelToken "YOUR_TUNNEL_TOKEN"
   ```
4. In Cloudflare, set the Public Hostname:
   * **Domain / Subdomain**: e.g., `gateway.velarionmarkets.com`
   * **Service**: `HTTP` -> `127.0.0.1:8000`

---

### Step 8: Connect Your Hosted Vercel Deployment
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Select your `velarion` project -> **Settings** -> **Environment Variables**.
3. Set:
   * **Key**: `NEXT_PUBLIC_TRADING_API_URL`
   * **Value**: `https://gateway.velarionmarkets.com`
   * **Key**: `VELARION_INTERNAL_API_KEY`
   * **Value**: (Same key configured in your VPS `.env`)
4. Trigger a **Redeploy** on Vercel.

Your hosted platform is now streaming live ticks, displaying open positions, and executing orders directly through your 24/7 JustMarkets MT5 terminal!

---

## 4. Financial Safety & Disaster Recovery Procedures

### Emergency Stop (Software Level)
* From any browser, log in as administrator and hit the **Emergency Stop** button on the Terminal.
* Or from PowerShell on the VPS:
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/emergency_stop" -Method Post -Body '{"enabled":true,"reason":"Operator Emergency Stop"}' -ContentType "application/json"
  ```

### Emergency Stop (Terminal / Hardware Level)
* Open the MT5 desktop window on the VPS and click the **Algo Trading** toolbar button to turn it **RED**.
* MetaTrader 5 will immediately reject any incoming automated order at the broker socket level.

### Monitoring Logs
* Daemon Output: `logs\daemon.log`
* Crash Lineage: `logs\daemon_crashes.log`
* Watchdog Health: `logs\watchdog.log`
* Trade & Risk Audit Database: `data\xauusd_trader.db`
