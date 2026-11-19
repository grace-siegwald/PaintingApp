import { Tool } from "./Tool.js";
import HistoryManager from "../managers/HistoryManager.js";
import { DrawShapeAction } from "../actions/DrawShapeAction.js";

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
    }

    onPointerUp(point) 
    {
        if (this.state !== ShapeTool.State.DRAGGING) return;
        this.currentShape.setEnd(point);
        if (this.currentShape.width < 3 && this.currentShape.height < 3) {   // plain click
            this.currentShape.setEnd({ x: point.x + 100, y: point.y + 100 });
        }

        // The drag was only a preview. Take the preview off the canvas and let an
        // Action put the finished shape on, so it goes through the history (and can be undone)
        this.layer.removeChild(this.currentShape.graphics);
        HistoryManager.execute(new DrawShapeAction(this.currentShape, this.layer));

        this.currentShape = null;
        this.state = ShapeTool.State.IDLE;
    }
}
