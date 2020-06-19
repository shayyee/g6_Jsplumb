import G6 from '@antv/g6'
const Util = G6.Util
const DELTA = 0.05;
export default {
    getDefaultCfg() {
        return {
            sensitivity: 2,
            minZoom: 0.1,
            maxZoom: 10,
        };
    },
    getEvents() {
        return {
            wheel: 'onWheel',
        };
    },
    onWheel(e) {
        e.preventDefault();
        if (!this.shouldUpdate.call(this, e)) {
            return;
        }
        const graph = this.graph;
        const canvas = graph.get('canvas');
        const point = canvas.getPointByClient(e.clientX, e.clientY);
        const sensitivity = this.get('sensitivity');
        let ratio = graph.getZoom();
        // 兼容 IE、Firefox 及 Chrome
        if (e.wheelDelta < 0) {
            ratio = 1 - DELTA * sensitivity;
        } else {
            ratio = 1 + DELTA * sensitivity;
        }
        const zoom = ratio * graph.getZoom();
        if (zoom > this.get('maxZoom') || zoom < this.get('minZoom')) {
            return;
        }
        graph.zoom(ratio, { x: point.x, y: point.y });
        const lockedNodes = this.graph.findAll('node', node => !node.hasLocked());
        lockedNodes.forEach(node => {
            const matrix = Util.clone(node.get('group').getMatrix());
            const center = node.getModel();
            Util.mat3.translate(matrix, matrix, [-center.x, -center.y]);
            Util.mat3.scale(matrix, matrix, [ratio, ratio]);
            Util.mat3.translate(matrix, matrix, [center.x, center.y]);
            node.get('group').setMatrix(matrix);
        });
        graph.paint();
        graph.emit('wheelzoom', e);
    },
}
