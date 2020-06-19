import config from "../global";
import { uniqueId, getBox } from '@/utils'
import eventBus from "@/utils/eventBus";
export default {
    getEvents() {
        return {
            'canvas:mousedown': 'onCanvasMousedown',
            mousemove: 'onMousemove',
            mouseup: 'onMouseup'
        };
    },
    onCanvasMousedown() {
        this.resizeflag = false;
        const attrs = config.delegateStyle;
        const combos = this.graph.getCombos();
        const combo_id = combos[0]._cfg.id;
        this.combo = this.graph.findById(combo_id);
        const {minX, minY} = this.combo.getBBox();
        const width = 0, height = 0, x = minX, y = minY;
        const parent = this.graph.get('group');
        this.shape = parent.addShape('rect', {
            attrs: {
                id: 'rect' + uniqueId(),
                width,
                height,
                x,
                y,
                ...attrs
            }
        })
    },
    onMousemove(e) {
        if (this.shape) {
            this.resizeflag = true;
            const width = e.x - this.shape.attrs.x
            const height = e.y - this.shape.attrs.y
            this.shape.attr({
                width,
                height
            })
            this.graph.paint()
        }
    },
    onMouseup() {
        if(this.resizeflag) {
            this.addTeam();
            const {width, height} = this.shape.attr();
            const offset = config.defalutCombo.padding * 2;
            this.combo.update({
                size: [
                    width - offset,
                    height - offset
                ]
            });
            // 删除虚线框
            if (this.shape) {
                this.shape.remove();
                this.shape = null
            }
            this.graph.paint();
            eventBus.$emit('resizeEnd');
        }
        this.graph.setMode('default');

    },
    addTeam() {
        const { x, y, width, height } = this.shape.attrs;
        const { x1, y1, x2, y2 } = getBox(x, y, width, height)
        this.graph.findAll('node', node => {
            const model = node.getModel();
            const { x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight } = node.getBBox()
            const nodeBox = getBox(nodeX, nodeY, nodeWidth, nodeHeight);
            if (!model.comboId &&
                !(x1 > nodeBox.x2 || x2 < nodeBox.x1 || y1 > nodeBox.y2 || y2 < nodeBox.y1)) {
                this.combo.addNode(node);
                this.graph.updateComboTree(node, this.combo.get('id'))
            }
        })

    }
}
