
var address = 'https://api.github.com/repos/semihiseri/github-radiator/contents/projects'

function getjson(addr)
{
  var myArr;
	var request = new XMLHttpRequest();
	request.open("GET", addr, false);
	request.send();
	myArr = JSON.parse(request.responseText);
	return myArr;
}

function getStats(addr)
{
	
//	var baseaddr =
//	var weeklyaddr = addr
}

function update()
{
	var projects = getjson(address);
	var projectsList = [];
	for (var x=0; x<projects.length; x++)
	{
		projectsList[projectsList.length] = getjson(projects[x].download_url);
	}

	// array sort will come here

	var proj = document.getElementById("projects");
	while (proj.firstChild) {
		proj.removeChild(proj.firstChild);
	}	

	for (var x=0; x<projectsList.length; x++)
	{
		var newdiv = document.createElement("div");
		newdiv.innerHTML = projectsList[x].projectname + "\t" + projectsList[x].github + "\t" + projectsList[x].color;
		document.getElementById("projects").appendChild(newdiv);
	}
}

setInterval(update,10000);
