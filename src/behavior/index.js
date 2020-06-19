import G6 from "@antv/g6";
import hoverNode from './hover-node'
import addLine from './add-edge'
import editLine from './edit-edge'
import dragItem from './drag-item'
import selectNode from './select-node'
import hoverEdge from "./hover-edge";
import keyboard from './keyboard'
import mulitSelect from './mulit-select'
import addMenu from './add-menu'
import resizeCombo from './resize-combo'
import dragCanvasNoLock from './drag-canvas-no-lock'
import zoomCanvasNoLock from './zoom-canvas-no-lock'

const behavors = {
    'hover-node': hoverNode,
    'add-edge': addLine,
    'edit-edge': editLine,
    'drag-item': dragItem,
    'select-node': selectNode,
    'hover-edge': hoverEdge,
    'drag-canvas-exclude-lockedNode': dragCanvasNoLock,
    'zoom-canvas-exclude-lockedNode': zoomCanvasNoLock,
    'keyboard':keyboard,
    'mulit-select':mulitSelect,
    'add-menu':addMenu,
    'resize-combo': resizeCombo
}

export function initBehavors() {
    for (let key in behavors) {
        G6.registerBehavior(key, behavors[key])
    }
}


