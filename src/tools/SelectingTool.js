import { Tool } from "./Tool.js";
import SelectionManager from "../managers/SelectionManager.js";

export class SelectingTool extends Tool
{
    static State = Object.freeze({ IDLE: "idle", BOX: "box", DRAGGING: "dragging" });

    constructor(name)
    {
        super(name);
        if (new.target === SelectingTool) throw new Error("SelectingTool is abstract");
        this.state = SelectingTool.State.IDLE;
        this.boxStart = null;
        this.selectionBeforeBox = [];
        this.pressPoint = null;
        this.pressedSelected = null;
    }

    onPointerDown(point)
    {
        if (this.state !== SelectingTool.State.IDLE) return;

        const hit = SelectionManager.selectedShapeAt(point) ?? SelectionManager.findShapeAt(point);

        // --- Empty canvas: start a selection box ---
        if (!hit)
        {
            this.selectionBeforeBox = point.shiftKey ? [...SelectionManager.selected] : [];
            SelectionManager.setSelection(this.selectionBeforeBox);
            this.boxStart = point;
            this.state = SelectingTool.State.BOX;
            return;
        }

        // --- Pressed on a shape ---
        this.pressPoint = point;
        this.pressedSelected = null;

        if (point.shiftKey)
        {
            SelectionManager.toggle(hit);
            if (!SelectionManager.isSelected(hit)) return; // shift-clicked it OFF: nothing to drag
        }
        else if (!SelectionManager.isSelected(hit))
        {
            SelectionManager.setSelection([hit]);
        }
        else
        {
            // Already selected: keep the WHOLE selection so you can drag them all.
            // If it turns out to be a plain click, onPointerUp fixes it
            this.pressedSelected = hit;
        }

        this.state = SelectingTool.State.DRAGGING;
        this.onDragStart(point, [...SelectionManager.selected]);
    }

    onPointerMove(point)
    {
        if (this.state === SelectingTool.State.BOX)
        {
            const rect = makeRect(this.boxStart, point);
            // Too small to be a box yet? Then it's just a click on empty space, which
            // shouldn't select anything (a 0-size box would still "touch" bounding boxes)
            if (rect.width < 3 && rect.height < 3)
            {
                SelectionManager.setSelection(this.selectionBeforeBox);
                SelectionManager.hideMarquee();
                return;
            }

            SelectionManager.showMarquee(rect);

            // Live preview: what was selected before (shift) + everything the box touches
            const inBox = SelectionManager.findShapesInRect(rect);
            const extra = inBox.filter(shape => !this.selectionBeforeBox.includes(shape));
            SelectionManager.setSelection([...this.selectionBeforeBox, ...extra]);
        }
        else if (this.state === SelectingTool.State.DRAGGING)
        {
            this.onDrag(point);
        }
    }

    onPointerUp(point)
    {
        if (this.state === SelectingTool.State.BOX)
        {
            this.onPointerMove(point);
            SelectionManager.hideMarquee();
        }
        else if (this.state === SelectingTool.State.DRAGGING)
        {
            this.onDragEnd(point);

            // Pressed an already-selected shape but didn't really drag = plain click = "just this one"
            const moved = Math.hypot(point.x - this.pressPoint.x, point.y - this.pressPoint.y);
            if (this.pressedSelected && moved < 3)
            {
                SelectionManager.setSelection([this.pressedSelected]);
            }
        }
        this.state = SelectingTool.State.IDLE;
        this.pressedSelected = null;
    }

    // "Virtual" methods: subclasses override the ones they need
    onDragStart(point, shapes) {}
    onDrag(point) {}
    onDragEnd(point) {}
}

function makeRect(a, b)
{
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
    };
}