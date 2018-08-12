import React, { Component } from 'react';
import axios from 'axios';
import nprogress from 'nprogress'
import { TreeRoot } from './TreeView'

import 'nprogress/nprogress.css'
import './App.css';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/styles/hljs';

class App extends Component {
	state = {
		files: {
			name: '',
			toggled: true,
			children: []
		},
		tab_size: 3,
		cur_file: '',
	}

	componentDidMount() {
		axios.get('/files')
			.then(res => {
				res.data.forEach(file => {
					this.parseFile(file.metadata.path, file);
				})
			})
			.catch(e => console.log(e));

		// axios.get('/88a578e53bf8ad72b9173dd6be4094d9.html')
		// 	.then(res => {
		// 		this.setState({cur_file: res.data})
		// 	})
		// 	.catch(e => console.log(e));
	}

  onToggle(node, toggled) {
    if(this.state.cursor)
    	this.state.cursor.active = false;
    node.active = true;
    if(node.children)
    	node.toggled = toggled;
    else {
    	nprogress.start()
    	axios.get('/' + node.filename)
    		.then(res => {
    			this.setState({cur_file: res.data, cur_filehash: node.filename}, () => {
    				nprogress.done()
    			})
    		})
    		.catch(e => console.log(e));
    }
    this.setState({ cursor: node });
  }

  parseFile(path, data) {
  	let split_path = path.replace('./', '').split('\\');
  	let file = {
  		name: split_path.slice(-1)[0],
  		filename: data.filename
  	}
  	let newFiles = Object.assign({}, this.state.files);
  	newFiles.name = split_path[0];
  	this.addFile(split_path.slice(1), newFiles, file)
  	this.setState({ files: newFiles });
  }

  addFile(path, curNode, file) {
  	if (path.length === 1) {
  		curNode.children.push(file);
  		return;
  	}
  	curNode.children.forEach(dir => {
  		if (dir.name === path[0]) {
  			this.addFile(path.slice(1), dir, file);
  			return;
  		}
  	});
  	let newNode = {
  		name: path[0],
  		children: []
  	}
  	curNode.children.push(newNode);
  	this.addFile(path.slice(1), newNode, file);
  }

  onNodeClick(filename) {
  	if (!filename)
  		return;
  	else {
  		nprogress.start()
  		axios.get('/' + filename)
  			.then(res => {
  				this.setState({cur_file: res.data}, () => {
  					nprogress.done()
  				})
  			})
  			.catch(e => console.log(e));
  	}
  }

	render() {
		return (
			<div className="App">
				<div className="sidebar">
					<TreeRoot root={this.state.files} onClick={this.onNodeClick.bind(this)} />
        </div>
				<div className="content" style={{'tabSize': String(this.state.tab_size)}}>
			    <SyntaxHighlighter language='html' showLineNumbers style={gruvboxDark}>{this.state.cur_file}</SyntaxHighlighter>
				</div>
			</div>
		);
	}
}

export default App;

// <Treebeard
//             data={this.state.files}
//             onToggle={this.onToggle.bind(this)}
//             style={treeStyle}
//             animations={{
//             	toggle: ({node: {toggled}}) => ({
//           	    animation: {rotateZ: toggled ? 90 : 0},
//           	    duration: 300,
//       	        easing: [.55,.09,.17,.95]
//             	}),
//             	drawer: (/* props */) => ({
//           	    enter: {
//         	        animation: 'slideDown',
//         	        duration: 300,
//         	        easing: [.55,.09,.17,.95]
//           	    },
//           	    leave: {
//         	        animation: 'slideUp',
//         	        duration: 300,
//         	        easing: [.55,.09,.17,.95]
//           	    }
//             	})
//             }}
// 	        />