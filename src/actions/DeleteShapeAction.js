import { Action } from "./Action.js";

export class DeleteShapeAction extends Action
{
    constructor(shapes, layer)
    {
        super("Delete");
        this.shapes = shapes;
        this.layer = layer;
        this.indexes = [];
    }

    execute()
    {
        // Write down EVERY spot before removing ANY: removing one shifts everything above it
        this.indexes = this.shapes.map(shape => this.layer.getChildIndex(shape.graphics));
        for (const shape of this.shapes) this.layer.removeChild(shape.graphics);
    }

    undo()
    {
        // Put them back bottom-up, so each lands in exactly its old spot
        const bottomFirst = this.shapes
            .map((shape, i) => ({ shape: shape, index: this.indexes[i] }))
            .sort((a, b) => a.index - b.index); // like OrderBy(x => x.index)

        for (const item of bottomFirst) this.layer.addChildAt(item.shape.graphics, item.index);
    }
}