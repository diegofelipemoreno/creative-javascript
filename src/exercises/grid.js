const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const colormap = require("colormap");

const {Point} = require("./point");

const settings = {
    dimensions: [1080, 1080],
    animate: true,
}
const cols = 72;
const rows = 8;
const frequency = .002;
const amplitude = 90;
const colors = colormap({
    colormap: 'magma',
    nshades: amplitude,
    format: 'hex',
    alpha: 1
})

const addNoise2D = (x, y) => {
    return random.noise2D(x, y, frequency, amplitude);
}

const setPoints = (points, cellWidth, cellHeight) => {
    const numCells = cols * rows;
    let x;
    let y;
    let lineWidth;
    let color;
    let noise;

    for (let index = 0; index < numCells; index++) {
        // starts from 0 to cols and return to 0 again to start over.
        x = (index % cols) * cellWidth;
        y = Math.floor(index / cols) * cellHeight;

        noise = addNoise2D(x, y);
        
        //Commented cuz is going to be animated on the render points;
        //x += noise;
        //y += noise;

        lineWidth = math.mapRange(noise, -amplitude, amplitude, 0, 5);
        color = colors[Math.floor(math.mapRange(noise, -amplitude, amplitude, 0, amplitude))]

        points.push(new Point({x, y, lineWidth, color}));
    }
}

const renderPoints = (points, context) => {
    points.forEach((point) => {
        point.draw(context);
    });
}

const renderCurves = (points, context) => {
    context.strokeStyle = 'red';
    context.lineWidth = 4;

    for (let r = 0; r < rows; r++) {
        context.beginPath();

        for (let c = 0; c < cols - 1; c++) {
            const actualPoint = points[r * cols + c + 0];
            const nextPoint = points[r * cols + c + 1];
            const middlePoint = {
                x: actualPoint.x + (nextPoint.x - actualPoint.x) * 0.5,
                y: actualPoint.y + (nextPoint.y - actualPoint.y) * 0.5,
            }
    
            // Drawing points
            if (c === cols - 2) {
                // to point end on the final point
               context.quadraticCurveTo(actualPoint.x, actualPoint.y, nextPoint.x, nextPoint.y);
            } else {
              context.quadraticCurveTo(actualPoint.x, actualPoint.y, middlePoint.x, middlePoint.y);
            }
        }
        context.stroke();
    }
}

const animateCurveSegments = (points, frame) => {
    points.forEach((point) => {
        const noise = random.noise2D(point.initialX + frame * 10, point.initialY, frequency, amplitude);
        
        point.x = point.initialX + noise;
        point.y = point.initialY + noise;
    });
}

const renderCurveSegments = (points, context) => {
    let lastX;
    let lastY;

    context.strokeStyle = 'red';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const actualPoint = points[r * cols + c + 0];
            const nextPoint = points[r * cols + c + 1];
            const middlePoint = {
                x: actualPoint.x + (nextPoint.x - actualPoint.x) * 0.8,
                y: actualPoint.y + (nextPoint.y - actualPoint.y) * 5.5,
            }

            if (!c) {
                lastX = actualPoint.x;
                lastY = actualPoint.y;
            }

            context.beginPath();
            context.lineWidth = actualPoint.lineWidth;
            context.strokeStyle = actualPoint.color;

            // Drawing curve segments
            context.moveTo(lastX, lastY);
            context.quadraticCurveTo(actualPoint.x, actualPoint.y, middlePoint.x, middlePoint.y);
            context.stroke();

            // inital value:  lastX = middlePoint.x;
            lastX = middlePoint.x - c / cols * 250;
            lastY = middlePoint.y  - r / rows * 250;
        }
    }
}

const sketch = ({width, height}) => {
    // Grid
    const gridWidth = width * 0.8;
    const gridHeight = height * 0.8;

    // Cell
    const cellWidth = gridWidth / cols;
    const cellHeight = gridHeight / rows;

    // Margin
    const marginX = (width - gridWidth) * 0.5;
    const marginY = (height - gridHeight) * 0.5;

    const points = [];

    setPoints(points, cellWidth, cellHeight);

    return ({context, width, height, frame}) => {
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(marginX, marginY);
        context.translate(cellWidth * 0.5, cellHeight * 0.5);


        //renderPoints(points, context);
        //renderStraightLines(points, context);
        //renderCurves(points, context);
        renderCurveSegments(points, context);
        animateCurveSegments(points, frame);
        context.restore();
    };
};

canvasSketch(sketch, settings);