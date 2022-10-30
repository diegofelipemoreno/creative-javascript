const canvasSketch = require('canvas-sketch');
const {math, random} = require('canvas-sketch-util');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  duration: 10
};

let positionIncrease = 0;
let recFinishPathCounter = 0;

const drawSkewedRect = ({context, w, h, degrees}) => {
    const angle = math.degToRad(degrees);
    const rx = w * Math.cos(angle);
    const ry = w * Math.sin(angle);

    context.save();
    //Coordinates where the drawing starts. 
    context.translate(rx * -0.5, (ry + h) * -0.5);

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(rx, ry);
    context.lineTo(rx, ry + h);
    context.lineTo(0, h);
    context.closePath();
    context.stroke();

    context.restore();
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const renderRectangle = (context, rec, width, height) => {
    const {xPos, yPos, recWidth, recHeight, stroke, fill, blend, degrees} = rec;
    const shadowColor = Color.offsetHSL(fill, 0, 0, -20);

    //Get the opacity RGBA
    shadowColor.rgba[3] = 0.5;

    context.save();
    context.translate(width * -0.5, height * -0.5);
    context.translate(xPos, yPos);
    context.strokeStyle = stroke;
    context.fillStyle = fill;
    context.lineWidth = 10;

    context.globalCompositeOperation = blend;
    //context.strokeRect(xPos, yPos, 10, 10); // Debuggers :)
  
    drawSkewedRect({
      context,
      w: recWidth,
      h: recHeight,
      degrees,
    });

    context.shadowColor = Color.style(shadowColor.rgba);

    context.shadowOffsetX = -10;
    context.shadowOffsetY = 20;

    context.fill();
    context.shadowColor = null;
    context.stroke();

    context.globalCompositeOperation = 'source-over';

    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();

    context.restore();
}

const drawPolygon = (context, polygonConfig) => {
  // 2PI === 360 Degrees.
  const {sides, radius} = polygonConfig;
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);
  
  for (let index = 1; index <= sides; index++) {
    const tetha = index * slice - (Math.PI / 2);

    context.lineTo(Math.cos(tetha) * radius, Math.sin(tetha) * radius);
  }

  context.closePath();
}

const setPolygonOutline = (context, polygonConfig, rectColors) => {
    context.save();
    context.translate(0, 0);
    drawPolygon(context, polygonConfig);
    context.globalCompositeOperation = 'color-burn';
    context.lineWidth = 30;
    context.strokeStyle = rectColors[0].hex;
    context.stroke();
    context.restore();
}

const getRectanglesConfig = (config) => {
    const {contextDimensions, recDimensionsRange, amount, rectColors, degrees} = config;
    const {width, height} = contextDimensions;
    const rects = [];

    for (let index = 0; index < amount; index++) {
        const recWidth = getRandomInt(...recDimensionsRange.width);
        const recHeight = getRandomInt(...recDimensionsRange.height);
        const xPos = getRandomInt(0, width);
        const yPos = getRandomInt(0, height);
        const fill = random.pick(rectColors).hex;
        const stroke = random.pick(rectColors).hex;
        const blend = (random.value() > 0.5) ? 'overlay' : 'source-over';
    
        rects.push({xPos, yPos, recWidth, recHeight, fill , stroke, blend, degrees});
    }

    return rects;
}

const recAnimation = (context, contextDimensions, rects, positionIncrease) => {
  const {width, height} = contextDimensions;

  rects.forEach((rec, index) => {
    rec.xPos += (index % 2) ? positionIncrease : (positionIncrease + index) * .01;
    rec.yPos -= (index % 2) ? positionIncrease : (positionIncrease + index) * .01;

    if (rec.xPos > width) {
      recFinishPathCounter += 1; 
    }

    renderRectangle(context, rec, width, height);
  });
}

const addNewRec = (recConfig, rects, contextDimensions) => {
  const newRec = getRectanglesConfig(recConfig);
  const {width, height} = contextDimensions;

  newRec[0].xPos = getRandomInt(-width, 0)
  newRec[0].yPos = getRandomInt(-height, 2000)

  rects.push(...newRec);
}

const sketch = ({ width, height }) => {
  const degrees = -45;
  const amount = 20;
  const recDimensionsRange = {
    width: [600, width],
    height: [40, 200]
  }
  const contextDimensions = { width, height };
  const bgColor = random.pick([
    random.pick(risoColors),
    random.pick(risoColors),
  ]).hex;
  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
  ];
  const recConfig = {contextDimensions, recDimensionsRange, amount, rectColors, degrees};

  const rects = getRectanglesConfig(recConfig);
  const polygonConfig = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58,
  }

  return ({ context, width, height }) => {
    positionIncrease = positionIncrease + 0.001;
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(polygonConfig.x, polygonConfig.y);
    // Everything is drawn after the clip appears inside, clip mask.
    context.clip();
    recAnimation(context, contextDimensions, rects, positionIncrease);

    if (recFinishPathCounter >= amount/2) {
      addNewRec({...recConfig, amount: 1}, rects, contextDimensions);
    }

    setPolygonOutline(context, polygonConfig, rectColors);
    context.restore();
  };
};

canvasSketch(sketch, settings);