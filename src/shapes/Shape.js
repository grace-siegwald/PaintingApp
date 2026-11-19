import { Graphics, Polygon } from "pixi.js";

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

    redraw() 
    { 
        this.graphics.clear(); 
        this.draw(this.graphics); 
    }
    draw(graphics)  
    { 
        throw new Error(`${this.constructor.name} must implement draw(graphics)`);
    }

    moveBy(dx, dy) // moves the shape by changing its data, not moving the Pixi object around (wow!)
    {
        this.start.x += dx;
        this.start.y += dy;
        this.end.x += dx;
        this.end.y += dy;
        this.redraw();
    }

    // The middle of the bounding box: the point a shape grows/shrinks around
    get center()
    {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    // A copy of the two points that define this shape (a "snapshot")
    getPoints()
    {
        return { start: { ...this.start }, end: { ...this.end } };
    }

    // Put the shape back to a snapshot from getPoints()
    setPoints(points)
    {
        this.start = { ...points.start };
        this.end = { ...points.end };
        this.redraw();
    }

    // Each point's distance from the center gets multiplied by the factor
    scaleBy(factor, center)
    {
        this.start.x = center.x + (this.start.x - center.x) * factor;
        this.start.y = center.y + (this.start.y - center.y) * factor;
        this.end.x = center.x + (this.end.x - center.x) * factor;
        this.end.y = center.y + (this.end.y - center.y) * factor;
        this.redraw();
    }
    
    // Should the shape tool show a dashed box while this shape is being dragged out?
    // Yes for shapes drawn inside a box. (Line overrides this, since it has no box)
    get usesDragBox()
    {
        return true;
    }

    // "Is this point inside me?" Used by the select tool.
    // Default answer: is it inside my bounding box? Subclasses override this when the box is a bad fit for their shape (a circle's corners, a thin line)
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
// The 10 corners of a star (5 points + 5 inner corners) on a circle of radius 1
// around (0, 0), starting at the top point. Worked out once, when the file loads.
const STAR_INNER = 0.5; // inner corners are half as far out as the points
const UNIT_STAR = [];
for (let i = 0; i < 10; i++)
{
    const angle = -Math.PI / 2 + i * Math.PI / 5;   // start pointing straight up, 36 degrees apart
    const radius = (i % 2 === 0) ? 1 : STAR_INNER;  // even = point, odd = inner corner
    UNIT_STAR.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
}
// The box around that star. It's NOT -1 to 1 on every side: the bottom points don't
// reach as far down as the top point reaches up, and the side points don't reach x = 1
const STAR_LEFT   = Math.min(...UNIT_STAR.map(p => p.x));
const STAR_RIGHT  = Math.max(...UNIT_STAR.map(p => p.x));
const STAR_TOP    = Math.min(...UNIT_STAR.map(p => p.y));
const STAR_BOTTOM = Math.max(...UNIT_STAR.map(p => p.y));

export class Star extends Shape 
{
    // Stretch the unit star so its own box lines up exactly with this shape's box:
    // the top point touches the top edge, the side points touch the sides, and the
    // two bottom points touch the bottom. (0 = left/top edge, 1 = right/bottom edge)
    getCorners()
    {
        return UNIT_STAR.map(p => ({
            x: this.x + (p.x - STAR_LEFT) / (STAR_RIGHT - STAR_LEFT) * this.width,
            y: this.y + (p.y - STAR_TOP) / (STAR_BOTTOM - STAR_TOP) * this.height,
        }));
    }

    draw(graphics) 
    { 
        graphics.poly(this.getCorners()); // a closed shape through all 10 corners
        this.applyStyle(graphics);
    }

    // Clicking between the points shouldn't select the star.
    // Pixi's Polygon already knows how to answer "is this point inside me?"
    containsPoint(point)
    {
        return new Polygon(this.getCorners()).contains(point.x, point.y);
    }
}

// --- Line ---
export class Line extends Shape // ignores the box and uses the two endpoints
{   
    get usesDragBox()
    {
        return false;
    }
    
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