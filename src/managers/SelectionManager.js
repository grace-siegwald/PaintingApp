import { Graphics } from "pixi.js";
import HistoryManager from "./HistoryManager.js";

class SelectionManager
{
    constructor()
    {
        this.selected = []; // every selected Shape (empty list = nothing selected)
        this.highlight = null; // draws the blue selection boxes
        this.marquee = null; // draws the drag-a-box rectangle
        this.drawingLayer = null;

        // After any undo/redo/action: drop anything no longer on the canvas, redraw boxes
        HistoryManager.HistoryChangedEvent.addListener(() =>
        {
            this.selected = this.selected.filter(shape => shape.graphics.parent === this.drawingLayer);
            this.refresh();
        });
    }

    initialize(overlayLayer, drawingLayer)
    {
        this.highlight = new Graphics();
        this.marquee = new Graphics();
        overlayLayer.addChild(this.highlight);
        overlayLayer.addChild(this.marquee);
        this.drawingLayer = drawingLayer;
    }

    // ---- Changing the selection ----
    setSelection(shapes)
    {
        this.selected = [...shapes]; // a copy, so nobody else's list gets changed by accident
        this.refresh();
    }

    clear() { this.setSelection([]); }

    isSelected(shape) { return this.selected.includes(shape); } // like List.Contains()

    toggle(shape) // shift+click
    {
        if (this.isSelected(shape)) this.selected = this.selected.filter(s => s !== shape);
        else this.selected.push(shape);
        this.refresh();
    }

    // ---- Finding shapes ----
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

    // A selected shape under the point, or null (so you can grab one even if it's covered)
    selectedShapeAt(point)
    {
        return this.selected.find(shape => shape.containsPoint(point)) ?? null;
    }

    // Every shape whose bounding box touches the rectangle, bottom to top
    findShapesInRect(rect)
    {
        return this.drawingLayer.children
            .map(child => child.shape)
            .filter(shape => shape && boxesOverlap(shape, rect));
    }

    // One box around ALL the given shapes
    getBounds(shapes = this.selected)
    {
        const left   = Math.min(...shapes.map(s => s.x));
        const top    = Math.min(...shapes.map(s => s.y));
        const right  = Math.max(...shapes.map(s => s.x + s.width));
        const bottom = Math.max(...shapes.map(s => s.y + s.height));
        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    // ---- Drawing ----
    refresh()
    {
        if (!this.highlight) return;
        this.highlight.clear();
        for (const shape of this.selected)
        {
            const padding = 4 + shape.style.strokeWidth / 2;
            this.highlight
                .rect(shape.x - padding, shape.y - padding,
                      shape.width + padding * 2, shape.height + padding * 2)
                .stroke({ width: 2, color: 0x2f80ed });
        }
    }

    showMarquee(rect)
    {
        this.marquee.clear()
            .rect(rect.x, rect.y, rect.width, rect.height)
            .fill({ color: 0x2f80ed, alpha: 0.1 })
            .stroke({ width: 1, color: 0x2f80ed });
    }

    hideMarquee() { this.marquee.clear(); }

    // A thin dashed outline, showing the box a new shape is being drawn into 
    // It uses the marquee's Graphics (they never show at the same time), so hideMarquee() hides it too
    showDragBox(rect)
    {
        const left = rect.x, top = rect.y;
        const right = rect.x + rect.width, bottom = rect.y + rect.height;

        this.marquee.clear();
        dashedLine(this.marquee, left, top, right, top);
        dashedLine(this.marquee, right, top, right, bottom);
        dashedLine(this.marquee, right, bottom, left, bottom);
        dashedLine(this.marquee, left, bottom, left, top);
        this.marquee.stroke({ width: 1, color: 0x2f80ed });
    }
}

// Do two boxes touch? (x/y = TOP-LEFT corner, like our shapes)
function boxesOverlap(a, b)
{
    return a.x <= b.x + b.width  && a.x + a.width  >= b.x &&
           a.y <= b.y + b.height && a.y + a.height >= b.y;
}
// Pixi has no dashed lines, so draw lots of short ones: 6px of line, 4px of gap, repeat
function dashedLine(graphics, x1, y1, x2, y2, dash = 6, gap = 4)
{
    const length = Math.hypot(x2 - x1, y2 - y1);
    if (length === 0) return;

    // One step of 1px along the line
    const stepX = (x2 - x1) / length;
    const stepY = (y2 - y1) / length;

    for (let d = 0; d < length; d += dash + gap)
    {
        const end = Math.min(d + dash, length); // don't run past the corner
        graphics.moveTo(x1 + stepX * d, y1 + stepY * d)
                .lineTo(x1 + stepX * end, y1 + stepY * end);
    }
}

export default new SelectionManager();