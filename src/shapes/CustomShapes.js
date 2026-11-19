import { PolygonShape, regularPolygonPoints } from "./Shape.js";

// Custom shapes. Each one is just a list of corner points; PolygonShape does the rest
// (drawing, stretching to fit the box, hit-testing). The points can use any numbers you
// like, so it's easiest to sketch the shape on graph paper and copy the coordinates.
// Remember that y goes DOWN on screen: y = 0 is the top.
//
// Each list is made once, when the file loads, and shared by every shape of that kind.

// --- Triangle ---
const TRIANGLE_POINTS = [
    { x: 0.5, y: 0 },
    { x: 1,   y: 1 },
    { x: 0,   y: 1 },
];

export class Triangle extends PolygonShape
{
    get unitPoints() { return TRIANGLE_POINTS; }
}

// --- Diamond ---
// The middle of each side of the box
const DIAMOND_POINTS = [
    { x: 0.5, y: 0   },  // top
    { x: 1,   y: 0.5 },  // right
    { x: 0.5, y: 1   },  // bottom
    { x: 0,   y: 0.5 },  // left
];

export class Diamond extends PolygonShape
{
    get unitPoints() { return DIAMOND_POINTS; }
}

// --- Hexagon ---
// 6 corners evenly around a circle. Starting at 0 degrees (pointing right)
// gives flat edges on the top and bottom
const HEXAGON_POINTS = regularPolygonPoints(6, 0);

export class Hexagon extends PolygonShape
{
    get unitPoints() { return HEXAGON_POINTS; }
}

// --- Arrow ---
// Pointing right: a rectangle for the shaft, a triangle for the head
const ARROW_POINTS = [
    { x: 0,  y: 3 },
    { x: 6,  y: 3 },
    { x: 6,  y: 0 },
    { x: 10, y: 5 },
    { x: 6,  y: 10 },
    { x: 6,  y: 7 },
    { x: 0,  y: 7 },
];

export class Arrow extends PolygonShape
{
    get unitPoints() { return ARROW_POINTS; }
}

// --- Heart ---
// A heart has curves, not corners... but 80 corners close together look smooth.
// They come from a well-known "heart curve" formula: as t goes once around the
// circle (0 to 2*PI), the point (x, y) traces out a heart.
// The minus sign on y flips it, because in math y goes UP but on screen it goes DOWN
const HEART_POINTS = [];
for (let i = 0; i < 80; i++)
{
    const t = i / 80 * 2 * Math.PI;
    HEART_POINTS.push({
        x: 16 * Math.sin(t) ** 3,  // ** means "to the power of"
        y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    });
}

export class Heart extends PolygonShape
{
    get unitPoints() { return HEART_POINTS; }
}