import React from 'react';
import PropTypes from 'prop-types';
import CustomTable from './index';
import Column from './Column';
// import Loader from '../../components/Loader';

class TableLoader extends React.Component {
  /**
   * Generate columns for Table
   * @param customCols
   * @returns {Array}
   */
  generateDynamicColumns = customCols => {
    const cols = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const customCol of customCols) {
      let col = new Column()
        .withLabel(customCol.label)
        .withDataKey(customCol.dataKey);
      if (customCol.width) {
        col = col.withWidth(customCol.width);
      }
      if (customCol.cellRenderer) {
        col = col.withCellRenderer(customCol.cellRenderer);
      }
      if (customCol.cellDataGetter) {
        col = col.withCellDataGetter(customCol.cellDataGetter);
      }
      if (customCol.style) {
        col = col.withStyle(customCol.style);
      }
      cols.push(col);
    }
    return cols;
  };

  render() {
    const { loading, tableColumns } = this.props;
    // if (loading) {
    //   return (
    //     <Loader loading={loading} />
    //   );
    // }
    return (
      <CustomTable
        loading={loading}
        cols={this.generateDynamicColumns(tableColumns)}
        {...this.props}
      />
    );
  }
}


TableLoader.propTypes = {
  loading: PropTypes.bool.isRequired,
  tableColumns: PropTypes.array.isRequired,
  rowClassName: PropTypes.string,
};

TableLoader.defaultProps = {
  rowClassName: '',
};
export default TableLoader;
