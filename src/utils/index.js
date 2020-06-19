import merge from 'lodash/merge';
import pick from 'lodash/pick';
import uniqueId from 'lodash/uniqueId';
import upperFirst from 'lodash/upperFirst';

const toQueryString = obj => Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');

const addListener = (target, eventName, handler) => {
  if (typeof handler === 'function') target.on(eventName, handler);
};

const  getBox=(x, y, width, height)=> {
  const x1 = (x + width) < x ? (x + width) : x
  const x2 = (x + width) > x ? (x + width) : x
  const y1 = (y + height) < y ? (y + height) : y
  const y2 = (y + height) > y ? (y + height) : y
  return {
      x1, x2, y1, y2
  }
}
/**
 * 判断鼠标是否在dom中
 * @param x 鼠标x
 * @param y 鼠标y
 * @param rect {x,y,width,height}
 * @returns {boolean}
 */
const isInBox = (x, y, rect) => {
  const {x:rect_x, y:rect_y, width, height} = rect;
  const {x1, x2, y1, y2} = getBox(rect_x, rect_y, width, height);
  if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
    return true
  }
  return false
}

export {
  merge,
  pick,
  toQueryString,
  uniqueId,
  upperFirst,
  addListener,
  getBox,
  isInBox
};
