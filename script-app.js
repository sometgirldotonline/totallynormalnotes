setTimeout(()=>{document.querySelector(".splash").style.opacity=1},1)
setTimeout(()=>{document.querySelector(".splash").style.opacity=0},1000)
setTimeout(()=>{document.querySelector(".app").style.opacity=1},900)
setTimeout(()=>{document.querySelector(".splash").remove()},1200)

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
	editor = document.querySelector("#note-plaintext")
	title = document.querySelector("#note-title")
	note = await db.notes.get(id)
	editor.value = note.content || ""
	title.value = note.title || "Untitled Note"
	editor.readOnly = false
	document.title = `Notes - ${note.title}`
	window.location.hash = id
	editor.onkeyup = () => {
		db.notes.update(id, {content: editor.value})
	}
	editor.oninput = () => {
		if(Math.floor(Math.random() * 5) + 1 === 1 && editor.value.length > 0){
			const lastChar = editor.value[editor.value.length - 1]
			const newChar = randomReplace(lastChar, false) || lastChar
			editor.value = editor.value.slice(0, -1) + newChar
		}
		if(Math.floor(Math.random() * 50) + 1 === 1 && editor.value.length > 0){
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
    for (const fmt of Object.keys(headings)) {
      if (line.startsWith(fmt)) {
        line = `<${headings[fmt]}>${line.slice(fmt.length).trim()}</${headings[fmt]}>`;
        break;
      }
    }

    // inline formatting
    for (const [regex, tag] of wrappers) {
      line = line.replace(regex, `<${tag}>$1</${tag}>`);
    }

    html += line + "\n";
  }

  console.log(html);
  return html;
}
