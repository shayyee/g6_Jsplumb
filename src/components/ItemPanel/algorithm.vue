<template>
    <ul>
        <li
            v-for="(item,index) in list"
            :key="index"
            draggable
            @dragstart="handleDragstart"
            @dragend="handleDragEnd($event,item)"
        >
            {{item.name}}
        </li>
    </ul>
</template>

<script>
    import eventBus from "@/utils/eventBus";
    export default {
        data() {
            return {
                page: null,
                command: null,
                offsetX: 0,
                offsetY: 0,
                list: [
                    {
                        name: "算法1",
                        label: "算法1",
                        size: "170*34",
                        type: "algorithm",
                        x: 0,
                        y: 0
                    }
                ]
            };
        },
        created() {
            this.bindEvent();
        },
        methods: {
            handleDragstart(e) {
                this.offsetX = e.offsetX;
                this.offsetY = e.offsetY;
            },
            handleDragEnd() {
                if(this.$store.state.curNode) {
                    const node = this.page.graph.findById(this.$store.state.curNode.id);
                    this.page.graph.setItemState(node, 'setOK', true)
                }
            },
            bindEvent() {
                eventBus.$on("afterAddPage", page => {
                    this.page = page;
                    this.command = page.command;
                });
            }
        }
    };
</script>

<style scoped>
    .itempannel {
        height: 100%;
        position: absolute;
        left: 0px;
        z-index: 2;
        background: #f7f9fb;
        width: 200px;
        padding-top: 8px;
        border-right: 1px solid #e6e9ed;
    }

    .itempannel ul {
        padding: 0px;
        padding-left: 16px;
    }

    .itempannel li {
        color: rgba(0, 0, 0, 0.65);
        border-radius: 4px;
        width: 160px;
        height: 28px;
        line-height: 26px;
        padding-left: 8px;
        border: 1px solid rgba(0, 0, 0, 0);
        list-style-type: none;
    }

    .itempannel li:hover {
        background: white;
        border: 1px solid #ced4d9;
        cursor: move;
    }

    .itempannel .pannel-type-icon {
        width: 16px;
        height: 16px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
    }
</style>
