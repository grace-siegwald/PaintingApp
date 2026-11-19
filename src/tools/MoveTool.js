import { Tool } from "./Tool.js";
import HistoryManager from "../managers/HistoryManager.js";
import SelectionManager from "../managers/SelectionManager.js";
import { MoveAction } from "../actions/MoveAction.js";

export class MoveTool extends Tool
{
    static State = Object.freeze({ IDLE: "idle", DRAGGING: "dragging" });

    constructor()
    {
        super("Move Tool");
        this.state = MoveTool.State.IDLE;
        this.shapes = [];
        this.lastPoint = null;
        this.totalDx = 0;
        this.totalDy = 0;
    }

    onPointerDown(point)
    {
        const shape = SelectionManager.selected;
        // Only start dragging if you pressed ON the selected shape
        if (this.state !== MoveTool.State.IDLE || !shape || !shape.containsPoint(point)) return;

        this.shapes = [shape];
        this.lastPoint = point;
        this.totalDx = 0;
        this.totalDy = 0;
        this.state = MoveTool.State.DRAGGING;
    }

    onPointerMove(point)
    {
        if (this.state !== MoveTool.State.DRAGGING) return;

        const dx = point.x - this.lastPoint.x; // movement since the LAST event
        const dy = point.y - this.lastPoint.y;

        for (const shape of this.shapes) shape.moveBy(dx, dy); // live preview
        SelectionManager.refresh(); // blue box follows

        this.totalDx += dx;
        this.totalDy += dy;
        this.lastPoint = point;
    }

    onPointerUp(point)
    {
        if (this.state !== MoveTool.State.DRAGGING) return;
        this.onPointerMove(point); // catch the last bit of movement

        if (this.totalDx !== 0 || this.totalDy !== 0)
        {
            // Undo the preview, then let the Action do the real move
            for (const shape of this.shapes) shape.moveBy(-this.totalDx, -this.totalDy);
            HistoryManager.execute(new MoveAction(this.shapes, this.totalDx, this.totalDy));
        }

        this.shapes = [];
        this.lastPoint = null;
        this.state = MoveTool.State.IDLE;
    }
}