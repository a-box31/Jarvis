import fs from "fs";
import mic from "mic";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

// Create mic instance
const micInstance = mic({
  rate: "22000",
  channels: "1",
  bitwidth: "16",
  encoding: "signed-integer",
  device: "default", // optional: set your input device
});

const micInputStream = micInstance.getAudioStream();

// Output file stream
const outputFile = fs.createWriteStream("output.mp3");

// Pipe mic to ffmpeg to convert to MP3
const ffmpegProcess = ffmpeg()
  .input(micInputStream)
  .inputFormat("s16le")
  .audioCodec("libmp3lame")
  .audioBitrate(197)
  .format("mp3")
  .on("error", (err) => {
    console.error("FFmpeg error:", err.message);
  })
  .on("end", () => {
    console.log("Recording finished and saved to output.mp3");
  })
  .pipe(outputFile);

// Start recording
micInstance.start();
console.log("recording for 10 seconds")
setTimeout(() => {
  console.log("mic stopped")
  micInstance.stop();
}, 10000) //stop after 5 seconds
