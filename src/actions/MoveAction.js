import { Action } from "./Action.js";

export class MoveAction extends Action // the actions stores the difference between the two states (dx, dy)
{
    constructor(shapes, dx, dy)
    {
        super("Move");
        this.shapes = shapes;   // a list, so it still works when you can select several
        this.dx = dx;
        this.dy = dy;
    }

    execute()
    {
        for (const shape of this.shapes) shape.moveBy(this.dx, this.dy); // javascript "foreach" 
    }

    undo()
    {
        for (const shape of this.shapes) shape.moveBy(-this.dx, -this.dy);
    }
}