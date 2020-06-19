import eventBus from "@/utils/eventBus";
import { uniqueId } from '@/utils'

let startPoint = null
let startItem = null
let endPoint = {}
let activeItem = null
let curInPoint = null

let start = true
export default {
    getEvents() {
        return {
            mousemove: 'onMousemove',
            mouseup: 'onMouseup'
        };
    },
    onMouseup(e) {
        const item = e.item
        if (item && item.getType() === 'node') {
            const group = item.getContainer()
            if (e.target.attrs.isInPoint) {
                const children = group.cfg.children
                children.map(child => {
                    if (child.attrs.isInPointOut && child.attrs.parent === e.target.attrs.id) {
                        activeItem = child
                    }
                })
                curInPoint = e.target
            } else if (e.target.attrs.isInPointOut) {
                activeItem = e.target
                const children = group.cfg.children
                children.map(child => {
                    if (child.attrs.isInPoint && child.attrs.id === e.target.attrs.parent) {
                        curInPoint = child
                    }
                })
            }
            if (activeItem) {
                const endX = parseInt(curInPoint.attrs.x)
                const endY = parseInt(curInPoint.attrs.y)
                endPoint = { x: endX, y: endY };
                if (this.edge) {
                    this.graph.removeItem(this.edge);
                    const model = {
                        id: 'edge' + uniqueId(),
                        source: startItem,
                        target: item,
                        sourceId: startItem._cfg.id,
                        targetId: item._cfg.id,
                        start: startPoint,
                        end: endPoint,
                        shape: 'customEdge',
                        type: 'edge'
                    }
                    eventBus.$emit('addItem', model)
                }
            } else {
                if (this.edge)
                    this.graph.removeItem(this.edge);
            }
        } else {
            if (this.edge)
                this.graph.removeItem(this.edge);
        }
        this.graph.find("node", node => {
            const group = node.get('group')
            const children = group.cfg.children
            children.map(child => {
                if (child.attrs.isInPointOut) {
                    child.attr("opacity", "0")
                }
                if (child.attrs.isInPoint) {
                    child.attr("opacity", "0")
                }
                if (child.attrs.isOutPoint) {
                    child.attr("opacity", "0")
                    child.attr("fill", "#fff")
                }
            })
        })
        if (startItem) {
            this.graph.setItemState(startItem, 'hover', false);
        }

        this.graph.paint()
        startPoint = null
        startItem = null
        endPoint = {}
        activeItem = null
        curInPoint = null
        this.graph.setMode('default')
    },
    onMousemove(e) {
        const point = { x: e.x, y: e.y };
        if (start) {
            this.graph.find("node", node => {
                const group = node.get('group');
                console.log(group)
                const children = group.cfg.children
                children.map(child => {
                    if (child.attrs.isInPointOut) {
                        child.attr("opacity", "0.3")
                    }
                    if (child.attrs.isInPoint) {
                        child.attr("opacity", "1")
                    }
                })
            });
            start = false;
            const item = e.item;
            const source = item.getSource();
            startItem = source;
            this.graph.removeItem(item);
            const group = source.get('group');
            const children = group.cfg.children
            let startAnchor = children.find(child => {
                return child.attrs.isOutPoint
            });
            const startX = parseInt(startAnchor.attrs.x)
            const startY = parseInt(startAnchor.attrs.y)
            startPoint = { x: startX, y: startY };
            this.edge = this.graph.addItem('edge', {
                source: source,
                target: point,
                start: startPoint,
                shape: 'link-edge'
            });
        } else {
            if (this.edge) {
                // 增加边的过程中，移动时边跟着移动
                this.graph.updateItem(this.edge, {
                    target: point
                });
            }
        }
    }
}
