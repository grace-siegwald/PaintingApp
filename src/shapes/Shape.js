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

// --- Polygon shapes ---
// A shape made of straight edges between a list of corner points, stretched to fill its box.
// Subclasses only say WHERE their corners are (the "unitPoints"). The points can be any size and anywhere: getCorners() measures the box around them and stretches that box to line up exactly 
// with the shape's box. Star, Triangle, Hexagon, Heart... all use this
export class PolygonShape extends Shape
{
    // "Abstract": every subclass returns its own list of {x, y} points
    get unitPoints()
    {
        throw new Error(`${this.constructor.name} must provide unitPoints`);
    }

    // Stretch the points so their box lines up exactly with this shape's box
    // (0 = left/top edge, 1 = right/bottom edge)
    getCorners()
    {
        const points = this.unitPoints;
        const left   = Math.min(...points.map(p => p.x));
        const right  = Math.max(...points.map(p => p.x));
        const top    = Math.min(...points.map(p => p.y));
        const bottom = Math.max(...points.map(p => p.y));

        return points.map(p => ({
            x: this.x + (p.x - left) / (right - left) * this.width,
            y: this.y + (p.y - top) / (bottom - top) * this.height,
        }));
    }

    draw(graphics)
    {
        graphics.poly(this.getCorners()); // a closed shape through all the corners
        this.applyStyle(graphics);
    }

    // Clicking in the empty parts of the box shouldn't select the shape.
    // Pixi's Polygon already knows how to answer "is this point inside me?"
    containsPoint(point)
    {
        return new Polygon(this.getCorners()).contains(point.x, point.y);
    }
}

// Corner points evenly spaced around a circle of radius 1, starting at startAngle
// (in degrees: 0 = pointing right, -90 = pointing up). Handy for any regular shape
export function regularPolygonPoints(sides, startAngle = -90)
{
    const points = [];
    for (let i = 0; i < sides; i++)
    {
        const angle = (startAngle + i * 360 / sides) * Math.PI / 180; // degrees -> radians
        points.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }
    return points;
}

// --- Star ---
// 10 corners: 5 points, and 5 inner corners in between that are half as far out
const STAR_INNER = 0.5;
const STAR_POINTS = regularPolygonPoints(10).map((p, i) =>
    (i % 2 === 0) ? p : { x: p.x * STAR_INNER, y: p.y * STAR_INNER });

export class Star extends PolygonShape
{
    get unitPoints() { return STAR_POINTS; }
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