function c2f(c) {
  return c * 9 / 5 + 32;
}

function f2c(f) {
  return (f - 32) * 5 / 9;
}

var tempStr = prompt('請輸入溫度數值：');
var unit = prompt('請輸入單位 (C 或 F)：').toUpperCase();

var temp = parseFloat(tempStr);
var output = '';

if (isNaN(temp) || (unit !== 'C' && unit !== 'F')) {
  output = '輸入錯誤，請輸入數字與正確單位 C 或 F';
} else {
  if (unit === 'C') {
    var f = c2f(temp);
    output = temp + '°C = ' + f.toFixed(2) + '°F';
  } else {
    var c = f2c(temp);
    output = temp + '°F = ' + c.toFixed(2) + '°C';
  }
}

alert(output);
document.getElementById('result').textContent = output;
