const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const eases = require('eases');

const { Particle } = require('./particle');

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const particles = [];
const cursor = {x: 9999, y: 9999};
let elemCanvas;
let imageA;
let imgAcanvas;
let imageData;

const createImageCanvas = (imgCanvas) => {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');

    canvas.width = imgCanvas.width;
    canvas.height = imgCanvas.height;

    canvasContext.drawImage(imgCanvas, 0, 0);

    return canvasContext;
}

const createParticlesCircleRandom = ({width, height}) => {
    const pos = [];
    let x;
    let y;
    let particle;

    for (let index = 0; index < 200; index++) {
        x = width / 2;
        y = height / 2;

        random.insideCircle(400, pos);
        x += pos[0];
        y += pos[1];

        particle = new Particle({x, y});
        particles.push(particle);
    }
}

const createParticles = ({width, height}) => {
    const numCircles = 15;
    let dotRadius = 12;
    let cirRadius = 0;
    const fitRadius = dotRadius;
    const gapDot = 4;
    const gapCircle = 8;


    for (let i = 0; i < numCircles; i++) {
       const circumference = Math.PI * 2 * cirRadius;
                                                     // Diameter
       const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)): 1;
       const fitSlice = Math.PI * 2 / numFit;

       for (let j = 0; j < numFit; j++) {
         const theta = fitSlice * j;

         x = Math.cos(theta) * cirRadius;
         y = Math.sin(theta) * cirRadius;

         x += width / 2;
         y += height / 2;

         radius = dotRadius;
        
         particle = new Particle({x, y, radius});
         particles.push(particle);
       }

       cirRadius += fitRadius * 2 + gapCircle;   
       dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
    }
}

const loadImage = async(url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}

const renderParticles = (particles, context) => {
    // To render the bigger particles on front of the smaller ones
    particles.sort((a, b) => a.scale - b.scale);

    particles.forEach((particle) => {
        particle.update(cursor);
        particle.draw(context);
    });
}

const getCanvasDimensions = (offsetX, offsetY) => {
    // To maintain the proportions of canvas width height if/if not the canvas is resized.
    const x = (offsetX / elemCanvas.offsetWidth) * elemCanvas.width;
    const y = (offsetY / elemCanvas.offsetHeight) * elemCanvas.height;

    return {x, y}
}

const onMouseMove = (event) => {
    const {offsetX, offsetY} = event;
    const {x, y} = getCanvasDimensions(offsetX, offsetY);

    cursor.x = x;
    cursor.y = y;
}

const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    cursor.x = 9999;
    cursor.y = 9999;
}

const onMouseDown = () => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

const listenEvents = () => {
    window.addEventListener('mousedown', onMouseDown);
}

const sketch = ({width, height, canvas}) => {
    elemCanvas = canvas;

    createParticles({width, height});

    return ({context, width, height}) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        renderParticles(particles, context, width, height);        
    }
}

const init = async() => {
    imageA = await loadImage('./images/imageA.jpeg');

    if (imageA) {
        imgAcanvas = createImageCanvas(imageA);

        imageData = imgAcanvas.getImageData(0, 0, imageA.width, imageA.height);

       console.log(imgAcanvas);
    }

    canvasSketch(sketch, settings);
    listenEvents();
}

init();
