function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var target = getRandomInt(1, 100);
var count = 0;
var guess;
var output = '';

while (true) {
  guess = parseInt(prompt('請猜一個數字 (1-100)：'), 10);
  count++;
  if (isNaN(guess) || guess < 1 || guess > 100) {
    alert('請輸入 1~100 的整數');
    continue;
  }
  if (guess < target) {
    alert('再大一點');
  } else if (guess > target) {
    alert('再小一點');
  } else {
    alert('恭喜！猜中數字 ' + target + '，共猜了 ' + count + ' 次');
    output = '猜中數字：' + target + '\n共猜次數：' + count;
    break;
  }
}

document.getElementById('result').textContent = output;
