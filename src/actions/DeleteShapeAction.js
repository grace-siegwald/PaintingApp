import { Action } from "./Action.js";

export class DeleteShapeAction extends Action
{
    constructor(shape, layer)
    {
        super("Delete " + shape.constructor.name);
        this.shape = shape;
        this.layer = layer;
        this.index = -1; // where it sat in the layer (0 = bottom), saved in execute()
    }

    execute()
    {
        this.index = this.layer.getChildIndex(this.shape.graphics);
        this.layer.removeChild(this.shape.graphics);
    }

    undo()
    {
        this.layer.addChildAt(this.shape.graphics, this.index);
    }
}