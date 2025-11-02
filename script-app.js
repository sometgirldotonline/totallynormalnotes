setTimeout(()=>{document.querySelector(".splash").style.opacity=1},1)
setTimeout(()=>{document.querySelector(".splash").style.opacity=0},1000)
setTimeout(()=>{document.querySelector(".app").style.opacity=1},900)
setTimeout(()=>{document.querySelector(".splash").remove()},1200)
const notemd = document.querySelector("#note-md");

function playJumpscare(){
	if(window.jumpscare !== null && window.jumpscare !== undefined){
		window.jumpscare.pause()
		window.jumpscare = null
	}
	jumpscares = ["freakydoorbell.wav.mp3","recorded2.wav.mp3", "recorded.wav.mp3", "yourHomeSecIsGreatOrIsIt.mp4", "muta.mp4"]
	jump = jumpscares[Math.floor(Math.random() * jumpscares.length)]
	if(jump.endsWith("mp3")){
		window.jumpscare = new Audio(jump)
		console.log(jump)
		window.jumpscare.play()
		window.jumpscare.onended = ()=>{window.jumpscare == null}
	}
	else {
		try{
			document.querySelector(".jumpvid").remove()
		}
		catch{}
			vid = document.createElement("video")
			vid.classList.add("jumpvid")
			vid.autoplay = true
			vid.controls = false
			vid.src = jump
			document.body.appendChild(vid)
			var audioCtx = new AudioContext()
			var source = audioCtx.createMediaElementSource(vid)
			var gainNode = audioCtx.createGain()
			gainNode.gain.value = 50 // double the volume
			source.connect(gainNode)
			gainNode.connect(audioCtx.destination)
			vid.onended = document.querySelector(".jumpvid").remove

	}
}

keyboard = {
	shift: [
		"~!@#$%^&*()_+",
		"QWERTYUIOP{}|",
		'ASDFGHJKL:"',
		"ZXCVBNM<>?"
	],
	noshift: [
		"`1234567890-=",
		"asdfghjkl;'",
		"zxcvbnm,./"
	]
}
keyboardModeFinder = {
	shift: keyboard.shift.join(''),
	noshift: keyboard.noshift.join(''),
}
function randomReplace(char, useRandomShift=false){
	ret = ""
	if(keyboardModeFinder.shift.includes(char) || (useRandomShift && Math.round(Math.random()) == 1 )){
		// user was on caps/shift
		keyboard.shift.forEach(row => {
			if(row.includes(char)){
				offset = [-1,0,1][Math.floor(Math.random() * 3)]
				position = row.indexOf(char)
				newPos = position + offset
				if(newPos < 0){
					newPos = 0
				}
				if(newPos > row.length+1){
					newPos = row.length+1
				}
				ret = row[newPos]
			}
		})
	}
	else{
	keyboard.noshift.forEach(row => {
				if(row.includes(char)){
					offset = [-1,0,1][Math.floor(Math.random() * 3)]
					position = row.indexOf(char)
					newPos = position + offset
					if(newPos < 0){
						newPos = 0
					}
					if(newPos > row.length-1){
						newPos = row.length-1
					}
					ret =  row[newPos]
				}
			})
	}
	return ret
}


var db = new Dexie("totallynormalnotesDB")

db.version(1).stores({notes:"++id,title,content,createdate"})

async function shownote(id){
	try{
		document.querySelector(".noteslist #notes").value=String(id)
	}
	catch(e){
		console.error(e)
	}
	title = document.querySelector("#note-title")
	note = await db.notes.get(id)
	notemd.value = note.content || ""
	title.value = note.title || "Untitled Note"
	notemd.readOnly = false
	document.title = `Notes - ${note.title}`
	window.location.hash = id
	notemd.onkeyup = () => {
		db.notes.update(id, {content: notemd.value})
	}
	notemd.oninput = () => {
		if(Math.floor(Math.random() * 5) + 1 === 1 && notemd.value.length > 0){
			const lastChar = notemd.value[notemd.value.length - 1]
			const newChar = randomReplace(lastChar, false) || lastChar
			notemd.value = notemd.value.slice(0, -1) + newChar
		}
		if(Math.floor(Math.random() * 50) + 1 === 1 && notemd.value.length > 0){
			playJumpscare()
		}

	}
	title.onkeyup = () => {db.notes.update(id, {title: document.querySelector("#note-title").value})}
}

async function addnote(title = "Untitled Note"){
	const id = await db.notes.add({title: title, content: "", createdate: Date.now()})
	shownote(id)
	return id
}

async function listnotes(){
	const notes = await db.notes.toArray()
	const picker = document.querySelector("#notes")
	picker.innerHTML = `
              <option disabled>Notes</option>
		${notes.map(n=>`<option value="${n.id}">${n.title}</option>`).join('')}`
}
Dexie.on('storagemutated', changes => {
  listnotes();
});

listnotes()

if(window.location.hash !== null){
	shownote(Number(window.location.hash.replace("#","")))
}

function decodeMd(md) {
  if (typeof md !== "string") return "";

  const headings = {
    "######": "h6",
    "#####": "h5",
    "####": "h4",
    "###": "h3",
    "##": "h2",
    "#": "h1",
    ">": "blockquote"
  };

  const wrappers = [
    [/\*\*(.*?)\*\*/g, "b"],
    [/__(.*?)__/g, "b"],
    [/(?<!_)_(?!_)(.*?)_(?<!_)(?!_)/g, "i"],
    [/\*(.*?)\*/g, "i"],
    [/_(.*?)_/g, "i"],
    [/```(.*?)```/g, "code"],
    [/`(.*?)`/g, "pre"],

  ];

  const splitLines = md.split("\n");
  let html = "";

  for (let line of splitLines) {
    // headings
		const headingKeys = Object.keys(headings).sort((a,b) => b.length - a.length);

		for (const fmt of headingKeys) {
		    if (line.startsWith(fmt)) {
		        line = `<${headings[fmt]}><span class="hiddentag">${fmt}</span>${line.slice(fmt.length).trim()}</${headings[fmt]}>`;
		        break;
		    }
		}

    // inline formatting
    for (const [regex, tag] of wrappers) {
      line = line.replace(regex, `<${tag}>$1</${tag}>`);
    }

    html += line + "\n";
  }

  return html;
}


function saveCaret(container) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;

    const range = sel.getRangeAt(0);

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return start;
}

function restoreCaret(container, charIndex) {
    const range = document.createRange();
    const sel = window.getSelection();

    let nodeStack = [container], node, found = false;
    let chars = 0;

    while (nodeStack.length && !found) {
        node = nodeStack.pop();

        if (node.nodeType === Node.TEXT_NODE) {
            const nextChars = chars + node.length;
            if (charIndex <= nextChars) {
                range.setStart(node, charIndex - chars);
                range.collapse(true);
                found = true;
            } else {
                chars = nextChars;
            }
        } else {
            let i = node.childNodes.length;
            while (i--) nodeStack.push(node.childNodes[i]);
        }
    }

    if (found) {
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// usage
notemd.addEventListener("input", (e) => {
   checkFormatting()
   fixCaret()
});

// Hook it to input, keydown, and mouse events if needed
notemd.addEventListener("keydown", () => {
   checkFormatting()
   fixCaret()
});
document.addEventListener("mousedown", () => {
   checkFormatting()
   fixCaret()
});
function fixCaret() {
    const sel = window.getSelection();
    if (!sel || !sel.focusNode) return;

    const node = sel.focusNode;

    // Only target text nodes that are direct children of the notemd
    if (node.nodeType === Node.TEXT_NODE && node.parentElement === notemd) {
        // Remove the text node and put it inside a new div
        const div = document.createElement("div");
        div.textContent = node.textContent || "\u200B"; // preserve text or insert zero-width space
        notemd.replaceChild(div, node);

        // Move caret to the end of the new div
        const range = document.createRange();
        range.setStart(div, div.textContent.length);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }
}
lastFocussedElement = null
function getFocusedLine() {
    let sel = window.getSelection();
    if(!sel || !sel.focusNode) return null;

    let node = sel.focusNode;
    // climb up until we hit a direct child of #note-md
    while(node && node.parentElement !== notemd) {
        node = node.parentElement;
    }
    return node;
}

function checkFormatting() {
    const focusedLine = getFocusedLine();

    [...notemd.children].forEach(line => {
        if(line !== focusedLine){
            line.innerHTML = decodeMd(line.innerText); // render
        } else {
            if(lastFocussedElement !== line){
                line.innerText = line.innerText;
                lastFocussedElement = line;
            }
        }
    });
}



notemd.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        const sel = window.getSelection();
        const range = sel.getRangeAt(0);

        // Get the block element the caret is inside
        let currentBlock = range.startContainer;
        if (currentBlock.nodeType === Node.TEXT_NODE) {
            currentBlock = currentBlock.parentNode;
        }

        // If the caret is inside something that isn’t a direct child of the contenteditable,
        // we want the top-level block inside notemd
        console.log(currentBlock)
        if(currentBlock !== notemd){
	        while (currentBlock.parentNode !== notemd) {
	            currentBlock = currentBlock.parentNode;
	        }
	      }
	      // Create new div
        const newDiv = document.createElement("div");
        newDiv.classList.add("line")
        newDiv.innerHTML = "<br>";

        // Insert as next sibling of the current line
				const next = currentBlock.nextSibling;
				if (next && next.parentNode === notemd) {
				    notemd.insertBefore(newDiv, next);
				} else {
				    notemd.appendChild(newDiv);
				}


        // Move caret into new div
        const newRange = document.createRange();
        newRange.setStart(newDiv, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }
});

