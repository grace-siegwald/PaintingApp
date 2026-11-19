import { Tool } from "./Tool.js";
import SelectionManager from "../managers/SelectionManager.js";

// Select tool: click a shape to select it, click empty canvas to deselect.
// Selecting isn't an Action (it doesn't go in the history). Photoshop, Figma, etc.
// don't undo selections either, only changes to the drawing itself
export class SelectTool extends Tool
{
    constructor(layer)
    {
        super("Select Tool");
        this.layer = layer; // the Container holding all the drawn shapes
    }

    onPointerDown(point)
    {
        SelectionManager.select(this.findShapeAt(point)); // null = clicked empty space = deselect
    }

    // Returns the TOPMOST shape under the point, or null
    findShapeAt(point)
    {
        const children = this.layer.children;

        // Walk backwards: the last child is drawn on top, so it should win
        for (let i = children.length - 1; i >= 0; i--)
        {
            const shape = children[i].shape; // the back-pointer set in Shape's constructor
            if (shape && shape.containsPoint(point))
            {
                return shape;
            }
        }
        return null;
    }
}