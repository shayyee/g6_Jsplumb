import * as Util from '@antv/util'
import eventBus from "@/utils/eventBus";
import {getBox} from "@/utils";

export default {
    getEvents() {
        return {
            'edge:mouseover': 'onMouseover',
            'edge:mouseleave': 'onMouseleave',
            "edge:mousedown": "onMousedown",
            "edge:click": "onClick"
        };
    },
    onMouseover(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        if (item.hasState('selected')) {
            return
        } else {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'hover', true);
            }
        }
        const target = item.getTarget();
        const area_width = 20;
        const {x, y} = e;
        const {x:nodeX, y:nodeY, width} = target.getBBox();
        const {x1, y1, x2, y2} = getBox(nodeX+ width/2-area_width/2, nodeY-area_width, area_width, area_width);
        if(x >= x1 && x<=x2 && y >= y1 && y <= y2) {
            e.target.attr("cursor", "crosshair");
        }
        graph.paint();
    },
    onMouseleave(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        const group = item.getContainer()
        group.find(g => {
            if (g.attrs.isInPoint || g.attrs.isOutPoint) {
                g.attr("fill", "#fff")
            }
        });
        if (self.shouldUpdate.call(self, e)) {
            if (!item.hasState('selected'))
                graph.setItemState(item, 'hover', false);
        }
        graph.paint();
    },
    onClick(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        const autoPaint = graph.get('autoPaint');
        graph.setAutoPaint(false);
        const selectedNodes = graph.findAllByState('node', 'selected');
        Util.each(selectedNodes, node => {
            graph.setItemState(node, 'selected', false);
        });
        if (!self.keydown || !self.multiple) {
            const selected = graph.findAllByState('edge', 'selected');
            Util.each(selected, edge => {
                if (edge !== item) {
                    graph.setItemState(edge, 'selected', false);
                }
            });
        }
        if (item.hasState('selected')) {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'selected', false);
            }
            eventBus.$emit('nodeselectchange', { target: item, select: false });
        } else {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'selected', true);
            }
            eventBus.$emit('nodeselectchange', { target: item, select: true });
        }
        graph.setAutoPaint(autoPaint);
        graph.paint();
    },
    onMousedown(e) {
        const {x, y, item} = e;
        const target = item.getTarget();
        const area_width = 20;
        const {x:nodeX, y:nodeY, width} = target.getBBox();
        const {x1, y1, x2, y2} = getBox(nodeX+ width/2-area_width/2, nodeY-area_width, area_width, area_width);
        if(x >= x1 && x<=x2 && y >= y1 && y <= y2) {
            e.target.attr("cursor", "crosshair");
            this.graph.setMode('editEdge')
        } else {
            e.target.attr("cursor", "default");
            this.graph.setMode('default')
        }
    },
};
