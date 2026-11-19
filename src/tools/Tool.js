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


