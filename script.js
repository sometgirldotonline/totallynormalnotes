function cte(){
	orisit = new Audio("./orisit.mp3")
	orisit.play()
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
			stamp: 8000-5800},
	]
	it.forEach(item=>{
		additivedelay += item.stamp
		setTimeout(()=>{
			document.querySelector(`.${item.class}`).style.height = "3ch"
			console.log(`Completed: ${item.class} ${item.stamp}(${additivedelay})`)
		}, additivedelay)
		console.log(`Queued: ${item.class} ${item.stamp}(${additivedelay})`)
	})
}

function enter(){
	document.querySelector(".orisit").style.opacity=0
	setTimeout(()=>{
		window.location.href = "/app.html"
	},200)
}