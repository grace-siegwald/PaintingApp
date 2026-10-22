// The tool class is the definition of what a tool has. It has an icon, 
// it has a behavior (to move or to draw or to fill or to do whatever that tool does), 
// it has a state (clicked, clicked and dragged, etc)
//
// Perhaps this could be a parent for all the different types of tools? 
// They're all unique objects in the application that inherit from a base tool class
/// OLD THOUGHTS ^^^^^^^^^


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
        InputManager.PointerDownEvent.addListener(this.containerPointerDown); /* ...move, up */ 
        this.isActive = true;
    }
    deactivate() 
    { 
        InputManager.PointerDownEvent.removeListener(this.containerPointerDown); /* ... */ 
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
        this.currentShape = new this.ShapeClass(point, this.getStyle());
        this.layer.addChild(this.currentShape.graphics);
        this.state = ShapeTool.State.DRAGGING;
    }

    onPointerMove(point) 
    {
        if (this.state !== ShapeTool.State.DRAGGING) return;
        this.currentShape.setEnd(point);           // redraws, which gives the live preview
    }

    onPointerUp(point) 
    {
        if (this.state !== ShapeTool.State.DRAGGING) return;
        this.currentShape.setEnd(point);
        if (this.currentShape.width < 3 && this.currentShape.height < 3) {   // plain click
            this.currentShape.setEnd({ x: point.x + 100, y: point.y + 100 });
        }
        this.currentShape = null;
        this.state = ShapeTool.State.IDLE;
    }
}