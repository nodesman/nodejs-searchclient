var sys = require("sys");
var stdin = process.openStdin();
var query;
var XMLHttpRequest = require("./XMLHttpRequest").XMLHttpRequest;


function trim(str) 
{
  res =str.replace(/^\s+|\s+$/g,"");
  return res;
}


function fetchSearchResults()
{
   
	var bing = new XMLHttpRequest();
	var numBingResults= 8; //maximum is 50
	var google = new XMLHttpRequest();
        var numGoogleResults = 8 // maximum is 8.
	var yahoo = new XMLHttpRequest(); 
        var numYahooSearchResults = 8; //maximum is 100

	bing.onreadystatechange = function() {	
		if (this.readyState == 4) 
		{
			getBingSearchResults(this.responseText);
		}
	};

	google.onreadystatechange = function() {

		if (this.readyState == 4) 
		{
			getGoogleSearchResults(this.responseText);
		}
	};

	yahoo.onreadystatechange = function() {
		if (this.readyState == 4) 
		{
			getYahooSearchResults(this.responseText);
		}
	};
	var googleurl = "https://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q="+query+"&key=ABQIAAAAWIEtTgzDMl9txq3HBCPj0RT2yXp_ZAY8_ufC3CFXhHIE1NvwkxR68530jlFSGTko3i0JyyH6WyqUjw";
 	google.open("GET",googleurl);
	google.send();

	var yahoourl = "http://search.yahooapis.com/WebSearchService/V1/webSearch?appid=I.sBOQzV34HSifLdETL44KtQgMx8umhqYo.Pdzc_2ex4fSP7eMd5Ndc1rz_dn.c6sA--&query="+query+"&results="+numYahooSearchResults+"&output=json";
 	yahoo.open("GET",yahoourl);
	yahoo.send();


	var bingurl = "http://api.bing.net/json.aspx?AppId=F6105BE68C1C75A2273CC6E4EA7AAA9DD9AAB539&Version=2.2&Market=en-US&Query="+query+"&Sources=web+spell&Web.Count="+numBingResults;
       bing.open("GET",bingurl);
       bing.send();

}


sys.puts("Enter search query to search for: ");

function start()
{ 
  stdin.on('data', function(chunk) { 
    query = chunk.toString();
    
    query = trim(query);  // remove surrounding slashes and carriage returns
    if (query.length == 0)
    {
       sys.puts("No query entered. Please enter to query and try again:");
       return 0;
    }
    query = escape(query);// url encode it.
    query = query.replace(/%20/g,"+"); //replace %20 with + 
    sys.puts("Query Entered: "+query);
    fetchSearchResults();
  });
}


function checkWhetherValidBingResults(data)
{
    if (typeof data['SearchResponse'] === 'undefined')
	return false;
   if (typeof data['SearchResponse']['Web'] === 'undefined')
	return false;
   if (typeof data['SearchResponse']['Web']['Results'].length < 2)
	return false;
   return true;
}


function getBingSearchResults(text)
{
    var data = eval( "("+text+")");
    if (!checkWhetherValidBingResults(data))
    {
         sys.puts("The bing search results response is mangled.");
         return false;
    }
    else
    {
        var results = new Array();
        var item;
	var index;
	var arrayItem;
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


function checkWehtherValidYahooResults(data)
{
   if (typeof data['ResultSet'] === 'undefined')
	return false;
   
   if (typeof data['ResultSet']['Result'] === 'undefined')
	return false;

   if (data['ResultSet']['Result'].length < 2 )
   	return false;

   return true;
}

function getYahooSearchResults(text)
{
    var data = eval( "("+text+")");
    if (!checkWehtherValidYahooResults(data))
    {
         sys.puts("The yahoo search results response is mangled.");
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


function checkWhetherValidGoogleResults(data)
{

    if (typeof data['responseData'] == 'undefined')
	return false;

    return true;
}

/*
The google search web api has a limit of the number of search results returned at a time. The maximum
number of search results returned is 8 at max. Minimum is 4. 
*/
function getGoogleSearchResults(text)
{
    var data = eval( "("+text+")");
    if (!checkWhetherValidGoogleResults(data))
    {
         sys.puts("Google search result appears to be mangled.");
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
    p("==================="+engineName+" Search Results===================\n\n");

    for (var i in data)
    {
        index = parseInt(i)+1;
        p(index+". "+ data[i][0]);
	p(data[i][1]+"\r\n");
    }

}

start();





/**** debugging functions **************/

//the print_r() of javascript:

function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}


function p(s)
{
     sys.puts(s);
}
