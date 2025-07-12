import { Ollama } from "@langchain/ollama"
// import { InferenceClient } from "@huggingface/inference";
import { Picovoice } from "@picovoice/picovoice-node"
import { Porcupine } from "@picovoice/porcupine-node" 
import mic from "mic";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Leopard } from "@picovoice/leopard-node"
import textToSpeech from "@google-cloud/text-to-speech"
import { playAudioFile } from "./audio-player.js"
import fs, { unlink } from "fs"

import dotenv from "dotenv"
import { error } from "console";
import { PvRecorder } from "@picovoice/pvrecorder-node"
const { platform: os } = process;


dotenv.config();

const BASE_URL = process.env.BASE_URL
const PICOVOICE_API_KEY = process.env.PICOVOICE_API_KEY
process.env.GOOGLE_APPLICATION_CREDENTIALS = "jarvis.json"



const frameLength = 512
const recorder = new PvRecorder( frameLength, -1 )

let porcupine = new Porcupine(
    PICOVOICE_API_KEY,
    [(os === `win32`) ? "Jarvis_en_windows_v3_0_0.ppn" : "Jarvis_en_raspberry-pi_v3_0_0.ppn"],
    [0.5]
)

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
    console.log("Listening for JARVIS")
    await playAudioFile("beep.mp3")
    while(1) {
        const frames = await recorder.read();
        const keywordIndex = porcupine.process(frames);
        // detected `Jarvis
        if (keywordIndex === 0) {
            console.log("JARVIS")
            // RECORD INPUT VOICE FILE
            console.log('Recording... Speak now. Will stop after silence.');
            // Create mic instance
            const micInstance = mic({
            rate: "22000",
            channels: "1",
            bitwidth: "16",
            encoding: "signed-integer",
            device: "default", // optional: set your input device
            });

            const micInputStream = micInstance.getAudioStream();
            const outputFile = fs.createWriteStream("input.mp3");
            const ffmpegProcess = ffmpeg()
            .input(micInputStream)
            .inputFormat("s16le")
            .audioCodec("libmp3lame")
            .audioBitrate(197)
            .format("mp3")
            .on("error", (err) => {
                console.error("FFmpeg error:", err.message);
            })
            .on("end", async () => {
                console.log("Recording finished and saved to input.mp3");
                const handle = new Leopard(PICOVOICE_API_KEY)
                const result = await handle.processFile("input.mp3");
                console.log(result.transcript)
                const response = await llm.invoke([result.transcript])
                await TextToSpeechWithGoogle( response, "output.mp3");
            })
            .pipe(outputFile);
            // Start recording
            micInstance.start();
            await playAudioFile("beep.mp3")

            await new Promise(resolve => {
                setTimeout(async () => {
                    micInstance.stop();
                    playAudioFile("beep.mp3");
                    resolve();
                }, 7000);
            });
        }
    }
}

start();
