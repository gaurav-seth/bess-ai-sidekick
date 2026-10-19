# BESS AI Sidekick 🔋

**An AI-powered assistant for Battery Energy Storage System (BESS) monitoring, telemetry analysis, and operational troubleshooting.**

BESS AI Sidekick is a prototype that combines simulated battery telemetry, an AI assistant, and a web dashboard to explore how AI can make industrial energy systems easier to monitor and understand.

The project brings together **AWS IoT Core, AWS IoT SiteWise, and LangChain** to explore an architecture that connects industrial asset data with AI-powered reasoning and operational insights.

> **Project status:** The local prototype runs using simulated telemetry, a local MQTT broker, SQLite, LangChain, Ollama, FastAPI, and React. AWS IoT Core and SiteWise integration is an ongoing cloud integration path; AWS credentials are not required to run the local prototype.

## ✨ Key Features

- **Battery telemetry simulation:** Generates temperature, voltage, current, and state-of-charge readings.
- **MQTT-based telemetry ingestion:** Publishes simulated readings through a local MQTT broker.
- **Telemetry storage:** Stores readings locally in SQLite for dashboard visualization and analysis.
- **AI-powered assistant:** Uses LangChain and a locally hosted Ollama model to answer operational questions and use telemetry-related tools.
- **Interactive dashboard:** Displays battery metrics, telemetry history, charts, and an AI chat interface.
- **Conversation memory:** Uses LangGraph checkpointing with SQLite to support conversation continuity.
- **Cloud architecture exploration:** Demonstrates how AWS IoT Core and AWS IoT SiteWise can be incorporated into an industrial telemetry pipeline.

## 🏗️ Architecture

### Local prototype

```text
BESS Simulator
      |
      | MQTT
      v
Local Mosquitto Broker
      |
      v
Telemetry Service
      |
      v
SQLite Database
      |
      v
FastAPI Backend
      |
      +------ LangChain AI Agent
      |              |
      |              v
      |         Ollama LLM
      |
      v
React Dashboard
```

### Planned cloud integration path

```text
BESS Simulator
      |
      | MQTT over TLS
      v
AWS IoT Core
      |
      | IoT Rule
      v
AWS IoT SiteWise
      |
      v
Telemetry Access Layer
      |
      v
LangChain AI Assistant
      |
      v
Operational Insights
```

The cloud diagram represents the intended integration architecture. The local application does not require this AWS pipeline to run.

## 🧰 Technology Stack

| Area | Technologies |
|---|---|
| Backend API | Python, FastAPI, Uvicorn |
| AI orchestration | LangChain, LangGraph |
| Local language model | Ollama, Qwen 2.5 3B |
| Telemetry messaging | MQTT, Mosquitto, Paho MQTT |
| Local storage | SQLite |
| Frontend | React, Vite, JavaScript |
| Visualization | Chart.js |
| Cloud IoT architecture | AWS IoT Core, AWS IoT SiteWise |

## 📋 Prerequisites

Install the following before starting:

- Python 3.12 or a compatible Python version
- Node.js and npm
- Git
- [Ollama](https://ollama.com/)
- Mosquitto MQTT broker

The commands below use macOS with Homebrew. For other operating systems, install the equivalent packages using their official installation instructions.

### 1. Install the required software

If Homebrew is installed:

```bash
brew install python@3.12 node mosquitto
```

Install Ollama from [ollama.com](https://ollama.com/).

Start the local MQTT broker:

```bash
brew services start mosquitto
```

Download the model used by the prototype:

```bash
ollama pull qwen2.5:3b
```

Ensure Ollama is running before starting the backend.

## 🚀 Run the Project Locally

### 2. Clone the repository

```bash
git clone https://github.com/gaurav-seth/bess-ai-sidekick.git
cd bess-ai-sidekick
```

### 3. Create a Python virtual environment

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Install the Python dependencies:

```bash
pip install fastapi "uvicorn[standard]" paho-mqtt langchain langchain-ollama langgraph langgraph-checkpoint-sqlite
```

If the project later adds or pins dependencies in a `requirements.txt` file, prefer that file for a reproducible installation.

### 4. Start the telemetry service

Open a terminal in the project root, activate the virtual environment, and run:

```bash
python telemetry_service.py
```

This service subscribes to the local MQTT telemetry topic and stores incoming readings in SQLite.

### 5. Start the BESS simulator

Open a second terminal in the project root and activate the virtual environment:

```bash
python bess_simulator.py
```

The simulator publishes JSON readings every five seconds to:

```text
bess/rack-01/telemetry
```

The default local MQTT broker address is `127.0.0.1:1883`.

### 6. Start the FastAPI backend

Open a third terminal, activate the virtual environment, and run:

```bash
uvicorn api:app --reload
```

The API should be available at:

- API root: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- Latest telemetry: `http://127.0.0.1:8000/telemetry/latest`
- Telemetry history: `http://127.0.0.1:8000/telemetry/history`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

The AI assistant uses the locally installed Ollama model. Ensure the selected model is available before sending chat requests.

### 7. Start the React frontend

Open a fourth terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

You should now be able to explore the dashboard and chat interface while the simulator generates telemetry.

## 🔌 API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Check backend health |
| `GET /telemetry/latest` | Retrieve the latest battery reading |
| `GET /telemetry/history` | Retrieve telemetry history |
| `POST /chat` | Send a message to the AI assistant |

Use the interactive API documentation at `/docs` to inspect request and response schemas.

## ☁️ AWS IoT Core and AWS IoT SiteWise

The cloud integration path explores how to:

1. Publish telemetry securely to AWS IoT Core using MQTT and device certificates.
2. Route incoming telemetry through an AWS IoT rule.
3. Map battery measurements to properties of an AWS IoT SiteWise asset.
4. Make asset telemetry available to an application and AI tools through a cloud-aware telemetry access layer.

The local prototype is designed to be explored without AWS credentials. To run a cloud-connected version, you will need an appropriately configured AWS account, IoT policies, SiteWise assets and properties, permissions, and application configuration.

**Security:** Never commit device certificates, private keys, AWS credentials, or `.env` files to GitHub. The `.aws-device/` directory is intentionally excluded from version control.

## 🗂️ Project Structure

```text
bess-ai-sidekick/
├── api.py                   # FastAPI application
├── bess_agent.py            # LangChain AI agent
├── bess_middleware.py       # Agent middleware
├── bess_schemas.py          # Data schemas
├── bess_simulator.py        # Simulated battery telemetry
├── bess_tools.py            # Tools available to the AI agent
├── maintenance_cases.py     # Maintenance-related logic
├── telemetry_service.py     # MQTT telemetry ingestion
├── telemetry_store.py       # SQLite telemetry access
├── test_bess_tool.py        # Tool tests
├── test_llm.py              # LLM test
├── test_structured_output.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Dashboard and chat components
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## 🧪 Troubleshooting

**No telemetry appears on the dashboard**
- Confirm Mosquitto is running.
- Start `telemetry_service.py` before or alongside the simulator.
- Confirm both components use the same MQTT broker and topic.

**The AI assistant does not respond**
- Confirm Ollama is running.
- Run `ollama list` and verify `qwen2.5:3b` is installed.
- Check the FastAPI terminal for errors.

**The frontend cannot reach the backend**
- Confirm FastAPI is running on port `8000`.
- Check the browser console and the frontend's API configuration.
- Verify any required CORS settings.

**Port already in use**
- Stop the existing process using the port or configure the application to use another available port.

## 🔮 Future Enhancements

- Complete AWS IoT Core and SiteWise telemetry integration.
- Add anomaly detection and configurable battery health alerts.
- Add telemetry trend analysis and more operational AI tools.
- Integrate maintenance workflows and recommendations.
- Add automated testing, containerization, and cloud deployment.

## 🎯 Project Goal

Explore how industrial telemetry, cloud IoT services, and agentic AI can work together to make battery operations more observable, explainable, and easier to troubleshoot.

**Built as a hands-on prototype exploring Industrial IoT + Generative AI.**

## 👨‍💻 Author

**Gaurav Seth**

Software & Cloud Architect | AI Engineering | AWS | Industrial IoT | Agentic AI

GitHub: [gaurav-seth](https://github.com/gaurav-seth)
