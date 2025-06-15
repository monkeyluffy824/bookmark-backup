document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("downloadBookmarks").addEventListener("click", async () => {
       let booktree= await chrome.bookmarks.getTree();
	   let bookmarklinks=[];
	   jsonIterator(booktree,bookmarklinks);
	   createcsv(bookmarklinks);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileUpload").addEventListener("change", async () => {
		const input = document.getElementById('fileUpload');
		const file = input.files[0];

		if (!file) {
			alert("No file selected");
			return;
		}
		
		const reader = new FileReader();
		 reader.onload = function(event) {
				const fileContent = event.target.result;
				processFileContent(fileContent);
		};

    reader.onerror = function() {
        console.error("File reading error:", reader.error);
    };

    reader.readAsText(file);
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


async function processFileContent(content) {
	let tex=content.toString();
	let rows=tex.split('\n');
	if(rows[0]==='title;url'){
		let id= await getBookmarksBarId();
		if(id!=null){
			for(let i=1;i<rows.length;i++){
			let dat=rows[i].split(';');
			if(dat.length===2){
				let bookObj={
				'parentId':id,
				'title':dat[0],
				'url':dat[1],
				}
				chrome.bookmarks.create(bookObj);
			}
			
		}
		alert('The bookmarks created successfully;');
		}
		
	}else{
		alert('The incorrect file is uploaded');
		return;
	}
	
}

function getTreePromise() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree(resolve);
  });
}

async function getBookmarksBarId() {
  const tree = await getTreePromise();

  function findToolbar(node) {
    if (["Bookmarks Bar", "Bookmarks Toolbar", "Favorites bar"].includes(node.title)) {
      return node.id;
    }
    for (let child of node.children || []) {
      const result = findToolbar(child);
      if (result) return result;
    }
    return null;
  }

  return findToolbar(tree[0]);
}

