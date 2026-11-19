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

}