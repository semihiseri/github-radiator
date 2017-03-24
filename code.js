
var address = 'https://api.github.com/repos/semihiseri/github-radiator/contents/projects'

// Source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

function componentToHex(c)
{
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex)
{
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function inverseColor(color)
{
	var rgb = hexToRgb(color);
	rgb.r = 255 - rgb.r;
	rgb.g = 255 - rgb.g;
	rgb.b = 255 - rgb.b;
	return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function mixColors(main, second, ratio) // ratio is the ratio of second/main. So, blue, black 0.1 is slightly darker blue. But it's still blue.
{
	var mainrgb = hexToRgb(main);
	var secondrgb = hexToRgb(second);
	var newrgb = hexToRgb("#000000");

	newrgb.r = Math.floor(mainrgb.r*(1-ratio) + secondrgb.r*ratio);
	newrgb.g = Math.floor(mainrgb.g*(1-ratio) + secondrgb.g*ratio);
	newrgb.b = Math.floor(mainrgb.b*(1-ratio) + secondrgb.b*ratio);

	return rgbToHex(newrgb.r, newrgb.g, newrgb.b);
}

function getjson(addr)
{
  var myArr;
	var request = new XMLHttpRequest();
	request.open("GET", addr, false);
	request.send();
	myArr = JSON.parse(request.responseText);
	return myArr;
}

function timeSinceLastCommit(obj)
{
	var addr = obj.github
	var baseaddr = addr.slice(addr.search("github.com")+11);
	var lastaddr = "https://api.github.com/repos/" + baseaddr + "/commits/master";
	var last = getjson(lastaddr);

	return (new Date() - new Date(last.commit.committer.date));
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

	projectsList.sort(function(a, b){return timeSinceLastCommit(a) - timeSinceLastCommit(b)})

	var proj = document.getElementById("projects");
	while (proj.firstChild) {
		proj.removeChild(proj.firstChild);
	}	

	for (var x=0; x<projectsList.length; x++)
	{
		var newdiv = document.createElement("div");
		newdiv.setAttribute("class", "projectcard");
		var given = projectsList[x].color;
		var base = mixColors(given, inverseColor(given), 0.2); // mix with its inverse
		var bkg = mixColors(base, "#FFFFFF", 0.7); // mix with white
		var text = mixColors(base, "#000000", 0.8); // mix with black
		newdiv.style.backgroundColor = bkg;
		newdiv.style.color = text;
		var stats = getStats(projectsList[x].github);

		var namediv = document.createElement("div");
		namediv.setAttribute("class", "projectname");
		namediv.innerHTML = projectsList[x].projectname;
		newdiv.appendChild(namediv);

		var statsdiv = document.createElement("div");
		statsdiv.setAttribute("class", "projectstats");

		var monthdiv = document.createElement("div");
		monthdiv.setAttribute("class", "hasvline");
		monthdiv.innerHTML = stats[0];
		statsdiv.appendChild(monthdiv);

		var weekdiv = document.createElement("div");
		weekdiv.setAttribute("class", "hasvline");
		weekdiv.innerHTML = stats[1];
		statsdiv.appendChild(weekdiv);


		var daydiv = document.createElement("div");
		daydiv.setAttribute("class", "daystat");
		daydiv.innerHTML = stats[2];
		statsdiv.appendChild(daydiv);

		var lastcommit = document.createElement("div");
		lastcommit.setAttribute("class", "lastcommit");
		lastcommit.innerHTML = stats[3];
		statsdiv.appendChild(lastcommit);

		newdiv.appendChild(statsdiv);

		document.getElementById("projects").appendChild(newdiv);
	}
}

setInterval(update,13215); // some randomness :P
