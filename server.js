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
        // detected `Jarvis
        if (keywordIndex === 0) {
            console.log("JARVIS")
            const MicRecorder = require('mp3-recorder');
 
            // New instance
            const recorder = new MicRecorder({
            bitRate: 128
            });
            
            // Start recording. Browser will request permission to use your microphone.
            recorder.start().then(() => {
            // something else
            }).catch((e) => {
            console.error(e);
            });
            
            // Once you are done singing your best song, stop and get the mp3.
            recorder
            .stop()
            .getMp3().then(([buffer, blob]) => {
            // do what ever you want with buffer and blob
            // Example: Create a mp3 file and play
            const file = new File(buffer, 'input.mp3', {
                type: blob.type,
                lastModified: Date.now()
            });
            
            const player = new Audio(URL.createObjectURL(file));
            player.play();
            
            }).catch((e) => {
            alert('We could not retrieve your message');
            console.log(e);
            });
        }
    }
}

start();
