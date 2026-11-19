import HistoryManager from "../managers/HistoryManager.js";
import SelectionManager from "../managers/SelectionManager.js";
import { MoveAction } from "../actions/MoveAction.js";
import { SelectingTool } from "./SelectingTool.js";

export class MoveTool extends SelectingTool
{
    constructor()
    {
        super("Move Tool");
        this.shapes = [];
        this.lastPoint = null;
        this.totalDx = 0;
        this.totalDy = 0;
    }

    onDragStart(point, shapes)
    {
        this.shapes = shapes;
        this.lastPoint = point;
        this.totalDx = 0;
        this.totalDy = 0;
    }


    onDrag(point)
    {
        const dx = point.x - this.lastPoint.x; // movement since the LAST event
        const dy = point.y - this.lastPoint.y;

        for (const shape of this.shapes) shape.moveBy(dx, dy); // live preview
        SelectionManager.refresh(); // blue box follows

        this.totalDx += dx;
        this.totalDy += dy;
        this.lastPoint = point;
    }

    onDragEnd(point)
    {
        this.onDrag(point)

        if (this.totalDx !== 0 || this.totalDy !== 0)
        {
            // Undo the preview, then let the Action do the real move
            for (const shape of this.shapes) shape.moveBy(-this.totalDx, -this.totalDy);
            HistoryManager.execute(new MoveAction(this.shapes, this.totalDx, this.totalDy));
        }

        this.shapes = [];
        this.lastPoint = null;
    }
}