// Globals for now..
path = "";
var user_prompt = "guest@title:";

function getPrompt() {
	return "guest@title:/" + path + "$ ";
}

// Default PATH

function getChar(event) {
	return String.fromCharCode(event.keyCode || event.charCode);
}

function newline(element, text) {
	var p = document.createElement("p");
	p.innerText = text;
	element.appendChild(p);
}

function readfile(file, callback) {
	file = window.location.origin + "/" + file;
	fetch(file, { method: 'get' }).then(function(response) { 
		return response.text(); 
	}).then(function(content) { 
		callback(content);
	});
}

function readdir(directory, callback) {
	directory = window.location.origin + "/" + directory;
	fetch(directory, { method: 'get' }).then(function(response) {  return response.text(); }).then(function(content) { 
		parser = new DOMParser();
		htmlDoc = parser.parseFromString(content, "text/html");

		var text = "";

		var elements = htmlDoc.getElementsByTagName('a');

		callback(elements);
	});
}

function executeCommand(display, cmdstr) {
	var args = cmdstr.split("\u00A0");
	var cmd = args[0];
	var arg;
	if (args.length > 1) {
		// Or .join()
		arg = args[1];
	}

	switch(cmd) {
		case "cat":
			if (path !== "") {
				arg = path + "/" + arg;
			}
			readfile(arg, function(text) {
				if (text) {
					newline(display, text);
				}
			});
			break;
		case "cd":
			if (arg) {
				if (path !== "") {
					arg = path + "/" + arg;
				}
				readdir(arg, function(files) { 
					// Change was succesful..
					if (files.length >= 1) {
						var user_prompt = document.getElementById("prompt");

						path = arg;
						user_prompt.innerText = getPrompt();

						newline(display, "");
					} else {
						newline(display, "cd: no such file or directory: " + arg);
					}

				});
			} else {
				var user_prompt = document.getElementById("prompt");
				path = "";
				user_prompt.innerText = getPrompt();
				newline(display, "");
			}
			break;
		case "clear":
			while(display.hasChildNodes()) {
				display.removeChild(display.childNodes[0]);
			}
			break;
		case "ls":
			var dir = path; //window.location.origin;
			if (arg) {
				dir += "/" + arg;
			}
			readdir(dir, function(files) { 
				var text = "";
				for (var i = 0; i < files.length; i++) {
					text += " " + files[i].innerText;
				}
				newline(display, text);
			});

			break;
		case "pwd":
			newline(display, "/" + path);
			break;
		default:
			newline(display, "-shelljs: " + cmd + ": command not found");
			break;
	}
}

document.addEventListener("DOMContentLoaded", function() {
	// FIXME: those globals..
	var cursor = document.getElementById("cursor");
	var display = document.getElementById("display");
	var text = document.getElementById("text");

	setInterval(function() {
		if (cursor.className) {
			cursor.className = "";
		} else {
			cursor.className = "cursor-on";
		}
	}, 800);

	document.onkeydown = function(event) {
		switch (event.keyCode) {
			// Backspace
			case 8:
				event.preventDefault();

				if (text.innerText.length > 0) {
					text.innerText = text.innerText.slice(0, -1);
				}
			break;
		}
	};

	document.onkeypress = function(event) {
		// FIXME: when inserting text, disable cursor blinking..

		switch (event.keyCode) {
			// Enter
			case 13:
				var p = document.createElement("p");
				p.innerText = getPrompt() + text.innerText;

				display.appendChild(p);
				executeCommand(display, text.innerText);

				text.innerText = "";
				break;
			// Space
			case 32:
				text.innerText += "\u00A0";
				break;
			default:
				var character = getChar(event || window.event);
				// Any other special key
				if (character) {
					text.innerText += character;
				}

		}
	};
});
