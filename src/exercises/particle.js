const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap');

const colors = colormap({
    colormap: 'viridis',
    nsahes: 20,
});

export class Particle {
    constructor({x, y, radius = 10, scale = 1, color='white'}) {
        // position
        this.x = x;
        this.y = y

        // acceleration
        this.accX = 0;
        this.accY = 0;

        // velocity
        this.velX = 0;
        this.velY = 0;

        // initial Position
        this.initXPos = x;
        this.initYPos = y;

        this.scale = scale;

        this.radius = radius;
        this.color = colors[0];
        this.minDist = random.range(100, 200);
        this.pushFactor = random.range(0.01, 0.02);
        this.pullFactor = random.range(0.002, 0.006);
        this.dampFactor = random.range(0.90, 0.95);
    }

    draw(context) {
        context.save();

        context.translate(this.x, this.y);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    update(cursor) {
        let dx;
        let dy;
        let hypotenuse;
        let distDelta;
        let idxColor;

        // Pull force
        dx = this.initXPos - this.x;
		dy = this.initYPos - this.y;
        hypotenuse = Math.sqrt(dx * dx + dy * dy);

        this.accX = dx * this.pullFactor;
        this.accY = dy * this.pullFactor;
        
        this.scale = math.mapRange(hypotenuse, 0, 200, 1, 5);

        idxColor = Math.floor(math.mapRange(hypotenuse, 0, 200, 0, colors.length - 1, true));
        this.color = colors[idxColor];

        // Push force
        dx = this.x - cursor.x;
        dy = this.y - cursor.y;
        // Pitagoras to know the actual distance between the particle to the cursor.
        hypotenuse = Math.sqrt(dx * dx + dy * dy);

        // Delta: Variable that is is subject to a change
        distDelta = this.minDist - hypotenuse;

        if (hypotenuse < this.minDist) {
            this.accX += (dx / hypotenuse) * distDelta * this.pushFactor;
            this.accY += (dy / hypotenuse) * distDelta * this.pushFactor;
        }

        this.velX += this.accX; 
        this.velY += this.accY; 

        // to create decelerate the particle
        this.velX *= this.dampFactor;
        this.velY *= this.dampFactor;

        this.x += this.velX; 
        this.y += this.velY; 
    }
}