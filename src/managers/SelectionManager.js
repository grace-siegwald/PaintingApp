import { Graphics } from "pixi.js";
import HistoryManager from "./HistoryManager.js";

// Remembers which shape is selected and draws the blue box around it.
// It's a manager (not part of SelectTool) because other tools will need to know
// what's selected too: Delete, Move and Scale all act on "the selected shape"
class SelectionManager
{
    constructor()
    {
        this.selected = null;   // the selected Shape, or null
        this.highlight = null;  // Pixi Graphics used to draw the selection box
        this.drawingLayer = null; // the Container holding all the drawn shapes

        // If the selected shape gets undone (removed from the canvas), deselect it.
        // Otherwise just redraw the box, in case the shape changed
        HistoryManager.HistoryChangedEvent.addListener(() =>
        {
            if (this.selected && !this.selected.graphics.parent)
            {
                this.clear();
            }
            else
            {
                this.refresh();
            }
        });
    }

    // overlayLayer: a Container drawn ON TOP of the drawing layer
    initialize(overlayLayer, drawingLayer)
    {
        this.highlight = new Graphics();
        overlayLayer.addChild(this.highlight);
        this.drawingLayer = drawingLayer;
    }

    select(shape)
    {
        this.selected = shape;
        this.refresh();
    }

    clear()
    {
        this.select(null);
    }

    // Redraw the selection box around the selected shape (or nothing)
    refresh()
    {
        if (!this.highlight) return;

        this.highlight.clear();
        if (!this.selected) return;

        const shape = this.selected;
        const padding = 4 + shape.style.strokeWidth / 2; // sit just outside the stroke
        this.highlight
            .rect(shape.x - padding, shape.y - padding,
                  shape.width + padding * 2, shape.height + padding * 2)
            .stroke({ width: 2, color: 0x2f80ed });
    }

    // Returns the TOPMOST shape under the point, or null.
    findShapeAt(point)
    {
        const children = this.drawingLayer.children;
        for (let i = children.length - 1; i >= 0; i--)
        {
            const shape = children[i].shape;
            if (shape && shape.containsPoint(point))
            {
                return shape;
            }
        }
        return null;
    }

    selectAt(point) // so that we can select at specific points, not just whole shapes
    {
        // 1. Pressed on the shape that's already selected? Keep it, even if another shape is on top of it at that spot, so you can still grab it.
        // 2. Otherwise, select whatever's under the pointer (null = empty space = deselect)
        if (this.selected && this.selected.containsPoint(point))
        {
            return this.selected;
        }

        const shape = this.findShapeAt(point);
        this.select(shape);
        return shape;
    }
}

export default new SelectionManager();
