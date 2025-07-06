import { Ollama } from "@langchain/ollama"
// import { InferenceClient } from "@huggingface/inference";
import { Leopard } from "@picovoice/leopard-node"
import textToSpeech from "@google-cloud/text-to-speech"
import { playAudioFile } from "./audio-player.js"
import fs, { unlink } from "fs"

import dotenv from "dotenv"
import { error } from "console";

dotenv.config();

const BASE_URL = process.env.BASE_URL
const PICOVOICE_API_KEY = process.env.PICOVOICE_API_KEY
process.env.GOOGLE_APPLICATION_CREDENTIALS = "jarvis.json"

// const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY


// const hf = new InferenceClient(HUGGINGFACE_API_KEY);
// const response = await hf.textToSpeech({
//     model: "sesame/csm-1b",
//     inputs: "Hello World!"
// })

// console.log(response)


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
        return outputFile
    } catch (error ){
        console.error("Error:", error);
    }
}

(async()=>{
    try {

        const handle = new Leopard(PICOVOICE_API_KEY)
        const result = handle.processFile("input.mp3");
        const response = await llm.invoke([result.transcript])
        const outputFile = await TextToSpeechWithGoogle( response, "output.mp3");
        playAudioFile("output.mp3")
    } catch (err) {
        throw err
    }

})()

