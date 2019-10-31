var gui = require('nw.gui');
// var ioclient = require('socket.io-client');

var win = gui.Window.get();
var isMac = require('os').platform() === 'darwin';
//win.showDevTools(); // uncomment if you want to debug

if(isMac) {
    document.title = '\u3000'; // to get around https://github.com/nwjs/nw.js/issues/3645
}



// don't let clippy.js add any handlers
$.fn.on = function(){};

// Load clippy from localhost instead of the default amazon s3 bucket
var base_path_arr = window.location.href.split('/');
base_path_arr.pop();
clippy.BASE_PATH = base_path_arr.join('/') + '/';
clippy.Balloon.prototype.CLOSE_BALLOON_DELAY = 100000;

// show clippy
clippy.load('Clippy', function(agent){
    // agent.show();
    var url = "http://10.13.37.100:4000/clippy";
    if (process.env.WS_URL !== undefined) {
        url = process.env.WS_URL;
    }
    var ws = io(url);
    ws.on('connect', function () {
        console.log("WS connected");
    });
    ws.on('error', function(socket){
        console.log('Error!');
    });

    function ensureVisible() {
        win.show();
        document.body.classList.remove('hidden');
        agent.show();
    }

   function say(msg) {
        ensureVisible();
        agent.speak(msg);
   }

    //say("Hello world. This is a rather long sentence. Does this work? How complex can this be really. Longer than this? Thats crazy.");

    ws.on('say', function(msg) {
        say(msg);
    });

    var windowX = null;
    var windowY = null;
    setTimeout(function(){
        windowX = win.x;
        windowY = win.y;
    }, 250);

    // to be safe: use focus as a click handler kinda, to trigger animations. Blur when done so every click triggers
    // an animation
    win.on('focus', function(){
        agent.animate();
        win.blur();
    });

    // Since double-clicking draggable areas triggers maximizing on some platforms, when tell the user double-clicking
    // closes clippy but actually we'll hide the window, unmaximize, resize back to the normal size and show again
    // with a speech bubble
    win.on('maximize', function(){
        document.body.classList.add('hidden');
        win.hide();

        setTimeout(function(){
            win.unmaximize();
            win.resizeTo(gui.App.manifest.window.width, gui.App.manifest.window.height);
            win.moveTo(windowX, windowY);
        }, 250);
    });
});
