import { Graphics } from "pixi.js";

export class Shape {
    constructor(start, style) 
    {
        this.start = { x: start.x, y: start.y };
        this.end   = { x: start.x, y: start.y };
        this.style = style; // { fill, stroke, strokeWidth }
        this.graphics = new Graphics(); // the Pixi object on screen
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
}