import { Action } from "./Action.js";

export class UngroupAction extends Action
{
    constructor(group, layer)
    {
        super("Ungroup");
        this.group = group;
        this.layer = layer;
        this.index = -1;
    }

    execute()
    {
        this.index = this.layer.getChildIndex(this.group.graphics);
        this.layer.removeChild(this.group.graphics);

        // Put the children where the group was, keeping their order (bottom first)
        this.group.children.forEach((child, i) =>
            this.layer.addChildAt(child.graphics, this.index + i));
    }

    undo()
    {
        for (const child of this.group.children)
        {
            this.group.graphics.addChild(child.graphics); // also takes it out of the layer
        }
        this.layer.addChildAt(this.group.graphics, this.index);
    }
}