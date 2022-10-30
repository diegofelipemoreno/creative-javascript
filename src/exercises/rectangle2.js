
const canvasSketch = require('canvas-sketch');
const {math} = require('canvas-sketch-util');

const settings = {
  dimensions: [ 1080, 1080 ],
};

const drawSkewedRect = ({context, w, h, degrees}) => {
    const angle = math.degToRad(degrees);
    const rx = w * Math.cos(angle);
    const ry = w * Math.sin(angle);

    context.save();
    //Coordinates where the drawing starts. 
    context.translate(rx * -0.5, (ry + h) * -0.5);

    //context.strokeRect(0, 0, 10, 10); // Debuggers :)

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(rx, ry);
    context.lineTo(rx, ry + h);
    context.lineTo(0, h);
    context.closePath();
    context.stroke();

    context.restore();
}


const sketch = () => {
  let x;
  let y;
  let w;
  let h;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    x = width * 0.5;
    y = height * 0.5;
    w = width * 0.6;
    h = height * 0.1;

    context.save();
    // Move the canvas and content to the param coordinates. (Are the new 0,0 coordinates)
    context.translate(x, y);
    context.strokeStyle = 'blue';

    drawSkewedRect({
        context,
        w,
        h,
        degrees: -45,
    });

    context.restore();
  };
};

canvasSketch(sketch, settings);