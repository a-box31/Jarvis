import { spawn } from "child_process"

const ffmpeg = spawn('ffmpeg', [
  '-f', 's16le',
  '-ar', '44100',
  '-ac', '1',
  '-i', 'pipe:0',
  '-acodec', 'libmp3lame',
  '-ab', '192k',
  'output.mp3'
]);

const arecord = spawn('arecord', [
  '-f', 'cd',         // Format: 16-bit, 44.1kHz, stereo
  '-t', 'raw'         // Raw PCM output
]);

console.log('Recording... Speak now. Will stop after silence.');

// Pipe rec (sox) into ffmpeg
arecord.stdout.pipe(ffmpeg.stdin);

// Automatically close when done
arecord.on('close', () => {
  console.log('Stopped recording (no more voice input).');
  ffmpeg.stdin.end();
});

ffmpeg.on('close', () => {
  console.log('MP3 file saved as output.mp3');
});
