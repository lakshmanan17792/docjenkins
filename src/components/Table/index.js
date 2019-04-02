import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { Col, Row } from 'react-bootstrap';
import 'react-virtualized/styles.css';
import styles from './Table.scss';
import Loader from '../../components/Loader';

export default class CustomGrid extends PureComponent {
  static propTypes = {
    list: PropTypes.array.isRequired,
    cols: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    rowHeight: PropTypes.any,
    rowClassName: PropTypes.string
  };

  static defaultProps = {
    rowHeight: 70,
    rowClassName: '',
    loading: true
  };

  /**
   * Render Table
   * @param cols
   */
  generateTable = cols => cols.map(this.generateColumn)

  /**
   * Render Column for Table component
   * @param columnInfo
   * @returns {*}
   */
  generateColumn = columnInfo => (
    <Column
      key={columnInfo.label}
      label={columnInfo.label}
      width={columnInfo.width}
      cellDataGetter={columnInfo.cellDataGetter}
      cellRenderer={columnInfo.cellRenderer}
      headerRenderer={this._headerRenderer}
      dataKey={columnInfo.dataKey}
      style={columnInfo.style}
    />
  );

  /**
   * Return Row Data
   * @param list
   * @param index
   * @private
   */
  _getDatum = (list, index) => list[index]

  _getRowHeight = ({ index }) => {
    const { list } = this.props;

    return this._getDatum(list, index).length;
  }

  _headerRenderer = ({ label }) => (
    <div>
      {label}
    </div>
  );

  /**
   * Render component for No rows in Table
   * @returns {*}
   * @private
   */
  _noRowsRenderer = () => {
    const { loading } = this.props;
    if (!loading) {
      return (
        <Col className={styles.no_results_found}>
          <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
          <Row className={`${styles.sub_head} m-0`}><div>No Job Opening found</div></Row>
          <Row className={`${styles.empty_message} m-0`}>
            {/* <div>Try again later</div> */}
          </Row>
        </Col>
      );
    }
    return <Loader loading />;
  }

  render() {
    const {
      rowHeight,
      cols,
    } = this.props;
    let height = (this.props.rowHeight * this.props.list.length);
    height = (height === 0) ? 500 : height;

    /**
   * Custom Row data getter
   * @param index
   * @returns {*}
   */
    const rowGetter = ({ index }) => this._getDatum(this.props.list, index);
    return (
      <div className="resizer">
        <AutoSizer
          defaultWidth={1000}
          disableHeight
        >
          {({ width }) => (
            <Table
              // ref="Table"
              height={height}
              width={width}
              rowHeight={rowHeight}
              rowGetter={rowGetter}
              rowCount={this.props.list.length}
              className="Table"
              noRowsRenderer={this._noRowsRenderer}
              rowClassName={this.props.rowClassName}
            >
              {this.generateTable(cols)}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }
}
