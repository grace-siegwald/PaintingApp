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
    initialize(overlayLayer)
    {
        this.highlight = new Graphics();
        overlayLayer.addChild(this.highlight);
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
}

export default new SelectionManager();
