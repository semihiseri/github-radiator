
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

function getStats(addr) // returns number of counts [lastmonth, lastweek, lastday, timesincelastcommit]
{
	// FIXME: Maybe it would be better if I make an object and some children instead of using an array
	// FIXME: Add some try-catch thingy here in case some config file gets corrupted somehow

	var output = []
	var baseaddr = addr.slice(addr.search("github.com")+11);
	var weeklyaddr = "https://api.github.com/repos/" + baseaddr + "/stats/commit_activity";
	var weekly = getjson(weeklyaddr);
	var lastaddr = "https://api.github.com/repos/" + baseaddr + "/commits/master";
	var last = getjson(lastaddr);

	output[output.length] = weekly[weekly.length-4].total + weekly[weekly.length-3].total + weekly[weekly.length-2].total + weekly[weekly.length-1].total; // last 4 weeks = last month
	output[output.length] = weekly[weekly.length-1].total; // last week

	var today = new Date();
	output[output.length] = weekly[weekly.length-1].days[today.getDay()]; // last day

	var difference = today - new Date(last.commit.committer.date);

	difference /= 1000; // in seconds

	if (difference/(60*60*24*30) > 1)
	{
		difference /= 60*60*24*30;
		difference = Math.floor(difference);
		difference += " months ago";
	}	
	else if (difference/(60*60*24) > 1)
	{
		difference /= 60*60*24;
		difference = Math.floor(difference);
		difference += " days ago";
	}
	else if (difference/(60*60) > 1)
	{
		difference /= 60*60;
		difference = Math.floor(difference);
		difference += " hours ago";
	}
	else if (difference/60 > 1)
	{
		difference /= 60;
		difference = Math.floor(difference);
		difference += " minutes ago";
	}
	else
	{
		difference = Math.floor(difference);
		difference += " seconds ago";
	}

	output[output.length] = difference; 

//	output[output.length] = last.commit.author.name;
//	output[output.length] = last.commit.message;

	return output;
}

function update()
{
	var projects = getjson(address);
	var projectsList = [];
	for (var x=0; x<projects.length; x++)
	{
		var project = getjson(projects[x].download_url);
		projectsList[projectsList.length] = project;
	}

	// array sort will come here

	var proj = document.getElementById("projects");
	while (proj.firstChild) {
		proj.removeChild(proj.firstChild);
	}	

	for (var x=0; x<projectsList.length; x++)
	{
		var newdiv = document.createElement("div");
		var stats = getStats(projectsList[x].github);
		newdiv.innerHTML = projectsList[x].projectname + "\t" + projectsList[x].color + "\t" + stats[0] + "\t" + stats[1] + "\t" + stats[2] + "\t" + stats[3];
		document.getElementById("projects").appendChild(newdiv);
	}
}

setInterval(update,10000);
