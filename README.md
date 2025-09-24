# Jarvis
Here’s a polished **README.md** for your code that explains what it does, how to set it up, and how to use it:

---

# 🎙️ Jarvis Voice Assistant

This project is a **voice-activated AI assistant** powered by:

* **Picovoice Porcupine** → Wake word detection ("Jarvis")
* **Picovoice Leopard** → Speech-to-text transcription
* **LangChain + Ollama** → Large Language Model (LLM) response generation
* **Google Cloud Text-to-Speech** → Convert responses into natural speech
* **Mic + FFmpeg** → Real-time voice recording and processing
* **Custom Audio Player** → Playback of AI-generated responses

When you say **"Jarvis"**, the assistant will:

1. Record your voice.
2. Transcribe your speech.
3. Send it to the LLM (LLaMA 3.1 in this setup).
4. Generate a response.
5. Convert the response into audio.
6. Play it back to you.

---

## ⚡ Features

* 🎤 **Wake Word Detection** – Triggers when "Jarvis" is heard.
* 📝 **Speech Recognition** – Converts spoken input to text.
* 🤖 **LLM Integration** – Uses **Ollama** for natural responses.
* 🔊 **Text-to-Speech** – Plays responses out loud with **Google TTS**.
* 🛠️ **Cross-Platform** – Supports Windows, macOS, Linux, Raspberry Pi.

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/a-box31/Jarvis.git
cd Jarvis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install FFmpeg

This project requires FFmpeg for audio processing.

* **macOS (Homebrew):**

  ```bash
  brew install ffmpeg
  ```
* **Ubuntu/Debian:**

  ```bash
  sudo apt update && sudo apt install ffmpeg
  ```
* **Windows:**
  [Download FFmpeg](https://ffmpeg.org/download.html) and ensure it’s in your PATH.

### 4. Environment Variables

Create a `.env` file in the project root:

```env
BASE_URL=http://localhost:11434  # Ollama endpoint
PICOVOICE_API_KEY=your_picovoice_api_key
```

Also ensure you have a Google Cloud service account key JSON file named `jarvis.json` in the project directory.

---

## 🚀 Usage

Start the assistant:

```bash
node server.js
```

You’ll hear a **beep**. Then say:

```
Jarvis
```

* The assistant starts recording your voice for 7 seconds.
* Your input is transcribed and processed.
* The AI response is spoken back to you.

---

## 🗂️ Project Structure

```
├── index.js              # Main entry point
├── audio-player.js       # Plays generated audio files
├── beep.mp3              # Notification sound
├── input.mp3             # Recorded voice input (temporary)
├── output.mp3            # AI response (temporary)
├── jarvis.json           # Google Cloud credentials
├── .env                  # Environment variables
```

---

## 🔑 Requirements

* Node.js >= 18
* Picovoice API Key → [Get one here](https://console.picovoice.ai/)
* Google Cloud Text-to-Speech credentials → [Setup guide](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries)
* Ollama running locally with the `llama3.1` model

---

## 🛠️ Customization

* Change wake word model file in:

  ```js
  new Porcupine(PICOVOICE_API_KEY, ["Jarvis_en_windows_v3_0_0.ppn"])
  ```
* Modify the recording duration (default 7s) inside:

  ```js
  setTimeout(() => { micInstance.stop() }, 7000);
  ```
* Adjust LLM parameters (`temperature`, `maxRetries`) in the `Ollama` instance.

---

## ⚠️ Notes

* You may need different **Porcupine wake word files** depending on your OS/hardware (Windows, Raspberry Pi, etc.).
* This project is currently blocking (infinite loop `while(1)`), so stop with **CTRL+C**.
* Temporary audio files (`input.mp3`, `output.mp3`) are overwritten each interaction.

---

## 📜 License

MIT License. Free to use and modify.

---

## ⚠️ Demo Video

[demo link](https://youtu.be/APdMr0-JcJU)

---


helpful links
-----------------------------------------------------------------------
https://ffmpeg.org/
https://cloud.google.com/text-to-speech
https://ollama.com/
https://www.docker.com/
http://langchain.com/


🧩 Challenges & Learnings
🔥 Most Challenging Part

The hardest part of this project was orchestrating multiple asynchronous systems—wake word detection, speech recording, transcription, LLM invocation, text-to-speech synthesis, and audio playback—into a smooth, real-time pipeline.

Keeping the timing tight (detecting silence, recording, and cutting off properly).

Handling audio encoding and decoding across different libraries (mic → FFmpeg → Picovoice → Google TTS).

Making wake word detection cross-platform (Windows vs Raspberry Pi model files).

Managing API credentials securely (Picovoice, Google Cloud, Ollama).

📚 What I Learned

How to integrate real-time voice pipelines using mic, ffmpeg, and pvrecorder.

Best practices for working with speech-to-text (STT) and text-to-speech (TTS) APIs.

How wake word engines (Porcupine) are tuned for different hardware and environments.

Practical experience with LangChain + Ollama for local LLM inference.

Debugging asynchronous Node.js audio streams, which required a strong understanding of event-driven programming.

🚀 Contribution to Career Goals

This project pushed me deeper into full-stack AI development, especially in voice AI and real-time interaction systems.

It strengthened my AI + systems integration skills, which are crucial for building production-ready AI assistants.

It gave me hands-on experience with edge AI tools (Picovoice) and local LLMs (Ollama)—a growing area in AI infrastructure.

It also sharpened my ability to design end-to-end solutions, from low-level audio handling all the way to natural language generation and playback.

This aligns directly with my career goal of becoming a specialist in AI-powered applications, where I can design systems that blend speech, language models, and real-time interactivity into seamless user experiences.


🔮 Future Plans

This project is just the starting point of building a truly agentic voice assistant. Some planned improvements and new features include:

🗂️ Chat History – Implement conversation memory using LangChain.js so Jarvis can remember context across multiple interactions.

🕸️ Agentic Behavior – Explore LangGraph and MCP servers to enable the assistant to act autonomously, call external tools, and chain multiple reasoning steps.

🌐 Real-Time Data Access – Integrate web search or APIs so Jarvis can query up-to-date information (news, weather, stock prices, etc.).

🛒 Task Automation – Extend capabilities to perform tasks such as ordering products online, sending emails, or scheduling events.

🎛️ Smarter Wake Word Handling – Add multiple wake words or even a natural hotword training system for personalized activation.

📱 Multi-Platform Support – Package the assistant for use on mobile devices and possibly deploy it on Raspberry Pi as a lightweight home assistant.

🗣️ More Natural TTS – Experiment with advanced voice synthesis (e.g., OpenAI TTS or ElevenLabs) for more human-like responses.

Ultimately, the vision is to evolve Jarvis into an autonomous voice-based AI agent that can understand, reason, and act in the real world—not just answer questions.



🙏 Acknowledgment

I acknowledge using ChatGPT (OpenAI GPT-5) for the following tasks:

Drafting and refining the README.md documentation.

Structuring the Challenges & Learnings and Future Plans sections.

Brainstorming feature improvements and roadmap ideas.

Clarifying technical explanations for project components (LLM integration, TTS, STT, wake word detection, etc.).

✨ Surprising Benefits of Using GPT

Helped me explain complex technical systems more clearly, especially for documentation.

Accelerated the writing process, freeing me to focus more on coding and experimenting.

Acted as a thinking partner, suggesting improvements and perspectives I hadn’t considered (like turning “Future Plans” into a roadmap).

Provided polished language and formatting, making the project presentation more professional.

⚠️ Unanticipated Challenges

Needed to ensure that explanations remained accurate and not overly generic, since GPT sometimes assumes details.

Occasionally suggested extra features or steps that weren’t part of my initial scope, requiring me to filter what was realistic.

Had to double-check technical accuracy (like command-line installs or API configurations) against official docs.
