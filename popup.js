document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("downloadBookmarks").addEventListener("click", async () => {
       let booktree= await chrome.bookmarks.getTree();
	   let bookmarklinks=[];
	   jsonIterator(booktree,bookmarklinks);
	   createcsv(bookmarklinks);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("backupBookmarks").addEventListener("click", () => {
    alert("clicked");
  });
});

function jsonIterator(obj,bookmarklinks){
	for(let k in obj){
		if(typeof obj[k] === 'object'){
			
			if(Object.keys(obj[k]).includes('url')){
				bookmarklinks.push(obj[k]);
				continue;
			}
			jsonIterator(obj[k],bookmarklinks);
			
		}
		
	}
}

function createcsv(obj){
	csvRows="";
	if(Array.isArray(obj) && obj.length>0){
		const headers=['title','url'];
		csvRows+=headers.join(";");
		csvRows+='\n';
		for(let k in obj){
			const values= [obj[k]['title'],obj[k]['url']].join(";");
			csvRows+=values;
			csvRows+='\n';
			
		}
		const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'bookmarks.csv';
		a.click();
	}else{
		alert('You dont have any bookmarks');
	}
}