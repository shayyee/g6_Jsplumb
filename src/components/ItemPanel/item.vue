<template>
  <ul>
    <li
      v-for="(item,index) in list"
      :key="index"
      class="getItem"
      :data-shape="item.shape"
      :data-type="item.type"
      :data-size="item.size"
      draggable
      @dragstart="handleDragstart"
      @dragend="handleDragEnd($event,item)"
    >
      <span class="pannel-type-icon" :style="{background:'url('+item.image+')'}"></span>
      {{item.name}}
    </li>
  </ul>
</template>

<script>
import eventBus from "@/utils/eventBus";
import okSvg from "@/assets/icons/ok.svg";
import bgImg from "@/assets/bg.jpg";
import {getBox} from "@/utils";

export default {
  data() {
    return {
      page: null,
      command: null,
      offsetX: 0,
      offsetY: 0,
      list: [
        {
          name: "测试节点",
          label: "测试节点",
          size: "170*34",
          type: "node",
          x: 0,
          y: 0,
          shape: "customNode",
          color: "#1890ff",
          image:
            "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
          stateImage: okSvg,
          inPoints: [[0, 0.5]],
          outPoints: [[1, 0.5]]
        },
        // {
        //   name: "背景图片节点",
        //   label: "背景图片节点",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //     "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   backImage: bgImg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]]
        // },
        // {
        //   name: "双输出节点",
        //   label: "双输出节点",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //     "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.4], [1, 0.6]]
        // },
        // {
        //   name: "大型节点",
        //   label: "大型节点",
        //   size: "340*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //     "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]]
        // },
        // {
        //   name: "动画开始节点",
        //   label: "动画开始",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //     "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]],
        //   isDoingStart: true
        // },
        // {
        //   name: "动画结束节点",
        //   label: "动画结束",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //     "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]],
        //   isDoingEnd: true
        // }
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
    handleDragEnd(e, item) {
      let data = {};
      Object.assign(data, item);

      if (this.page) {
        const graph = this.page.graph;
        const size = e.target.dataset.size.split("*");
        const xy = graph.getPointByClient(e.x, e.y);
        data.x = xy.x;
        data.y = xy.y;
        data.size = size;
        data.type = "node";
        // this.command.executeCommand("add", [data]);
        let newNode = this.page.graph.addItem('node', data);
        // 在combo区域中需加入combo中
        const combos = graph.getCombos();
        if(combos.length > 0) {
          this.addTeam();
        }
      }
    },
    bindEvent() {
      eventBus.$on("afterAddPage", page => {
        this.page = page;
        this.command = page.command;
      });
    },
    addTeam() {
      const graph = this.page.graph;
      const combos = graph.getCombos();
      const combo_id = combos[0]._cfg.id;
      const item = graph.findById(combo_id);
      const { x, y, width, height } = item.getBBox();
      const { x1, y1, x2, y2 } = getBox(x, y, width, height);
      graph.findAll('node', node => {
        const model = node.getModel();
        const { x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight } = node.getBBox()
        const nodeBox = getBox(nodeX, nodeY, nodeWidth, nodeHeight);
        if (!model.comboId &&
                !(x1 > nodeBox.x2 || x2 < nodeBox.x1 || y1 > nodeBox.y2 || y2 < nodeBox.y1)) {
          item.addNode(node);
          graph.updateComboTree(node, combo_id)
        }
      })
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
