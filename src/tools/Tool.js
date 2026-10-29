// The tool class is the definition of what a tool has. It has an icon, 
// it has a behavior (to move or to draw or to fill or to do whatever that tool does), 
// it has a state (clicked, clicked and dragged, etc)
//
// Perhaps this could be a parent for all the different types of tools? 
// They're all unique objects in the application that inherit from a base tool class
/// OLD THOUGHTS ^^^^^^^^^

import InputManager from "../managers/InputManager.js";
import HistoryManager from "../managers/HistoryManager.js";
import SelectionManager from "../managers/SelectionManager.js";
import { DrawShapeAction } from "../actions/DrawShapeAction.js";


// A TOOL is a base class that subscribes and unsubscribes to mouse events (on pointer down, move, and up).
// It's the thing that talks with the input manager
export class Tool 
{
    constructor(name) 
    {
        if (new.target === Tool) throw new Error("Tool is abstract");
        this.name = name;
        this.isActive = false;
        this.containerPointerDown = (point) => this.onPointerDown(point);
        this.containerPointerMove = (point) => this.onPointerMove(point);
        this.containerPointerUp   = (point) => this.onPointerUp(point);
    }
    activate()
    { 
        InputManager.PointerDownEvent.addListener(this.containerPointerDown);
        InputManager.PointerMoveEvent.addListener(this.containerPointerMove);
        InputManager.PointerUpEvent.addListener(this.containerPointerUp);
        this.isActive = true;
    }
    deactivate() 
    { 
        InputManager.PointerDownEvent.removeListener(this.containerPointerDown);
        InputManager.PointerMoveEvent.removeListener(this.containerPointerMove);
        InputManager.PointerUpEvent.removeListener(this.containerPointerUp);
        this.isActive = false;
    }
 
    onPointerDown(point) {}   // "virtual": subclasses override
    onPointerMove(point) {}
    onPointerUp(point) {}
}

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