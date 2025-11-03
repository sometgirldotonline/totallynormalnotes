function cte(){
	orisit = new Audio("./orisit.mp3")
	orisit.play()
	orisit.onplaying = ()=>{
	document.querySelector(".splash").style.opacity=0
	document.querySelector(".orisit").style.opacity = 1
	setTimeout(()=>{
		document.querySelector(".splash").remove()
	},200)
	document.querySelector(".orisit").style.display = "flex"
	additivedelay = 0
	it = [
		{class:"oii1",
			stamp: 0},
		{class:"oii2",
			stamp: 2800},
			{class:"oii3",
			stamp: 1500},
			{class:"oii4",
			stamp: 1500},
			{class:"oii5",
			half:true,
			stamp: 1700},
			{class:"oii5",
			half:false,
			stamp: 400},
	]
	it.forEach(item=>{
		additivedelay += item.stamp
		setTimeout(()=>{
			el = document.querySelector(`.${item.class}`)
			if(item.half){
			    el.style.height = (el.scrollHeight / 2) + "px";
			} else {
			    el.style.height = el.scrollHeight + "px";
			}
			console.log(`Completed: ${item.class} ${item.stamp}(${additivedelay})`)
		}, additivedelay)
		console.log(`Queued: ${item.class} ${item.stamp}(${additivedelay})`)
	})}
}

function enter(){
	document.querySelector(".orisit").style.opacity=0
	setTimeout(()=>{
		window.location.href = "/app.html"
	},100)
}
