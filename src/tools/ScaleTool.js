import HistoryManager from "../managers/HistoryManager.js";
import SelectionManager from "../managers/SelectionManager.js";
import { ScaleAction } from "../actions/ScaleAction.js";
import { SelectingTool } from "./SelectingTool.js";

const SCALE_RATE = 0.01; // each pixel dragged = 1% bigger/smaller
const MIN_SCALE = 0.1; // never shrink below 10%

export class ScaleTool extends SelectingTool
{
    constructor()
    {
        super("Scale Tool");
        this.shapes = [];
        this.before = [];
        this.center = null;
        this.startPoint = null;
        this.factor = 1;
    }

    onDragStart(point, shapes)
    {
        this.shapes = shapes;
        this.before = this.shapes.map(s => s.getPoints());

        const bounds = SelectionManager.getBounds(shapes);
        this.center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

        this.startPoint = point;
        this.factor = 1;
    }

    onDrag(point)
    {
        const dx = point.x - this.startPoint.x; // since the START of the drag
        this.factor = Math.max(MIN_SCALE, 1 + dx * SCALE_RATE);

        this.shapes.forEach((shape, i) =>
        {
            shape.setPoints(this.before[i]); // reset to the original...
            shape.scaleBy(this.factor, this.center); // ...then scale once
        });
        SelectionManager.refresh();
    }

    onDragEnd(point)
    {
        this.onDrag(point)

        if (this.factor !== 1)
        {
            const after = this.shapes.map(s => s.getPoints());

            // Undo the preview, then let the Action do the real scale
            this.shapes.forEach((shape, i) => shape.setPoints(this.before[i]));
            HistoryManager.execute(new ScaleAction(this.shapes, this.before, after));
        }

        this.shapes = [];
        this.before = [];
    }
}