import { Action } from "./Action.js";

// instance of DrawShapeAction will be on our stack (one class works for every shape type)
//   last state:    the shape is NOT on the canvas
//   current state: the shape IS on the canvas
export class DrawShapeAction extends Action
{
    constructor(shape, layer)
    {
        super("Draw " + shape.constructor.name);
        this.shape = shape;   // the finished Shape (Rectangle, Circle, Line, Star...)
        this.layer = layer;   // the Pixi Container it lives in

        // No this.execute() here: HistoryManager.execute(action) runs it,
        // so the history manager is always the one in charge of "doing" things
    }

    execute()
    {
        // building out the shape = putting it on the canvas
        this.layer.addChild(this.shape.graphics);
    }

    undo()
    {
        // remove from hierarchy all together (rather than making it invisible),
        // so an undone shape can't be clicked by the select tool or left lying around
        this.layer.removeChild(this.shape.graphics);
    }

    // redo() comes from Action: it just calls execute() again
}
