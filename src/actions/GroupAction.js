import { Action } from "./Action.js";
import { Group } from "../shapes/Group.js";

export class GroupAction extends Action
{
    constructor(shapes, layer)
    {
        super("Group");
        this.layer = layer;

        // Sort bottom-to-top so the shapes keep their stacking order inside the group
        this.shapes = [...shapes].sort((a, b) =>
            layer.getChildIndex(a.graphics) - layer.getChildIndex(b.graphics));

        // Made ONCE, here, not in execute(). Redo must bring back the SAME group object,
        // because later actions in the history (a move, a delete...) point at it
        this.group = new Group(this.shapes);

        this.indexes = [];
    }

    execute()
    {
        // Write down every spot before moving anything (same idea as DeleteShapeAction)
        this.indexes = this.shapes.map(s => this.layer.getChildIndex(s.graphics));

        // The group goes where the topmost shape was. Every OTHER grouped shape sat
        // below it, so once they're all removed, that spot moves down by (count - 1)
        const groupIndex = Math.max(...this.indexes) - (this.shapes.length - 1);

        for (const shape of this.shapes)
        {
            // addChild() on a new parent also takes it out of its old parent (the layer)
            this.group.graphics.addChild(shape.graphics);
        }
        this.layer.addChildAt(this.group.graphics, groupIndex);
    }

    undo()
    {
        this.layer.removeChild(this.group.graphics);

        // Back into the layer, bottom first, each at its old spot
        this.shapes.forEach((shape, i) => this.layer.addChildAt(shape.graphics, this.indexes[i]));
    }
}