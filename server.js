import { Ollama } from "@langchain/ollama"
// import { InferenceClient } from "@huggingface/inference";
import { Porcupine } from "@picovoice/porcupine-node" 
import { spawn } from "child_process"
import { Leopard } from "@picovoice/leopard-node"
import textToSpeech from "@google-cloud/text-to-speech"
import { playAudioFile } from "./audio-player.js"
import fs, { unlink } from "fs"

import dotenv from "dotenv"
import { PvRecorder } from "@picovoice/pvrecorder-node"

dotenv.config();

const BASE_URL = process.env.BASE_URL
const PICOVOICE_API_KEY = process.env.PICOVOICE_API_KEY
process.env.GOOGLE_APPLICATION_CREDENTIALS = "jarvis.json"

const { platform: os } = process;


const frameLength = 512
const recorder = new PvRecorder( frameLength, -1 )

let porcupine = new Porcupine(
    PICOVOICE_API_KEY,
    [(os === `win32`) ? "Jarvis_en_windows_v3_0_0.ppn" : "Jarvis_en_raspberry-pi_v3_0_0.ppn"],
    [0.5]
)

const ffmpeg = spawn('ffmpeg', [
  '-f', 's16le',
  '-ar', '44100',
  '-ac', '1',
  '-i', 'pipe:0',
  '-acodec', 'libmp3lame',
  '-ab', '192k',
  'input.mp3'
]);

const rec = (os === "win32") ?
spawn('sox', [
  '-d',                     // Default recording device
  '-t', 'raw',              // Output raw audio
  '-r', '44100',            // Sample rate
  '-c', '1',                // Mono
  '-b', '16',               // 16-bit
  '-e', 'signed-integer',   // Encoding
  '-',                      // Output to stdout
  'silence', '1', '0.3', '1%', '1', '1.5', '1%'
])
:
spawn('arecord', [
  '-f', 'cd',         // Format: 16-bit, 44.1kHz, stereo
  '-t', 'raw'         // Raw PCM output
]) 


const llm = new Ollama({
    model: "llama3.1",
    temperature: 0,
    maxRetries: 2,
    baseUrl: BASE_URL
})

async function TextToSpeechWithGoogle(text, outputFile){
    try{
        const request = {
            input: {text},
            voice: { languageCode: 'en-US', ssmlGender: "MALE" },
            audioConfig: {audioEncoding: 'MP3'}
        }
        const client = new textToSpeech.TextToSpeechClient();
        const [response] = await client.synthesizeSpeech(request)
        fs.writeFileSync(outputFile, response.audioContent, 'binary')
        await playAudioFile(outputFile)
    } catch (error ){
        console.error("Error:", error);
    }
}

const start = async () => {
    recorder.start();
    while(1) {
        const frames = await recorder.read();
        const keywordIndex = porcupine.process(frames);
        // detected `Jarvis
        if (keywordIndex === 0) {
            console.log("JARVIS")
            // RECORD INPUT VOICE FILE
            console.log('Recording... Speak now. Will stop after silence.');

            // Pipe rec (sox) into ffmpeg
            rec.stdout.pipe(ffmpeg.stdin);

            // Automatically close when done
            rec.on('close', () => {
                console.log('Stopped recording (no more voice input).');
                ffmpeg.stdin.end();
            });

            ffmpeg.on('close', () => {
                console.log('MP3 file saved as input.mp3');
            });

            const handle = new Leopard(PICOVOICE_API_KEY)
            const result = handle.processFile("input.mp3");
            const response = await llm.invoke([result.transcript])
            await TextToSpeechWithGoogle( response, "output.mp3");
        }
    }
}

start();
