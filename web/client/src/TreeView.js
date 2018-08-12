import React, { Component } from 'react';
import SmoothCollapse from 'react-smooth-collapse';
import './TreeView.css'

export class TreeRoot extends Component {
	render() {
		return (
			<ul className="TreeRoot">{this.props.root.children.map((node, index) =>
				<TreeNode key={index} {...node} onClick={this.props.onClick}/>)}</ul>
		)
	}
}

export class TreeNode extends Component {
	state = {
		expanded: false
	}

	expand() {
		if (this.props.onClick)
			this.props.onClick(this.props.filename);
		this.setState({ expanded: !this.state.expanded })
	}

	render() {
		const hasChildren = this.props.children && this.props.children.length > 0;
		return (
			<li className="TreeNode">
				<span className="node__content" onClick={this.expand.bind(this)}>
					{hasChildren &&  <span className="node__expand"></span>}
					<span className="node__name">{this.props.name}</span>
				</span>
				{hasChildren && 
					<SmoothCollapse expanded={this.state.expanded}>
						<ul className="node__children">
							{this.props.children.map((node, index) =>
								<TreeNode key={index} {...node} onClick={this.props.onClick}/>)}
						</ul>
					</SmoothCollapse>
				}
			</li>
		)
	}
}