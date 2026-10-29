import { Graphics } from "pixi.js";

export class Shape {
    constructor(start, style) 
    {
        this.start = { x: start.x, y: start.y };
        this.end   = { x: start.x, y: start.y };
        this.style = style; // { fill, stroke, strokeWidth }
        this.graphics = new Graphics(); // the Pixi object on screen

        // A "back-pointer" from the Pixi object to this Shape. JavaScript lets you add
        // a new property to any object at any time (C# wouldn't). The select tool uses
        // this to go from "which Graphics is on the canvas" back to "which Shape is that"
        this.graphics.shape = this;
    }
    setEnd(point) 
    { 
        this.end = { ...point }; 
        this.redraw(); 
    }

    // These are just like C# properties, each time the value is "gotten" its re-evaluated
    get x() 
    { 
        return Math.min(this.start.x, this.end.x); 
    }   
    get y()
    {
        return Math.min(this.start.y, this.end.y)
    }
    get width()  // so dragging left still works
    { 
        return Math.abs(this.end.x - this.start.x); 
    }  
    get height() // so dragging up still works
    {
        return Math.abs(this.end.y - this.start.y);
    }

    // this 
    redraw() 
    { 
        this.graphics.clear(); 
        this.draw(this.graphics); 
    }
    draw(graphics)  
    { 
        throw new Error(`${this.constructor.name} must implement draw(graphics)`);
    }

    // "Is this point inside me?" Used by the select tool.
    // Default answer: is it inside my bounding box? Subclasses override this when
    // the box is a bad fit for their shape (a circle's corners, a thin line)
    containsPoint(point)
    {
        return point.x >= this.x && point.x <= this.x + this.width &&
               point.y >= this.y && point.y <= this.y + this.height;
    }

    // Shared by every subclass: fill and outline whatever path draw() just described
    applyStyle(graphics)
    {
        graphics.fill(this.style.fill);
        if (this.style.strokeWidth > 0)
        {
            graphics.stroke({ width: this.style.strokeWidth, color: this.style.stroke });
        }
    }
}


// The shape subclasses: "how do I draw myself in this box?"
// --- Rectangle ---
export class Rectangle extends Shape 
{
    draw(graphics) 
    { 
        graphics.rect(this.x, this.y, this.width, this.height);
        this.applyStyle(graphics); 
    }
}

// --- Circle ---
export class Circle extends Shape 
{
    draw(graphics) 
    { 
        // Pixi's ellipse wants the CENTER and two radii, not the top-left corner and size
        const radiusX = this.width / 2;
        const radiusY = this.height / 2;
        graphics.ellipse(this.x + radiusX, this.y + radiusY, radiusX, radiusY);
        this.applyStyle(graphics);
    }

    // Clicking in the empty corners of the box shouldn't select the ellipse.
    // Ellipse equation: (dx/rx)^2 + (dy/ry)^2 <= 1 means "inside"
    containsPoint(point)
    {
        const radiusX = this.width / 2;
        const radiusY = this.height / 2;
        if (radiusX === 0 || radiusY === 0) return false;

        const dx = (point.x - (this.x + radiusX)) / radiusX;
        const dy = (point.y - (this.y + radiusY)) / radiusY;
        return dx * dx + dy * dy <= 1;
    }
}

// --- Star ---
export class Star extends Shape 
{
    draw(graphics) 
    { 
        // Pixi's star(centerX, centerY, numberOfPoints, radius) also works from the center
        const radius = Math.min(this.width, this.height) / 2;
        graphics.star(this.x + this.width / 2, this.y + this.height / 2, 5, radius);
        this.applyStyle(graphics);
    }

    // Need an undo and redo behavior, what they do when they redo undo
}

// --- Line ---
export class Line extends Shape // ignores the box and uses the two endpoints
{   
    draw(graphics) 
    {
        graphics.moveTo(this.start.x, this.start.y)
        .lineTo(this.end.x, this.end.y)
        .stroke({ width: Math.max(1, this.style.strokeWidth), color: this.style.stroke });
    }

    // A line has no inside, so "contains" means "is the click close enough to the line?"
    containsPoint(point)
    {
        const tolerance = Math.max(6, this.style.strokeWidth / 2 + 3); // pixels

        const lineX = this.end.x - this.start.x;
        const lineY = this.end.y - this.start.y;
        const lengthSquared = lineX * lineX + lineY * lineY;

        // How far along the line is the closest point? 0 = start, 1 = end
        let t = 0;
        if (lengthSquared > 0)
        {
            t = ((point.x - this.start.x) * lineX + (point.y - this.start.y) * lineY) / lengthSquared;
            t = Math.max(0, Math.min(1, t));
        }

        const closestX = this.start.x + t * lineX;
        const closestY = this.start.y + t * lineY;
        return Math.hypot(point.x - closestX, point.y - closestY) <= tolerance;
    }
}