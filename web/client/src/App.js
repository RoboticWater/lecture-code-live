import React, { Component } from 'react';
import axios from 'axios';
import nprogress from 'nprogress'
import { TreeRoot } from './TreeView'
import Websocket from 'react-websocket';

import 'nprogress/nprogress.css'
import './App.css';

import SyntaxHighlighter from 'react-syntax-highlighter';
import theme from './theme';

class App extends Component {

	ws;
	state = {
		files: {children: []},
		tab_size: 2,
		cur_file: '',
	}

	componentDidMount() {
		this.ws = new WebSocket('ws://localhost:40510');
		this.getFiles()

    // event emmited when connected
    this.ws.onopen = function () {
        console.log('websocket is connected ...')
        // sending a send event to websocket server
        this.ws.send('[socket] client connected')
    }.bind(this);
    // event emmited when receiving message 
    this.ws.onmessage = function (ev) {
    	this.getFiles()
      if (this.state.cur_filename === ev.data) {
      	axios.get('/files/' + ev.data)
      		.then(res => {
      			this.setState({cur_file: res.data, cur_filename: ev.data }, () => {
      			})
      		})
      		.catch(e => console.log(e));
      }
    }.bind(this);
	}

	getFiles() {
		axios.get('/files')
			.then(res => {
				this.state.files = {children: []};
				res.data.forEach(file => {
					this.parseFile(file.metadata.path, file);
				})
			})
			.catch(e => console.log(e));
	}

  parseFile(path, data) {
  	let split_path = path.replace('./', '').split('\\');
  	let file = {
  		name: split_path.slice(-1)[0],
  		filename: data.filename
  	}
  	let newFiles = Object.assign({}, this.state.files);
  	newFiles.name = split_path[0];

  	this.addFile(split_path.slice(1), newFiles, file);
  	this.setState({ files: newFiles });
  }

  addFile(path, curNode, file) {
  	if (path.length === 1) {
  		curNode.children.push(file);
  		return;
  	}
  	let folderFound = false;
  	curNode.children.forEach(dir => {
  		console.log(dir.name === path[0], dir.name, path[0])
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

  onNodeClick(filename, name) {
  	if (!filename)
  		return;
  	else {
  		nprogress.start()
  		axios.get('/files/' + filename)
  			.then(res => {
  				this.setState({cur_file: res.data, cur_title: name, cur_filename: filename }, () => {
  					nprogress.done()
  				})
  			})
  			.catch(e => console.log(e));
  	}
  }

	render() {
		return (
			<div className="App">
				<div className="topbar">
					<div className="logo"></div>
					<h1 className="filename">{this.state.cur_title}</h1>
					<div className="options">
						<div className="option tab-size">
							<span className="option__tag">tab size: </span>
							<input 
								id="number"
								type="number"
								value={this.state.tab_size}
								onChange={e => this.setState({ tab_size: e.target.value })}/>
						</div>
					</div>
				</div>
				<div className="content">
					<div className="sidebar">
						<TreeRoot children={this.state.files.children} onClick={this.onNodeClick.bind(this)} />
	        </div>
					<div className="file" style={{'tabSize': String(this.state.tab_size)}}>
				    <SyntaxHighlighter language='html' showLineNumbers style={theme}>{this.state.cur_file}</SyntaxHighlighter>
					</div>
					</div>
			</div>
		);
	}
}

export default App;