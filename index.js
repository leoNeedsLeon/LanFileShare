var express = require("express");
var app =  express();
var path = require('path');
var mime = require('mime');
var fs = require('fs');
const fileUpload = require('express-fileupload');
app.set("view engine","ejs");
var fileNames = [];
var dir = __dirname +"\\files\\";
var pastfiles;

app.use(fileUpload({
	safeFileNames : true,
	preserveExtension : 4
}));

app.get("/",function(req,res){
	console.log(dir);
  fs.readdir(dir, function(err, files)
  {
		fileNames = [];
	  	files.forEach(function(file)
	     {
	     	removeSpaces("files/" +file);
	     	fileNames.push(file);
	  	 });

  });
 	res.render("home",{fileNames:fileNames});
});

app.get('/download/:namefile', function(req, res){
  console.log(req.params.namefile);
  var file = dir + req.params.namefile;

  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});

function removeSpaces(fil){
	var newname = fil.replace(" ","_");
	fs.rename(fil, newname, function(err) {
    if ( err ) console.log('ERROR: ' + err);
});
}

app.post("/uploadfile",function(req,res){
	if (!req.files)
    return res.status(400).send('No files were uploaded.');

	let newfile = req.files.newfile;
	console.log(dir + " " +newfile);
	newfile.mv(dir+newfile.name, function(err){
		if(err)
			return res.status(500).send(err);
	res.send("file uploaded");
	});
});

app.listen(3000, function(){
	console.log("Serving on port 3000");
});
