import { Container } from "pixi.js";

export class Group
{
    constructor(children)
    {
        this.children = children; // bottom to top, same order they're drawn in

        // A Pixi Container holds other Pixi objects, so the children's Graphics go
        // inside it and draw as one unit. Named "graphics" to match Shape, because
        // every other part of the app looks for shape.graphics
        this.graphics = new Container();
        this.graphics.shape = this; // the same back-pointer Shape sets up
    }

    // ---- The box around all the children ----
    get x()      { return Math.min(...this.children.map(c => c.x)); }
    get y()      { return Math.min(...this.children.map(c => c.y)); }
    get width()  { return Math.max(...this.children.map(c => c.x + c.width)) - this.x; }
    get height() { return Math.max(...this.children.map(c => c.y + c.height)) - this.y; }

    get center()
    {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    // SelectionManager uses style.strokeWidth to pad the blue box: use the thickest child's
    get style()
    {
        return { strokeWidth: Math.max(...this.children.map(c => c.style.strokeWidth)) };
    }

    // ---- Everything else: hand it to the children ----
    containsPoint(point)
    {
        return this.children.some(c => c.containsPoint(point)); // like LINQ's .Any()
    }

    moveBy(dx, dy)
    {
        for (const child of this.children) child.moveBy(dx, dy);
    }

    // Every child scales around the SAME center, so the group grows as one picture
    scaleBy(factor, center)
    {
        for (const child of this.children) child.scaleBy(factor, center);
    }

    // A group's snapshot is just a list of its children's snapshots
    getPoints()
    {
        return this.children.map(c => c.getPoints());
    }

    setPoints(points)
    {
        this.children.forEach((child, i) => child.setPoints(points[i]));
    }
}