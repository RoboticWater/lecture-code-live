import React, { Component } from 'react';
import SmoothCollapse from 'react-smooth-collapse';
import classNames from 'classnames';
import './TreeView.css'

export class TreeRoot extends Component {
	render() {
		return (
			<ul className="TreeRoot">{this.props.children.map((node, index) =>
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
			this.props.onClick(this.props.filename, this.props.name);
		if (this.props.children && this.props.children.length > 0)
		this.setState({ expanded: !this.state.expanded })
	}

	render() {
		const hasChildren = this.props.children && this.props.children.length > 0;
		return (
			<li className={classNames("TreeNode", {expanded: this.state.expanded})}>
				<span className="node__content" onClick={this.expand.bind(this)}>
					<span className={classNames("node__expand", {visible: hasChildren})}></span>
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