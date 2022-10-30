
const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ],
};

const sketch = ({context}) => {
  let x;
  let y;
  let w;
  let h;


  context.restore();

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    x = width * 0.5;
    y = height * 0.5;
    w = width * 0.6;
    h = height * 0.1;

    context.save();
    // Move the canvas and content to the param coordinates. Where the drawing starts.
    context.translate(x, y);
    context.translate(w * -0.5, h * -0.5);

    context.strokeStyle = 'blue';
context.strokeRect(0, 0, 20, 20); // Debuggers :)
context.strokeRect(0, 0, 10, 10); // Debuggers :)
context.strokeRect(w, 0, 10, 10); // Debuggers :)
    //context.strokeRect(x * -0.5, h * -0.5, w, h);

    // Draw the same rectangle but different way. POINT BY POINT
    context.beginPath();
    // Puts the cursor on the initial coords to start to paint.
    context.moveTo(0, 0);
    // Start the drawing.
    context.lineTo(w, 0);
    context.lineTo(w, h);
    context.lineTo(w, h);
    context.lineTo(0, h);
    context.closePath();
    context.stroke();
    
    //context.moveTo(w * 0.5, h * -0.5);
    context.restore();
  };
};

canvasSketch(sketch, settings);