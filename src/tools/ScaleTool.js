import { Tool } from "./Tool.js";
import HistoryManager from "../managers/HistoryManager.js";
import SelectionManager from "../managers/SelectionManager.js";
import { ScaleAction } from "../actions/ScaleAction.js";

const SCALE_RATE = 0.01; // each pixel dragged = 1% bigger/smaller
const MIN_SCALE = 0.1; // never shrink below 10%

export class ScaleTool extends Tool
{
    static State = Object.freeze({ IDLE: "idle", DRAGGING: "dragging" });

    constructor()
    {
        super("Scale Tool");
        this.state = ScaleTool.State.IDLE;
        this.shapes = [];
        this.before = [];
        this.center = null;
        this.startPoint = null;
        this.factor = 1;
    }

    onPointerDown(point)
    {
        if (this.state !== ScaleTool.State.IDLE) return;

        const shape = SelectionManager.selectAt(point);
        if (!shape) return;

        this.shapes = [shape];
        this.before = this.shapes.map(s => s.getPoints()); 
        this.center = shape.center;
        this.startPoint = point;
        this.factor = 1;
        this.state = ScaleTool.State.DRAGGING;
    }

    onPointerMove(point)
    {
        if (this.state !== ScaleTool.State.DRAGGING) return;

        const dx = point.x - this.startPoint.x; // since the START of the drag
        this.factor = Math.max(MIN_SCALE, 1 + dx * SCALE_RATE);

        this.shapes.forEach((shape, i) =>
        {
            shape.setPoints(this.before[i]); // reset to the original...
            shape.scaleBy(this.factor, this.center); // ...then scale once
        });
        SelectionManager.refresh();
    }

    onPointerUp(point)
    {
        if (this.state !== ScaleTool.State.DRAGGING) return;
        this.onPointerMove(point);

        if (this.factor !== 1)
        {
            const after = this.shapes.map(s => s.getPoints());

            // Undo the preview, then let the Action do the real scale
            this.shapes.forEach((shape, i) => shape.setPoints(this.before[i]));
            HistoryManager.execute(new ScaleAction(this.shapes, this.before, after));
        }

        this.shapes = [];
        this.before = [];
        this.state = ScaleTool.State.IDLE;
    }
}