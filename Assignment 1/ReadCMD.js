var fs = require('fs');

//stops the program if the board file isn't included
if (process.argv.length !== 3) {
    console.error('Exactly one argument required');
    process.exit(1);
}

var boardFile = process.argv[2];
var board;

fs.readFile(boardFile, 'utf-8', function (err, data){
  if (err) throw err;
  board = data.replace(/[	]/g, '');
  board = board.replace(/[\r]/g, '');
  board = board.split('\n');
  PrintBoard();
});

function PrintBoard(){
	board.forEach(function(d) {
    console.log(d.split(''));
  });
}
