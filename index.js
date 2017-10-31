var express = require("express");
var fs = require('fs');
var multer  = require('multer');
var app =  express();
var http = require('http').Server(app);
var io = require('socket.io')(server);

app.set("view engine","ejs");

var fileinfo = [];
var dir = __dirname +"\\files\\";

//storage for multer with  destination and filename
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.originalname);
  }
});

var upload = multer({storage: storage}).array('newfile',50);
		
//home page checks for files in the files folder and passes file info to home.ejs
app.get("/",function(req,res){
	//console.log(dir);
  fs.readdir(dir, function(err, files)
  {
		fileinfo = [];
	  	files.forEach(function(file)
	     {
	     	removeSpaces("files/" +file);
				fs.stat(dir + file, function (err, stats) {
					if(err)
					console.log("Error while reading file creation time:" + err);
   			var filedata = {filename: file, filetime: String(stats.birthtime).substring(0,24)};
				fileinfo.push(filedata);
				});

	  	 });

  });
	//passing fileinfo to be displayed in home page
 	res.render("home",{fileinfo:fileinfo});
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		console.log("message recieved" + msg +" " + socket.request.connection.remoteAddress);
		io.emit('chat message', msg);
	});
});

// route to download files
app.get('/:namefile', function(req, res){
//  console.log("hey man" + req.params.namefile);
  var file = dir + req.params.namefile;
  // var filestream = fs.createReadStream(file);
	// filestream.pipe(res);
	console.log("Ip:" + req.ip + " for " + file);
	res.download(file);
});

// function to remove spaces from file names
function removeSpaces(fil){
	var newname = fil.replace(" ","_");
	fs.rename(fil, newname, function(err) {
    if ( err ) console.log('ERROR: ' + err);
});
}

//route to upload files. It used upload method defined above to upload the files via multer
app.post("/uploadfile",function(req,res){
	upload(req, res, function(err) {
	if(err) {
		console.log('Error Occured ' + err);
		return;
	}
	console.log(req.files);
	res.end('Your Files Uploaded');
});
});

var port = 8000;

var server = app.listen(port, function(){
	console.log('listening on *:'  + port);
});
