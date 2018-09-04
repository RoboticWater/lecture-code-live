addFile(path, curNode, file) {
  	if (path.length === 1) {
  		curNode.children.push(file);
  		return;
  	}
  	let folderFound = false;
  	curNode.children.forEach(dir => {
  		if (dir.name === path[0]) {
  			this.addFile(path.slice(1), dir, file);
  			folderFound = true;
  		}
  	});
  	if (folderFound)
  		return;
  	let newNode = {
  		name: path[0],
  		children: []
  	}
  	curNode.children.splice(0, 0, newNode);
  	this.addFile(path.slice(1), newNode, file);
  }