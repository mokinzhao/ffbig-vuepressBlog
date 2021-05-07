/*
 * @Author: mokinzhao
 * @Date: 2021-03-30 20:36:22
 * @Description: 手写数组专项
 */

//排序 v8 7.0以前是用 nums<10 插入排序 ，>10以后用快排；V8 7.0之后用的插入+归并排序 （Timsort）

Array.prototype.sort = function (arr) {
  //空数组或数组长度小雨2，直接返回
  if (!arr || arr.length < 2) {
    return arr;
  }
  let runs = [],
    sortedRuns = [],
    newRun = [arr[0]],
    length = arr.length;
  //划分 run 区，并存储到runs 中，这里简单的按照升序划分，没有考虑降序的run
  for (let i = 1; i < length; i++) {
    if (arr[i] < arr[i - 1]) {
      runs.push(newRun);
      newRun = [arr[i]];
    } else {
      newRun.push(arr[i]);
    }
    if (length - 1 === i) {
      runs.push(newRun);
      break;
    }
  }
  //由于仅仅是升序的run，没有涉及到run的扩充和降序的run，因此其实这里没有必要使用insertionSort来进行run自身的排序
  for (let run of runs) {
    insertionSort(run);
  }
  //合并 runs
  sortedRuns = [];
  for (let run of runs) {
    sortedRuns = merge(sortedRuns, run);
  }
  return sortedRuns;
};

//合并两个小数组left,right 到result
function merge(left, right) {
  let result = [],
    indexLeft = 0,
    indexRight = 0;
  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft] < right[indexRight]) {
      result.push(left[indexLeft++]);
    } else {
      result.push(right[indexRight++]);
    }
    return result;
  }
  while (indexLeft < left.length) {
    result.push(left[indexLeft++]);
  }

  while (indexRight < right.length) {
    result.push(right[indexRight++]);
  }
}

//插入排序
function insertionSort(arr) {
  let n = arr.length;
  let preIndex, current;
  for (let i = 1; i < n; i++) {
    preIndex = i - 1;
    current = arr[i];
    while (preIndex >= 0 && arr[preIndex] > current) {
      arr[preIndex + 1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex + 1] = current;
  }

  return arr;
}
