const canvasSketch = require('canvas-sketch');
const {Point} = require("./point");

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

let elCanvas;

const points = [
    //new Point({ x: 400, y: 300, control: true }),
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 700 }),
    new Point({ x: 880, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
];

const getCanvasDimensions = (offsetX, offsetY) => {
    // To maintain the proportions of canvas width height if/if not the canvas is resized.
    const x = (offsetX / elCanvas.offsetWidth) * elCanvas.width;
    const y = (offsetY / elCanvas.offsetHeight) * elCanvas.height;

    return {x, y}
}

const setPointIsDragging = (x, y) => {
    points.forEach((point) => {
        point.isDragging = point.isHit(x, y);
    });
}

const onMouseMove = (event) => {
    const {offsetX, offsetY} = event;
    const {x, y} = getCanvasDimensions(offsetX, offsetY);

    points.forEach((point) => {
        if (point.isDragging) {
            point.x = x;
            point.y = y;
        }
    });
}

const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
}

const onMouseDown = (event) => {
    const {offsetX, offsetY} = event;
    const {x, y} = getCanvasDimensions(offsetX, offsetY);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    setPointIsDragging(x, y);
    createPoint(x, y);
}

const listenEvents = () => {
    window.addEventListener('mousedown', onMouseDown);
}

const createPoint = (x, y) => {
    let hit = false;

    points.forEach((point) => {
        if (!hit && point.isDragging) {
           hit = true;
        }
    });

    if (!hit) {
        points.push(
            new Point({ x, y })
        );
    }
}

const createCurves = (points, context) => {
    context.beginPath();

    for (let i = 0; i < (points.length - 1); i++) {
        const actualPoint = points[i + 0];
        const nextPoint = points[i + 1];
        const middlePoint = {
            x: actualPoint.x + (nextPoint.x - actualPoint.x) * 0.5,
            y: actualPoint.y + (nextPoint.y - actualPoint.y) * 0.5,
        }

        // Drawing points
        if (i === points.length - 2) {
            // to point end on the final point
           context.quadraticCurveTo(actualPoint.x, actualPoint.y, nextPoint.x, nextPoint.y);
        } else {
          context.quadraticCurveTo(actualPoint.x, actualPoint.y, middlePoint.x, middlePoint.y);
        }
    }

    context.lineWidth = 4;
    context.strokeStyle = 'blue';
    context.stroke();      
}

const renderStraightLines = (points, context) => {
    context.strokeStyle = '#999';

    for (let i = 1; i < points.length; i++) {
       context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
}

const renderMiddlePoints = (points, context) => {
    for (let i = 0; i < (points.length - 1); i++) {
        const actualPoint = points[i + 0];
        const nextPoint = points[i + 1];
        const middlePoint = {
            x: actualPoint.x + (nextPoint.x - actualPoint.x) * 0.5,
            y: actualPoint.y + (nextPoint.y - actualPoint.y) * 0.5,
        }

        // Drawing points
        context.beginPath();
        context.arc(middlePoint.x, middlePoint.y, 5, 0, Math.PI * 2);    
        context.fillStyle = 'blue';
        context.fill();    
    }
}

const renderPoints = (points, context) => {
    points.forEach((point) => {
        point.draw(context);
    });
}

const sketch = ({canvas}) => {
    elCanvas = canvas;

    listenEvents();

    return ({context, width, height}) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        context.beginPath();
        // Puts the cursor on the initial coords to start to paint.
        context.moveTo(points[0].x, points[0].y);
        // Start the drawing.
        context.save();

        renderStraightLines(points, context);
        renderPoints(points, context);
        //renderMiddlePoints(points, context);
        createCurves(points, context);
    }
}

canvasSketch(sketch, settings);
