<template>
    <div class="page" ref="page">
        <div ref="graph" :id="pageId" class="graph-container" style="position: relative;"></div>
        <div ref="prepare" class="prepare">
            <div ref="line" class="line"></div>
        </div>
    </div>
</template>


<script>
    import G6 from "@antv/g6";
    import {initBehavors} from "../../behavior";
    import eventBus from "@/utils/eventBus";
    import {getBox, isInBox} from "@/utils";

    export default {
        data() {
            return {
                pageId: "graph-container",
                graph: null,
                scale: 1.0,
                resizeflag: false,
                prepareResizing: false,
            };
        },
        props: {
            height: {
                type: Number,
                default: 0
            },
            width: {
                type: Number,
                default: 0
            },
            data: {
                type: Object,
                default: () => {
                }
            }
        },
        created() {
            initBehavors();
        },
        mounted() {
            this.$nextTick(() => {
                this.init();
                document.getElementById(this.pageId).addEventListener('dragover', this.handleDrag, true);
                eventBus.$on('resizeEnd', () => {
                    console.log('resizeEnd')
                    this.resizeflag = false;
                })
            });
            this.$refs.page.addEventListener('mousemove',this.pageMouseMove);
            document.addEventListener('mouseup',this.pageMouseUp);
        },
        beforeDestroy() {
            this.graph.off();
        },
        methods: {
            handleDrag(ev) {
                const {clientX, clientY} = ev;
                console.log(clientX, clientY);
                let graph = this.graph;
                let pageData = graph.save();
                console.log(pageData);
                // 判断当前鼠标是否在某个节点上
                if (pageData.nodes) {
                    for (let i = 0, len = pageData.nodes.length; i < len; i++) {
                        let node = pageData.nodes[i];
                        console.log(node);
                        let position = graph.getClientByPoint(node.x, node.y);
                        let item = graph.findById(node.id);
                        let node_width = node.size[0] * this.scale;
                        let node_height = node.size[1] * this.scale;
                        console.log(item.getBBox(), item.getCanvasBBox())
                        if (clientX >= (position.x - node_width / 2) && clientX <= (position.x + node_width / 2)
                            && clientY >= (position.y - node_height / 2) && clientY <= (position.y + node_height / 2)) {
                            console.log('----------in----------')
                            graph.setItemState(item, 'dragIn', true);
                            this.$store.commit('setCurNode', node);
                            break;
                        } else {
                            console.log('----------out----------')
                            graph.setItemState(item, 'dragIn', false);
                            this.$store.commit('setCurNode', '');
                        }
                    }
                }
            },
            init() {
                const height = this.height - 42
                const width = this.width - 400

                const graph = new G6.Graph({
                    container: "graph-container",
                    height: height,
                    width: width,
                    modes: {
                        // 支持的 behavior
                        default: [
                            "drag-canvas",
                            "zoom-canvas",
                            "hover-node",
                            "select-node",
                            "hover-edge",
                            // "keyboard",
                            // "customer-events",
                            // "add-menu",
                            {
                                type: 'drag-item',
                                enableDelegate: true,
                                selectedState: 'hover'
                            },
                            {
                                type: 'drag-combo',
                                enableDelegate: true,
                                activeState: 'actived'
                            },
                        ],
                        mulitSelect: ["mulit-select"],
                        addEdge: ["add-edge"],
                        editEdge: ["edit-edge"],
                        resizeCombo: ["resize-combo"]
                    },
                    comboStateStyles: {
                        // the style configurations for the hover state on the combo
                        hover: {
                            stroke: '#6ab7ff',
                            cursor: 'move'
                        },
                        resize: {
                            cursor: "crosshair"
                        }
                    }
                });
                graph.on('afteradditem', (ev) => {
                    console.log('afteradditem', ev);
                })
                graph.on('node:click', (ev) => {
                    console.log('node:click', ev);
                    const {item} = ev;
                    let position = this.graph.getClientByPoint(item._cfg.model.x, item._cfg.model.y);
                    console.log(position);
                    // const combos = this.graph.getCombos();
                    // if(combos.length > 0) {
                    //     const combo_id = combos[0]._cfg.id;
                    //     const combo = this.graph.findById(combo_id);
                    //     combo.addNode(item);
                    //     graph.updateComboTree(item, combo_id)
                    // }
                });
                graph.on("node:dragend", () => {
                    const timer = setTimeout(() => {
                        const combos = this.graph.getCombos();
                        if(combos.length > 0) {
                            const combo_id = combos[0]._cfg.id;
                            const combo = this.graph.findById(combo_id);
                            console.log(combo.getNodes())
                            if(combo.getNodes().length === 0) {
                                graph.removeItem(combo_id);
                            }
                        }
                        clearTimeout(timer)
                    }, 0)
                })
                graph.on("afterupdateitem", () => {
                    console.log(1111)
                })
                graph.on("afterremoveitem", () => {
                    console.log("afterremoveitem")
                })
                // graph.on('canvas:click', ev => {
                //     console.log('canvas:click', ev)
                //     console.log(graph.save(), graph.getCurrentMode())
                //     console.log(ev.clientX, ev.clientY)
                // });
                graph.on('viewportchange', ev => {
                    console.log('viewportchange', ev)
                    this.scale = ev.matrix[0];
                    // this.$refs.
                });
                graph.on("canvas:mousedown", () => {
                    console.log('canvas:mousedown',graph.getCurrentMode())
                    // 判断当前是否在resize combo
                    if(graph.getCurrentMode() === 'resizeCombo') {
                        this.resizeflag = true;
                    } else {
                        this.resizeflag = false;
                    }
                })
                graph.on("canvas:mousemove", evt => {
                    const {x, y} = evt;
                    // combo resize
                    if(this.resizeflag) return;
                    const combos = graph.getCombos();
                    if(combos.length > 0) {
                        const combo_id = combos[0]._cfg.id;
                        const item = graph.findById(combo_id)
                        const {maxX, maxY} = item.getBBox();
                        const offsetWidth = 5;
                        const canvas = document.getElementById('graph-container').children[0]
                        if (x >= maxX && x <= maxX + offsetWidth
                            && y >= maxY && y <= maxY + offsetWidth) {
                            // graph.setItemState(item, "resize", true);
                            canvas.style.cursor = 'crosshair';
                            graph.setMode('resizeCombo');
                        } else {
                            canvas.style.cursor = 'default';
                            if(graph.getCurrentMode() === 'resizeCombo') {
                                graph.setMode('default');
                            }
                        }
                    }

                });
                graph.on("combo:mouseenter", evt => {
                    const {item} = evt;
                    graph.setItemState(item, "hover", true);
                    console.log(item.getChildren())
                });

                graph.on("combo:mouseleave", evt => {
                    const {item} = evt;
                    graph.setItemState(item, "hover", false);
                });

                graph.on("combo:dragend", evt => {
                    console.log("combo:dragend", evt);
                    const timer = setTimeout(() => {
                        clearTimeout(timer)
                        this.addTeam();
                    }, 0)
                });
                const {editor, command} = this.$parent;
                editor.emit("afterAddPage", {graph: graph, command});
                this.graph = graph;
                this.readData();
            },
            readData() {
                let data = this.data;
                if (data) {
                    this.graph.read(data);
                }
            },
            addTeam() {
                const combos = this.graph.getCombos();
                const combo_id = combos[0]._cfg.id;
                const item = this.graph.findById(combo_id);
                console.log(item)
                const { x, y, width, height } = item.getBBox();
                const { x1, y1, x2, y2 } = getBox(x, y, width, height);
                this.graph.findAll('node', node => {
                    const model = node.getModel();
                    const { x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight } = node.getBBox()
                    const nodeBox = getBox(nodeX, nodeY, nodeWidth, nodeHeight);
                    if (!model.comboId &&
                        !(x1 > nodeBox.x2 || x2 < nodeBox.x1 || y1 > nodeBox.y2 || y2 < nodeBox.y1)) {
                        item.addNode(node);
                        this.graph.updateComboTree(node, combo_id)
                    }
                })
            },
            pageMouseMove(evt) {
                const {clientX, clientY} = evt;
                // 预热区 resize
                if(!this.prepareResizing) {
                    const lineElement = this.$refs.line;
                    const lineRect = lineElement.getBoundingClientRect();
                    if (isInBox(clientX, clientY, lineRect)) {
                        this.$refs.graph.style.pointerEvents = 'none';
                        this.$refs.line.addEventListener('mousedown', this.lineMouseDown);
                    } else {
                        this.$refs.graph.style.pointerEvents = 'auto';
                    }
                } else {
                    this.changePrepareSize(clientY);
                }
            },
            pageMouseUp() {
                this.prepareResizing = false;
            },
            lineMouseDown() {
                this.prepareResizing = true;
            },
            changePrepareSize(y) {
                console.log(y)
                this.$refs.prepare.style.height = (y - 42) + 'px';
                this.$refs.line.style.top = (y - 42) + 'px';
            }
        }
    };
</script>

<style scoped>
    .page {
        margin-left: 200px;
        margin-right: 200px;
        position: relative;
    }
    .graph-container {
        z-index: 10;
    }
    .prepare {
        width: 100%;
        height: 100px;
        position: absolute;
        top: 0;
        background: #9cf3bf;
    }
    .line {
        width: 100%;
        height: 8px;
        position: absolute;
        background: #66b1ff;
        top: 100px;
        cursor: row-resize;
    }

</style>
