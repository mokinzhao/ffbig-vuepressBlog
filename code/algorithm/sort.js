/*
 * @Author: mokinzhao
 * @Date: 2021-05-24 15:33:20
 * @Description:排序
 */

//-----------------冒泡排序---------------
/*
冒泡排序的思路：遍历数组，然后将最大数沉到最底部；
循环数组，比较当前元素和下一个元素，如果当前元素比下一个元素大，向上冒泡。

这样一次循环之后最后一个数就是本数组最大的数。

下一次循环继续上面的操作，不循环已经排序好的数。

优化：当一次循环没有发生冒泡，说明已经排序完成，停止循环。

#
时间复杂度：O(N^2)；
空间复杂度：O(1)
*/

function bubbleSort(array) {
  for (let j = 0; j < array.length; j++) {
    const element = array[j];
    let complete = true;
    for (let i = 0; i < array.length; i++) {
      //比较相邻数
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        complete = false;
      }
    }
    //没有冒泡结束循环
    if (complete) {
      break;
    }
  }
  return array;
}

//------插入排序-----
/* 
将左侧序列看成一个有序序列，每次将一个数字插入该有序序列。

插入时，从有序序列最右侧开始比较，若比较的数较大，后移一位。
*/
function insertSort(array) {
  for (let i = 0; i < array.length; i++) {
    let target = i;
    for (let j = i - 1; j >= 0; j--) {
      if (array[target] < array[j]) {
        [array[target], array[j]] = [array[j], array[target]];
        target = j;
      } else {
        break;
      }
    }
  }
  return array;
}
//----------选择排序------
//每次循环选取一个最小的数字放到前面的有序序列中。

function selectionSort(array) {
  for (let i = 0; i < array.length; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIndex]);
      {
        minIndex = j;
      }
    }
    [array[minIndex], array[i]] = [array[i], array[minIndex]];
  }
}

//------快速排序-----
/* 
快速排序：通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据比另一部分的所有数据要小，再按这种方法对这两部分数据分别进行快速排序，整个排序过程可以递归进行，使整个数据变成有序序列。
实现步骤：
选择一个基准元素target（一般选择第一个数）
将比target小的元素移动到数组左边，比target大的元素移动到数组右边
分别对target左侧和右侧的元素进行快速排序
从上面的步骤中我们可以看出，快速排序也利用了分治的思想（将问题分解成一些小问题递归求解）
*/
function quickSort(array) {
  if (array.length < 2) {
    return array;
  }
  const target = array[0];
  const left = [];
  const right = [];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element < target) {
      left.push(element);
    } else {
      right.push(element);
    }
  }
  return [...quickSort(left), target, ...quickSort(right)];
}
