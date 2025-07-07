import { Ollama } from "@langchain/ollama"
// import { InferenceClient } from "@huggingface/inference";
import { Picovoice } from "@picovoice/picovoice-node"
import { Porcupine } from "@picovoice/porcupine-node" 
import { Leopard } from "@picovoice/leopard-node"
import textToSpeech from "@google-cloud/text-to-speech"
import { playAudioFile } from "./audio-player.js"
import fs, { unlink } from "fs"

import dotenv from "dotenv"
import { error } from "console";
import { PvRecorder } from "@picovoice/pvrecorder-node"

dotenv.config();

const BASE_URL = process.env.BASE_URL
const PICOVOICE_API_KEY = process.env.PICOVOICE_API_KEY
process.env.GOOGLE_APPLICATION_CREDENTIALS = "jarvis.json"

const { platform: os } = process;


// const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY


// const hf = new InferenceClient(HUGGINGFACE_API_KEY);
// const response = await hf.textToSpeech({
//     model: "sesame/csm-1b",
//     inputs: "Hello World!"
// })

// console.log(response)
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

// (async()=>{
//     try {
        
//         const handle = new Leopard(PICOVOICE_API_KEY)
//         const result = handle.processFile("input.mp3");
//         const response = await llm.invoke([result.transcript])
//         await TextToSpeechWithGoogle( response, "output.mp3");
//     } catch (err) {
//         throw err
//     }

// })()

const start = async () => {
    recorder.start();
    while(1) {
        const frames = await recorder.read();
        const keywordIndex = porcupine.process(frames);
        if (keywordIndex === 0) {
            // detected `Jarvis
            console.log("JARVIS")
        }
    }
}

start();
