import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';
import 'antd/dist/antd.css';
// import './antd-tree.css';


const TreeNode = Tree.TreeNode;
export default class AclTree extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    expandAll: PropTypes.bool,
    collapseAll: PropTypes.bool,
    toggleExpandAll: PropTypes.func.isRequired,
    toggleCollapseAll: PropTypes.func.isRequired,
    treeData: PropTypes.array
  };

  static defaultProps = {
    expandAll: false,
    collapseAll: false,
    treeData: []
  };

  constructor(props) {
    super(props);
    this.state = {
      defaultExpandedKeys: [],
      expandedKeys: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const { expandAll, collapseAll, treeData } = nextProps;
    if (expandAll) {
      this.setState({
        defaultExpandedKeys: []
      }, () => {
        const expandAllKeys = this.getDefaultExpandedKeys(treeData);
        this.setState({
          expandedKeys: expandAllKeys
        }, () => {
          this.props.toggleExpandAll();
        });
      });
    }
    if (collapseAll) {
      this.setState({
        expandedKeys: []
      }, () => {
        this.props.toggleCollapseAll();
      });
    }
  }

  getDefaultExpandedKeys = data => {
    data.map(item => {
      if (item.childrens) {
        this.getDefaultExpandedKeys(item.childrens);
      }
      this.state.defaultExpandedKeys.push(item.displayName);
      return '';
    });
    return this.state.defaultExpandedKeys;
  };

  renderTreeNodes = data =>
    (data && data.map(item => {
      if (item.childrens) {
        return (
          <TreeNode title={item.displayName} key={item.displayName} dataRef={item}>
            {this.renderTreeNodes(item.childrens)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.displayName} key={item.displayName} dataRef={item} />;
    }));

  render() {
    const { onSelect, expandAll, treeData } = this.props;
    return (
      <div>
        <Tree
          showLine
          loadData={this.onLoadData}
          onSelect={onSelect}
          defaultExpandAll={expandAll}
          expandedKeys={this.state.expandedKeys}
          onExpand={keys => {
            this.setState({
              expandedKeys: keys
            });
          }}
        >
          {this.renderTreeNodes(treeData)}
        </Tree>
      </div>
    );
  }
}
