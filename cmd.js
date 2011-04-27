var http = require('http');
var wwwforms = require("./www-forms");
var sys = require("sys");

var bingDone;
var googleDone;
var yahooDone;

var XMLHttpRequest = require("./XMLHttpRequest").XMLHttpRequest;

var YahooSearchAPIKey = "I.sBOQzV34HSifLdETL44KtQgMx8umhqYo.Pdzc_2ex4fSP7eMd5Ndc1rz_dn.c6sA--";
var numYahooSearchResults = 8; //maximum is 100

var GoogleSearchAPIKey = "ABQIAAAAWIEtTgzDMl9txq3HBCPj0RT2yXp_ZAY8_ufC3CFXhHIE1NvwkxR68530jlFSGTko3i0JyyH6WyqUjw";
var numGoogleResults = 8 // maximum is 8.

var BingSearchAPIKey = "F6105BE68C1C75A2273CC6E4EA7AAA9DD9AAB539";
var numBingResults= 8; //maximum is 50

function trim(str) 
{
  res =str.replace(/^\s+|\s+$/g,"");
  return res;
}


function fetchSearchResults(query)
{
        query = query.toString();
	query = processQuery(query);
	if (query.length == 0)
		return 0;
	var bing = new XMLHttpRequest();
	var google = new XMLHttpRequest(); 
	var yahoo = new XMLHttpRequest(); 
	
	
	yahoo.onreadystatechange = function() {
		if (this.readyState == 4) 
		{
			getYahooSearchResults(this.responseText);
			yahooDone();
		}
	};
	

	bing.onreadystatechange = function() {	
		if (this.readyState == 4) 
		{
			getBingSearchResults(this.responseText);
			bingDone();
		}
	};

	google.onreadystatechange = function() {
		if (this.readyState == 4) 
		{
			getGoogleSearchResults(this.responseText);
			googleDone();
		}
	};
	
	
	try {
		 var yahoourl = "http://search.yahooapis.com/WebSearchService/V1/webSearch?appid="+YahooSearchAPIKey+"&query="+query+"&results="+numYahooSearchResults+"&output=json";
 		yahoo.open("GET",yahoourl);
		yahoo.send();
	}
	catch (exc)
	{
	     p("Problem fetching Yahoo results.");
	}
	
	
	try 
	{
		var googleurl = "https://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q="+query+"&key="+GoogleSearchAPIKey;
 		google.open("GET",googleurl);
		google.send();
	}
	catch (exc)
	{
	     p("Problem fetching Google results.");
	}

	try {
		var bingurl = "http://api.bing.net/json.aspx?AppId="+BingSearchAPIKey+"&Version=2.2&Market=en-US&Query="+query+"&Sources=web+spell&Web.Count="+numBingResults;
	       bing.open("GET",bingurl);
	       bing.send();
       	}
	catch (exc)
	{
	     p("Problem fetching Yahoo results.");
	}
       return true;
       
      
}

function processQuery (query)
{
    query = trim(query);  // remove surrounding slashes and carriage returns
    query = escape(query);// url encode it.
    query = query.replace(/%20/g,"+"); //replace %20 with + 
    return query;
}

function checkWhetherValidBingResults(text)
{
 
    try {
        data = JSON.parse(text);
    }
    catch (excp)
    {
       return false;
    }
    
    if (typeof data['SearchResponse'] === 'undefined')
	return false;
   return data;
}


function getBingSearchResults(text)
{  
    var data;
    if (!(data = checkWhetherValidBingResults(text)))
    {
         p("The bing unreachable or returned non-JSON data.");
         return false;
    }
    else
    {

        var results = new Array();
        var item;
	var index;
	var arrayItem;
	if (typeof data['SearchResponse']['Web'] != 'undefined')
        for (var i in data['SearchResponse']['Web']['Results'])
        {
             index = parseInt(i)+1;
             item = data['SearchResponse']['Web']['Results'][i];
	     arrayItem = [item['Title'],item['Url']];
	     results.push(arrayItem);
        }
	renderSearchResults(results,"Bing");
    }
}


function checkWehtherValidYahooResults(text)
{
    var data;
    try {
        data=JSON.parse(text);
    }
    catch (excp)
    {
    	return false;
    }
    
   if (typeof data['ResultSet'] === 'undefined')
	return false;
   
   if (typeof data['ResultSet']['Result'] === 'undefined')
	return false;

   return data;
}

function getYahooSearchResults(text)
{
    var data;
    if (!(data = checkWehtherValidYahooResults(text)))
    {
         p("Yahoo's server is unreachable or has returned non-JSON data.");
         return false;
    }
    else
    {
        var results = new Array();
        var item;
        var index;
        var arrayItem;
        for (var i in data['ResultSet']['Result'])
        {
             index = parseInt(i)+1;
             item = data['ResultSet']['Result'][i];
	     arrayItem = [item['Title'],item['DisplayUrl']];
		results.push(arrayItem);
        }
	renderSearchResults(results,"Yahoo");
    }
}


function checkWhetherValidGoogleResults(text)
{
 
    try {
        data = JSON.parse(text);
    }
    catch (excp)
    {
       return false;
    }

    if (typeof data['responseData'] == 'undefined')
	return false;

    return data;
}

/*
The google search web api has a limit of the number of search results returned at a time. The maximum
number of search results returned is 8 at max. Minimum is 4. 
*/
function getGoogleSearchResults(text)
{
    var data;
    if (!(data = checkWhetherValidGoogleResults(text)))
    {
    	 p("Google's servers were unreachable or returned non-JSON information.");

         return false;
    }
    else
    {
        var results = new Array();
        var item;
        var arrayItem;
        var index;
        for (var i in data['responseData']['results'])
        {
             index = parseInt(i)+1;
             item = data['responseData']['results'][i];
	     arrayItem = [item['titleNoFormatting'],item['unescapedUrl']];
	     results.push(arrayItem);
        }
	renderSearchResults(results,"Google");
    }
}


function renderSearchResults(data,engineName)
{


    if (data.length == 0 )
    {
        p(engineName+" returned 0 results.");
        return 0;
    }
    
    p("<br>==================="+engineName+" Search Results===================<br>");
    

    for (var i in data)
    {
        index = parseInt(i)+1;
        p(index+". "+ data[i][0]);
	p(data[i][1]+"<br>");
    }

}

//start();


var p;



/**************************Server *********************/



http.createServer(function (req, res) {
	
	
	p = function (s) {
	   res.write(s);
	}
	var bingSuccess=false;
	var googleSuccess=false;
	var yahooSuccess=false;
	res.writeHead(200, {'Content-Type': 'text/html'});
	var query="";
	var ele = wwwforms.decodeForm(req.url);
	for (var i in ele)
	{
	    if (i == '/?q')
	    {
	    	query = ele[i];
	    }
	}
	
	bingDone = function () {

	    bingSuccess=true;
	}
	
	googleDone = function() {
	    googleSuccess = true;

	}
	
	yahooDone = function() {
	    yahooSuccess = true;
	}
	
	showForm(res);	
	if (!fetchSearchResults(query))
	{
	  res.end();
	}

	checker = setInterval( function() {
	     if (bingSuccess && yahooSuccess && googleSuccess)
	     {
	        clearInterval(checker);
	     	res.end();
	     }
	},2000); //if all three servers have responded, then end the request 
	
	
	setTimeout( function () {
	     res.end();	
	}, 5000);
	
	
}).listen(8080);

function showForm(res)
{
    res.write('<form action="/" method="get"> \
    Search Query: <input type="text" name="q" /> \
    <input type="submit" value="Go!"> \
    </form>');
}

console.log("Server started at http://localhost:8080/");
