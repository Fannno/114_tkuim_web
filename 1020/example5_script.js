// example5_script.js
// 以巢狀 for 產生 1~9 的乘法表
var start = prompt('請輸入起始數字（1–9）：');
var end = prompt('請輸入結束數字（1–9）：');

var s = parseInt(start, 10);
var e = parseInt(end, 10);
var output = '';
for (var i = s; i <= e; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}
document.getElementById('result').textContent = output;
