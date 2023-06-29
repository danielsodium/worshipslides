const path = require('path')
const fs = require('fs')
const ipcRenderer= require('electron').ipcRenderer;
const $ = require("jquery");
const scrape = require(path.join(__dirname, '../src/renderer/scrape.js'));
const create = require(path.join(__dirname, '../src/renderer/convert.js'));

/** DATA **/

// Probably bad practice
edited = {
    num : 1,
    order : "",
    lyrics : '"',
    file: ""
}
settings = {};

ugtURL = "";

// why does javascript not have enums
// i literally only use it for state machines

// My makeshift enum
states = {
    NONE : "NONE",
    ERROR : "ERROR",
    SETTINGS : "SETTINGS",
    HOME : "HOME",
    LINK : "LINK",
    EDITOR : "EDITOR",
    SLIDE : "SLIDE",
    LOAD : "LOAD",
    DONE : "DONE"
}

state = states.NONE;

/**
 * Checks if progress bar exists
 * if not for some reason adds it
 */
async function addProgressBar() {
    if (document.getElementById("progress") == null) {
        $("#main").empty();
        return new Promise(resolve => {
            $("#main").load("progress.html", function() {
                resolve();
            });
        })
    }
}

// smooth boi
function moveProgressBar(percent) {
    var bar = document.getElementById("progress");
    if (bar != null) {
        bar.style.width = `${percent}%`;
    }
}

// TODO
function checkURL(url) {
    if (url.slice(0, 37) != "https://tabs.ultimate-guitar.com/tab/") return false;
    return true;
}

async function changeState(newState) {
    switch (newState) {

        case states.HOME:
            $("#main").empty();
            $("#main").load("home.html", function() {
                document.getElementById("start").addEventListener("click", () => { changeState(states.LINK) });
                document.getElementById("settings").addEventListener("click", () => { changeState(states.SETTINGS) });
            });
            break;

        case states.ERROR:
            await addProgressBar();
            $("#steps").empty();
            $("#steps").load("error.html", function() {
                document.getElementById("home").addEventListener("click", () => { changeState(states.HOME) });
            });
            break;
        
        case states.SETTINGS:
            $("#main").empty();
            $("#main").load("settings.html", function() {
                document.getElementById("cookie").value = settings.cookies;
                document.getElementById("cookie").addEventListener("change", (e) => { 
                    ipcRenderer.invoke("write-data", e.target.value) 
                });
                document.getElementById("home").addEventListener("click", () => { changeState(states.HOME) });
            });
            break;
        
        case states.LINK:
            await addProgressBar();
            moveProgressBar(1);
            // clear any previous link
            edited.order = "";
            edited.lyrics = "";

            $("#steps").empty();
            $("#steps").load("link.html", function() {
                document.getElementById("url").addEventListener("change", (e) => { ugtURL = e.target.value })
                document.getElementById("home").addEventListener("click", () => { changeState(states.HOME) });
                document.getElementById("next").addEventListener("click", (e) => { 
                    // so they don't spam click it while loading
                    e.target.disabled = true;
                    changeState(states.EDITOR) 
                });
            });
            break;
        
        case states.EDITOR: 
            
            if (edited.order == "") {
                console.log(ugtURL)
                if (checkURL(ugtURL)) {
                    const data = await scrape(ugtURL, settings.cookies);
                    await addProgressBar();
                    moveProgressBar(25);
                    $("#steps").empty();
                    $("#steps").load("editor.html", function() {
                        document.getElementById("titles").value = data.order;
                        document.getElementById("lyrics").value = data.lyrics;
                        document.getElementById("prev").addEventListener("click", () => { changeState(states.LINK) });
                        document.getElementById("next").addEventListener("click", () => { changeState(states.SLIDE) });
                    
                        // Capitalize button
                        document.getElementById("capitalize").addEventListener("click", () => {
                            document.getElementById("titles").value = document.getElementById("titles").value.toUpperCase();
                            document.getElementById("lyrics").value = document.getElementById("lyrics").value.toUpperCase();
                        });
                    });
                } else {
                    // TODO: Make some kind of notification that it didn't work
                    ipcRenderer.invoke('msg', "Error", "Invalid Link").then(() => {
                        changeState(states.LINK);
                    });
                    console.log("error: bad link");
                    changeState(states.LINK);
                }
            }
            // No need to rescrape if we went backwards 
            else {
                await addProgressBar();
                moveProgressBar(25);
                $("#steps").empty();
                $("#steps").load("editor.html", function() {
                    document.getElementById("titles").value = data.order;
                    document.getElementById("lyrics").value = data.lyrics;
                    document.getElementById("prev").addEventListener("click", () => { changeState(states.LINK) });
                    document.getElementById("next").addEventListener("click", () => { changeState(states.SLIDE) });
                });
            }
            break;

        case states.SLIDE:
            await addProgressBar();
            moveProgressBar(50);

            if (document.getElementById("titles") != null) {
                edited.order = document.getElementById("titles").value;
                edited.lyrics = document.getElementById("lyrics").value;
            }
            $("#steps").empty();
            $("#steps").load("slide.html", function() {
                document.getElementById("prev").addEventListener("click", () => { changeState(states.EDITOR) });
                document.getElementById("next").addEventListener("click", () => { changeState(states.LOAD) });
            });
            break;

        case states.LOAD:

            if (document.getElementById("template").files.length == 0 || document.getElementById("slide").value == NaN
                || document.getElementById("slide").value < 1) {
                ipcRenderer.invoke('msg', "Error", "No file or slide selected").then(() => {
                    changeState(states.SLIDE);
                });
            }
            
            moveProgressBar(75);
            await addProgressBar();

            edited.file = document.getElementById("template").files[0].path;
            edited.num = document.getElementById("slide").value;

            $("#steps").empty();
            $("#steps").load("load.html", async function() {
                await create(edited.num, edited.order, edited.lyrics, edited.file);
                changeState(states.DONE);
            });
            break;
        
        case states.DONE:
            await addProgressBar();
            moveProgressBar(100);

            $("#steps").empty();
            $("#steps").load("done.html", async function() {
                document.getElementById("home").addEventListener("click", () => { changeState(states.HOME) });
            });
            break;

        default:
            changeState(states.ERROR);
    }

    state = newState;
}

// Load main content
window.onload=function(){
    ipcRenderer.invoke("read-data").then(result => {
        settings = result;
    })
    changeState(states.HOME);
}