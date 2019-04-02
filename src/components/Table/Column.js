import React from 'react';

export default class Column {
  constructor() {
    this.label = '';
    this.width = 200;
    this.dataKey = '';
    this.cellDataGetter = ({ dataKey, rowData }) => rowData[dataKey];
    // eslint-disable-next-line react/prop-types
    this.cellRenderer = ({ cellData }) => <p>{ cellData || '-'}</p>;
    this.style = {};
  }

  withLabel(label) {
    this.label = label;
    return this;
  }

  withWidth(width) {
    this.width = width;
    return this;
  }

  withDataKey(dataKey) {
    this.dataKey = dataKey;
    return this;
  }

  withCellDataGetter(cellDataGetter) {
    this.cellDataGetter = cellDataGetter;
    return this;
  }

  withCellRenderer(cellRenderer) {
    this.cellRenderer = cellRenderer;
    return this;
  }

  withStyle(style) {
    this.style = style;
    return this;
  }
}
