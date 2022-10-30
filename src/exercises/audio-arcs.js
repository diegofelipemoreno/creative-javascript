const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const eases = require('eases');

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const numCircles = 5;
const numSlices = 9;
const slice = Math.PI * 2 / numSlices
const radius = 200;
const bins = [];

let audio;
let audioContext;
let audioData;
let sourceNode;
let analyserNode;
let manager;
let bin;
let mapped;
let minDecibel;
let maxDecibel;

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

const drawSound = (context, audioData, width, height, lineWidths, lineWidth) => {
    let cRadius = radius;

    context.save();
    context.translate(width * 0.5, height * 0.5);

    for (let i = 0; i < numCircles; i++)  {
        context.save();

        for (let j = 0; j < numSlices; j++) {
            context.rotate(slice);
            context.lineWidth = lineWidths[i];

            // i * numSlices for each circle
            // j eache slide in circle
            bin = bins[i * numSlices + j];

            if (!bin) {
                // skip the code below
                continue;
            }

            mapped = math.mapRange(audioData[bin], minDecibel, maxDecibel, 0, 1, true);
            lineWidth = lineWidths[i] * mapped;

            if (lineWidth < 1) {
                // skip the code below
                continue;
            }

            context.lineWidth = lineWidth;

            context.beginPath();
            // 0.5 cuz we need on half line width for the arc
            context.arc(0, 0, cRadius + context.lineWidth * 0.5, 0, slice);
            context.stroke();
        }

        cRadius += lineWidths[i];

        context.restore();
    }

    context.restore();
}

const getLineWidths = () => {
    const lineWidths = [];
    let lineWidth;

    for (let index = 0; index < numCircles * numSlices; index++) {
        bin = random.rangeFloor(4, 64);

        if (random.value() > 0.5) {
            bin = 0;
        }

        bins.push(bin);
    }

    for (let index = 0; index < numCircles; index++) {
        const t = index / (numCircles - 1);

        lineWidth = eases.quadIn(t) * 200 + 20;

        lineWidths.push(lineWidth);
    }

    return {lineWidths, lineWidth};
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

    minDecibel = analyserNode.minDecibels;
    maxDecibel = analyserNode.maxDecibels;
   
    audioData = new Float32Array(analyserNode.frequencyBinCount);
}

const sketch = () => {
    const {lineWidths, lineWidth} = getLineWidths();
    
    return ({context, width, height}) => {
        context.fillStyle = "#EEEAE0";
        context.fillRect(0, 0, width, height);

        if (!audioContext) {
            return;
        }

        analyserNode.getFloatFrequencyData(audioData);

        drawSound(context, audioData, width, height, lineWidths, lineWidth);
    }
}

const init = async() => {
    listenEvents();

    // Manages the sketch programmatically.
    manager = await canvasSketch(sketch, settings);

    manager.pause();
}

init();
