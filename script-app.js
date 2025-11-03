setTimeout(()=>{document.querySelector(".splash").style.opacity=1},1)
setTimeout(()=>{document.querySelector(".splash").style.opacity=0},1000)
setTimeout(()=>{document.querySelector(".app").style.opacity=1},900)
setTimeout(()=>{document.querySelector(".splash").remove()},1200)
const notemd = document.querySelector("#note-md");
const noteplain = document.querySelector("#note-plaintext");
String.prototype.replaceAt = function(index, replacement) {
	if(replacement == undefined || replacement == null){
		return this
	}
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
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
async function buildNoteTree(notes = null) {
    if (!notes) {
        notes = await db.notes.toArray();
    }

    const tree = [];

    notes.forEach(note => {
        let current = tree;

        // If no path, just push to root
        if (!note.path || note.path.length === 0 || (note.path.length === 1 && note.path[0] === "")) {
            current.push(note);
        } else {
            // Traverse path
            note.path.forEach((segment, i) => {
                // Look for existing folder
                let folder = current.find(obj => obj.title === segment && obj.type === "folder");

                if (!folder) {
                    folder = { title: segment, folder: [], type: "folder" };
                    current.push(folder);
                }

                // If last segment, push the note
                if (i === note.path.length - 1) {
                    note.type = "file";
                    folder.folder.push(note);
                }

                // Move current into this folder's array for next iteration
                current = folder.folder;
            });
        }
    });

    return tree;
}

function recurseAndBuild(items, container) {
	console.log(items)
	items.forEach((item, idx) => {
	    console.log(idx, item.type, Array.isArray(item.folder));
	});
    items.forEach(item => {

        if (item.type === "file" || item.type == undefined) {
        	console.log("Adding file: ", item.path, item.title)
            const but = document.createElement("button");
            but.innerText = item.title;
            but.onclick = () =>{shownote(item.id)}
            container.appendChild(but);
        } else if (item.type === "folder") {
            const folder = document.createElement("details");
            const path = document.createElement("summary");
            path.innerText = item.title;
            folder.appendChild(path);

            const innerContainer = document.createElement("div"); // container for children
            folder.appendChild(innerContainer);

            recurseAndBuild(item.folder, innerContainer); // recurse into innerContainer

            container.appendChild(folder);
        }
    });
    return container;
}


var db = new Dexie("totallynormalnotesDB")

db.version(1).stores({notes:"++id,title,content,createdate,tags,path"})

async function shownote(id){
	// try{
	// 	document.querySelector(".noteslist #notes").value=String(id)
	// }
	// catch(e){
	// 	console.error(e)
	// }
	title = document.querySelector("#note-title")
	tags = document.querySelector("#note-tags")
	path = document.querySelector("#note-path")
	note = await db.notes.get(id)
	noteplain.value = note.content || ""
	title.value = note.title || "Untitled Note"
	tags.value = (note.tags || []).join(", ") || ""
	path.value = (note.path || []).join("/") || ""
	noteplain.readOnly = false
	document.title = `Notes - ${note.title}`
	window.location.hash = id
	notemd.innerHTML = decodeMd(noteplain.value)	
	noteplain.onkeyup = () => {
		db.notes.update(id, {content: noteplain.value})
		notemd.innerHTML = decodeMd(noteplain.value)
	}
	noteplain.oninput = () => {
		pos = noteplain.selectionStart
		if(Math.floor(Math.random() * 5) + 1 === 1 && noteplain.value.length > 0){
			const lastChar = noteplain.value[noteplain.selectionStart-1]
			const newChar = randomReplace(lastChar, false) || lastChar
			noteplain.value = noteplain.value.replaceAt(noteplain.selectionStart-1, newChar)
			noteplain.setSelectionRange(pos, pos)
		}
		if(Math.floor(Math.random() * 50) + 1 === 1 && noteplain.value.length > 0){
			playJumpscare()
		}

	}
	title.onkeyup = () => {db.notes.update(id, {title: document.querySelector("#note-title").value})}
	tags.onkeyup = () => {db.notes.update(id, {tags: document.querySelector("#note-tags").value.split(", ")})}
	path.onkeyup = () => {db.notes.update(id, {path: document.querySelector("#note-path").value.split("/")})}
}

async function addnote(title = "Untitled Note"){
	const id = await db.notes.add({title: title, content: "# Test of Note.\n", createdate: Date.now(), tags: [], path:[]})
	shownote(id)
	return id
}

async function listnotes(notes = null){
	if(notes == null){
		notes = await db.notes.toArray()
	}
	const picker = document.querySelector("#notes")
	picker.innerHTML = `
              <option disabled>Notes</option>
		${notes.map(n=>`<option value="${n.id}">${n.title}</option>`).join('')}`
}
Dexie.on('storagemutated', async changes => {
  // listnotes();
	document.querySelector(".notetree").innerHTML = ""
	recurseAndBuild((await buildNoteTree()), document.querySelector(".notetree"))
});

async function init() {
    document.querySelector(".notetree").innerHTML = "";
    const tree = await buildNoteTree();
    recurseAndBuild(tree, document.querySelector(".notetree"));
}

init();

if(window.location.hash !== null){
	shownote(Number(window.location.hash.replace("#","")))
}
function preparseCodeBlocks(md) {
  const lines = md.split("\n");
  const result = [];
  let buffer = [];
  let insideBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!insideBlock) {
        insideBlock = true;
        buffer.push(line.replace(/^```/, "")); // remove starting fence
      } else {
        // closing fence
        insideBlock = false;
        const code = buffer.join("\n").trim();
        result.push(`<pre><code>${code}</code></pre>`);
        buffer = [];
      }
    } else if (insideBlock) {
      buffer.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
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
  [/`(.*?)`/g, "code"],

  // Generic Code
  // [/```(.*?)```/g, "code"],

  // Bold+Italic text
  [/\*\*\*(.*?)\*\*\*/g, "bi"],
  [/___(.*?)___/g, "bi"],
  [/\*\*_(.*?)_\*\*/g, "bi"],
  [/__\*(.*?)\*__/g, "bi"],

  // Bold
  [/\*\*(.*?)\*\*/g, "b"],
  [/__(.*?)__/g, "b"],

  // Italic
  [/(?<!_)_(?!_)(.*?)_(?<!_)(?!_)/g, "i"],
  [/\*(.*?)\*/g, "i"],
  [/_(.*?)_/g, "i"]
  ];
const wrapperMD = {
  // Text
  "b": "**",
  "i": "_",
  "bi": "***",

  // Code
  "code": "`",

  // Formatted code
  "boldcode": "**`",
  "icode": "_`",
  "bicode": "***`"
};

  const splitLines = md.split("\n");

  let html = "";
  let lookingForEndingBlock = false
  for (let line of splitLines) {
	if(line.startsWith("```") && !lookingForEndingBlock){
	    lookingForEndingBlock = true;
	    html += '<pre><code>'+line.replace("```", '')
	    continue;  // skip to next line
	}

	if(line.startsWith("```") && lookingForEndingBlock){
	    lookingForEndingBlock = false;
	    html += '</code></pre>'+line.replace("```", '')
	    continue;  // skip to next line
	}

	if(lookingForEndingBlock){
	    html += line + "\n";  // only append the content inside codeblock
	    continue;
	}
    // headings
		const headingKeys = Object.keys(headings).sort((a,b) => b.length - a.length);

		for (const fmt of headingKeys) {
		    if (line.startsWith(fmt)) {
		        line = `<${headings[fmt]}>${line.slice(fmt.length).trim()}</${headings[fmt]}>`;
		        break;
		    }
		}
	// handle multiline codeblocks
	

	if(!lookingForEndingBlock){
	    // inline formatting
	    line = line.replace(/\!\[(.*?)\]\((.*?)\)/g, `<img src="$2" alt="$1"><br>`)
		line = line.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2">$1</a><br>`)
	    for (const [regex, tag] of wrappers) {
	      line = line.replace(regex, `<${tag}>$1</${tag}>`);
	    }
	    if(!line.startsWith("<h") && !line.startsWith("<blockquote")){
		    html += line + "<br>";

	    }
	   	else{
		    html += line;

	   	}

	}

  }
  return "<para>"+html.replaceAll("\n\n", "</para><para>") + "</para>";
}


async function searchNotes(query){
	if(query.startsWith(":js:")){
		query = query.replace(":js:","")
		if(query.trim() == ""){
			return
		}
		notes = await db.notes.toArray()
		try{
			result = eval(`notes.filter(i=>(`+query+"))")

		}
		catch(e){
			alert("Error in query: "+e)
			return
		}
	}
	else{
		result = await db.notes.filter(item => (item.title.toLowerCase().includes(query.toLowerCase()) || item.content.toLowerCase().includes(query.toLowerCase()))).toArray();
	}
	try{
		shownote(result[0].id)
		console.log(result)
		document.querySelector(".notetree").innerHTML = ""
		recurseAndBuild((await buildNoteTree(result)), document.querySelector(".notetree"))
		

	}
	catch{	}
}
document.querySelector("#search").addEventListener("keyup", (ev)=>{
	if(ev.key == "Enter" && document.querySelector("#search").value.startsWith(":js:")){
		searchNotes(document.querySelector("#search").value)
	}
	else if(!document.querySelector("#search").value.startsWith(":js:")){
		searchNotes(document.querySelector("#search").value)
	}
})


