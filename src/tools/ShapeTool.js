import { Tool } from "./Tool.js";
import HistoryManager from "../managers/HistoryManager.js";
import { DrawShapeAction } from "../actions/DrawShapeAction.js";
import SelectionManager from "../managers/SelectionManager.js";

const DEFAULT_SIZE = 100; // size of a shape made with a plain click (no drag)


// Shape tool extends the definition of a tool. It has a shape (this.ShapeClass)
export class ShapeTool extends Tool {
    static State = Object.freeze({ IDLE: "idle", DRAGGING: "dragging" });   // JS's stand-in for an enum

    constructor(layer, getStyle) {
        super("Shape Tool");
        this.layer = layer; // the Pixi Container shapes go into
        this.getStyle = getStyle; // returns the current colors and stroke width
        this.ShapeClass = null; // which shape to make
        this.state = ShapeTool.State.IDLE;
        this.currentShape = null;
    }

    setShapeType(ShapeClass) { this.ShapeClass = ShapeClass; }

    onPointerDown(point) 
    {
        if (this.state !== ShapeTool.State.IDLE || !this.ShapeClass) return;
        this.currentShape = new this.ShapeClass(point, this.getStyle()); // gets the current shape and style of that shape
        this.layer.addChild(this.currentShape.graphics); 
        this.state = ShapeTool.State.DRAGGING; // sets the tools state to the correct state
    }

    onPointerMove(point) 
    {
        if (this.state !== ShapeTool.State.DRAGGING) return;
        
        // every tick the pointer is moving, the shape is "redrawing" at that end point
        this.currentShape.setEnd(point); // redraws, which gives the live preview

        // Show the box the shape is being drawn into, so it's clear the mouse is on its corner
        if (this.currentShape.usesDragBox)
        {
            SelectionManager.showDragBox(this.currentShape);
        }
    }

    onPointerUp(point) 
    {
        if (this.state !== ShapeTool.State.DRAGGING) return;
        this.currentShape.setEnd(point);
        
        // Plain click (no real drag): make a default-size shape CENTERED on the click, by putting the two corners half the size away from it in each direction
        if (this.currentShape.width < 3 && this.currentShape.height < 3)
        {
            const half = DEFAULT_SIZE / 2;
            this.currentShape.setPoints({
                start: { x: point.x - half, y: point.y - half },
                end:   { x: point.x + half, y: point.y + half },
            });
        }

        // The drag was only a preview. Take the preview off the canvas and let an Action put the finished shape on, so it goes through the history (and can be undone)
        this.layer.removeChild(this.currentShape.graphics);
        HistoryManager.execute(new DrawShapeAction(this.currentShape, this.layer));

        this.currentShape = null;
        this.state = ShapeTool.State.IDLE;
    }
}
