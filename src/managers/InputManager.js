import { Event } from "../Event.js";

class InputManager {

    #mouseDown = false;
    
    constructor() {
        this.app = null;
        this.initialized = false;
        this.mouseDown = false;
        
        this.PointerDownEvent = new Event();
        this.PointerMoveEvent = new Event();
        this.PointerUpEvent = new Event();        
    }

    initialize(app) {
        if (this.initialized) {
            return;
        }

        this.app = app;
        this.initialized = true;        
        
        this.setupEvents();
    }

    setupEvents() {
        this.app.stage.eventMode = "static";

        // app.screen updates itself when the window resizes,
        // so the whole canvas stays clickable after a resize.
        this.app.stage.hitArea = this.app.screen;
        
        this.app.stage.on("pointerdown", (event) => {
            this.onPointerDown(event);
            this.#mouseDown = true;
        });

        this.app.stage.on("pointermove", (event) => {
            this.onPointerMove(event);
        });

        this.app.stage.on("pointerup", (event) => {
            this.onPointerUp(event);
            this.#mouseDown = false;
        });

        // Releasing the mouse outside the canvas should still end a drag.
        this.app.stage.on("pointerupoutside", (event) => {
            this.onPointerUp(event);
            this.#mouseDown = false;
        });
    }

    // What every tool receives: where the pointer is, and whether Shift is held down, helper methoddddd
    toPoint(event) {
        return { x: event.global.x, y: event.global.y, shiftKey: event.shiftKey };
    }

    onPointerDown(event) {
        console.log(event.global.x, event.global.y);
        this.PointerDownEvent.invoke(this.toPoint(event));
    }

    onPointerMove(event) {
        this.PointerMoveEvent.invoke(this.toPoint(event));
    }

    onPointerUp(event) {
        this.PointerUpEvent.invoke(this.toPoint(event));
    }
    
    getIsMouseDown() {
        return this.#mouseDown;
    }

}

export default new InputManager();