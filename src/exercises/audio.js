const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

let audio;
let audioContext;
let audioData;
let sourceNode;
let analyserNode;
let manager;

const listenEvents = () => {
    let isPlaying = false;

    window.addEventListener('mouseup', (event) => {
        if (!audioContext) {
            createAudio();
        }

        if (isPlaying) {
            audio.pause();
            manager.pause();
        } else {
            audio.play();
            manager.play();
        }

        audio.onplaying = () => isPlaying = true;
        audio.onpause = () => isPlaying = false;
    });
}

const drawSound = (context, audioData, width, height, bins) => {
    // constrain decibel number to range 0 to 1.
    // audioData[12] cuz that low frequencies form the analyser data are more that the higher frequencies. 
    //const mapped = math.mapRange(audioData[12], analyserNode.minDecibels, analyserNode.maxDecibels, 0, 1, true);
    
    for (let index = 0; index < bins.length; index++) {
        const bin = bins[index];
        const mapped = math.mapRange(audioData[bin], analyserNode.minDecibels, analyserNode.maxDecibels, 0, 1, true);
        const radius = mapped * 200;

        context.save();
        context.translate(width * 0.5, height * 0.5);
        context.lineWidth = 10;
    
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();
        
        context.restore();
    }
}

const createAudio = () => {
    audio = document.createElement('audio');
    audio.src = './images/sound.mp3';

    audioContext = new AudioContext();
    sourceNode = audioContext.createMediaElementSource(audio);
    //To the speaker
    sourceNode.connect(audioContext.destination);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 512;
    analyserNode.smoothingTimeConstant = 0.9;
    //To the speaker
    sourceNode.connect(analyserNode);
   
    audioData = new Float32Array(analyserNode.frequencyBinCount);
}

const sketch = () => {
    const bins = [4, 12, 37];

    return ({context, width, height}) => {
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);

        if (!audioContext) {
            return;
        }

        analyserNode.getFloatFrequencyData(audioData);
        drawSound(context, audioData, width, height, bins);
    }
}

const init = async() => {
    listenEvents();

    // Manages the sketch programmatically.
    manager = await canvasSketch(sketch, settings);

    manager.pause();
}

init();
