var fs = require('fs');

var size = 45;
var min = -9;
var max = 9;
var list_values = [];

var value;
for (var i = 0; i < size; i++)
{
	value = Math.floor(Math.random() * (max - min + 1)) + min;
	list_values.push(value);
}
fs.writeFile('tune.txt', list_values.toString().replace(/[,]/g, ' '), function(err) {
	if (err) throw err;
});
