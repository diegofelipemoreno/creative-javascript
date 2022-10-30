export class Point {
    constructor({x, y, control = false, color, lineWidth}) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.control = control;
        this.isDragging = false;
        this.control = color;
        this.lineWidth = lineWidth;
        this.color = color;
    }

    draw(context) {
        context.save();

        context.translate(this.x, this.y);
        context.fillStyle = this.control ? 'red' : this.control || 'black';
        context.beginPath();
        context.arc(0, 0, 10, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    isHit(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        //Pitagoras (instead match x, y values with pitogoras matches with the distance)
        const dd = Math.sqrt((dx * dx) + (dy + dy));

        return dd < 20;
    }
}