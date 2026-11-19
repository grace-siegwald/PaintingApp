import { Action } from "./Action.js";

export class ScaleAction extends Action
{
    constructor(shapes, before, after)
    {
        super("Scale");
        this.shapes = shapes;
        this.before = before;   // last state: each shape's points before
        this.after = after;     // current state: each shape's points after
    }

    execute()
    {
        this.shapes.forEach((shape, i) => shape.setPoints(this.after[i]));
    }

    undo()
    {
        this.shapes.forEach((shape, i) => shape.setPoints(this.before[i]));
    }
}