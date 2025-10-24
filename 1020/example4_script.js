// example4_script.js
// 判斷輸入數字是否為奇數或偶數

var input = prompt('請輸入一個整數：');
var n = parseInt(input, 10);
var msg = '';

if (isNaN(n)) {
  msg = '輸入不是有效的整數！';
} else if (n % 2 === 0) {
  msg = n + ' 是偶數';
} else {
  msg = n + ' 是奇數';
}

// 額外示範 switch（1、2、3 對應文字）
var choice = prompt('輸入 1/2/3 試試 switch：');
switch (choice) {
  case '1':
    msg += '\n你輸入了 1';
    break;
  case '2':
    msg += '\n你輸入了 2';
    break;
  case '3':
    msg += '\n你輸入了 3';
    break;
  default:
    msg += '\n非 1/2/3';
}

//分數轉等第
var scoreInput = prompt('請輸入分數（0–100）：');
var score = parseInt(scoreInput, 10);

if (isNaN(score) || score < 0 || score > 100) {
  msg += '\n分數輸入不正確！';
} else if (score >= 90) {
  msg += '\n等第：A';
} else if (score >= 80) {
  msg += '\n等第：B';
} else if (score >= 70) {
  msg += '\n等第：C';
} else if (score >= 60) {
  msg += '\n等第：D';
} else {
  msg += '\n等第：F';
}
document.getElementById('result').textContent = msg;
