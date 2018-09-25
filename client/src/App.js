import React, { Component } from 'react';
import axios from 'axios';
import nprogress from 'nprogress'
import { TreeRoot } from './TreeView'
// import Websocket from 'react-websocket';
import io from 'socket.io-client';

import 'nprogress/nprogress.css'
import './App.css';

import SyntaxHighlighter from 'react-syntax-highlighter';
import theme from './theme';

const extensionMap = {
  'py': 'python',
  'txt': 'text',
  'html': 'html',
  'css': 'css',
  'js': 'javascript',
}

class App extends Component {

	// ws;
	state = {
		files: {children: []},
		tab_size: 2,
		cur_file: '',
	}

	componentDidMount() {
    var HOST = window.location.origin.replace(/^http/, 'ws')
    const socket = io(window.location.origin);
		// this.ws = new WebSocket(HOST);
		this.getFiles()
    socket.on('connected', () => console.log("Connected"));
    socket.on('fileupdate', filename => {
      console.log('fileupdate');
      this.getFiles()
      if (this.state.cur_filename === filename) {
        axios.get('/api/files/' + filename)
          .then(res => {
            this.setState({cur_file: res.data, cur_filename: filename }, () => {
            })
          })
          .catch(e => console.log(e));
      }
    });
    // this.ws.onopen = function () {
    //     console.log('[socket] connected to server')
    //     this.ws.send('[socket] client connected')
    // }.bind(this);
    // this.ws.onmessage = function (ev) {
    // 	this.getFiles()
    //   if (this.state.cur_filename === ev.data) {
    //   	axios.get('/api/files/' + ev.data)
    //   		.then(res => {
    //   			this.setState({cur_file: res.data, cur_filename: ev.data }, () => {
    //   			})
    //   		})
    //   		.catch(e => console.log(e));
    //   }
    // }.bind(this);
	}

	getFiles() {
		axios.get('/api/files')
			.then(res => {
				this.state.files = {children: []};
				res.data.forEach(file => {
					this.parseFile(file.metadata.path, file);
				})
			})
			.catch(e => console.log(e));
	}

  parseFile(path, data) {
  	let split_path = path.replace('./', '').replace('\\', '/').split('/');
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
  		axios.get('/api/files/' + filename)
  			.then(res => {
  				this.setState({cur_file: res.data, cur_title: name, cur_filename: filename }, () => {
  					nprogress.done()
  				})
  			})
  			.catch(e => console.log(e));
  	}
  }

  parseExtension(filename) {
    if (!filename)
      return 'text';
    return extensionMap[filename.split('.').slice(-1).pop()]
  }

	render() {
		return (
			<div className="App">
        <div className="sidebar">
            {/*<div className="logo"></div>*/}
          <TreeRoot children={this.state.files.children} onClick={this.onNodeClick.bind(this)} />
        </div>
				<div className="content">
          <div className="topbar">
            <h1 className="filename">{this.state.cur_title}</h1>
            <div className="options">
              <div className="option">
                <div className="option__content">
                  <span className="option__tag">tab size: </span>
                  <select
                    className="option__input"
                    onChange={e => this.setState({ tab_size: e.target.value })}
                    value={this.state.tab_size}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
					<div className="file" style={{'tabSize': String(this.state.tab_size)}} customstyles={{width: '100%'}}>
				    <SyntaxHighlighter
              language={this.parseExtension(this.state.cur_filename)}
              showLineNumbers
              style={theme}>{this.state.cur_file}</SyntaxHighlighter>
					</div>
					</div>
			</div>
		);
	}
}

export default App;