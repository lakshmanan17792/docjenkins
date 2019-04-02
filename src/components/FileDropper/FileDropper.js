import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { toastr } from 'react-redux-toastr';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Col, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import constant from '../../helpers/Constants';
import Loader from '../../components/Loader';
import styles from './FileDropper.scss';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const fileTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
export default class FileDropper extends Component {
  static propTypes = {
    uploadFile: PropTypes.func,
    fetching: PropTypes.bool,
    files: PropTypes.arrayOf(PropTypes.shape),
    deleteFile: PropTypes.func,
    openSlider: PropTypes.func,
  }

  static defaultProps = {
    uploadFile: null,
    files: null,
    fetching: false,
    deleteFile: null,
    openSlider: null,
    user: null
  }

  constructor(props) {
    super(props);
    this.handleOutsideDropdownClick = this.handleOutsideDropdownClick.bind(this);
    this.state = {
      dragOver: false,
      openModal: false,
      showDropDown: false,
      selectedId: [],
      file: null,
      openDropdown: false,
      deleteOrDownloadEnabled: false
    };
  }

  componentWillMount() {
    this.authToken = localStorage ? localStorage.getItem('authToken') : null;
    const permissions = [
      { operation: 'DELETE', model: 'document' },
      { operation: 'DOWNLOAD_DOCUMENT', model: 'document' },
      { operation: 'DELETE_ME', model: 'document' }
    ];
    const deleteOrDownloadEnabled = NewPermissible.noOfPermissions(permissions);
    const isDeletePermitted = NewPermissible.isPermitted({ operation: 'DELETE', model: 'document' });
    const isDeleteMePermitted = NewPermissible.isPermitted({ operation: 'DELETE_ME', model: 'document' });
    this.setState({
      deleteOrDownloadEnabled: deleteOrDownloadEnabled.length > 0,
      isDeletePermitted,
      isDeleteMePermitted
    });
  }

  onSelectAll = (isSelected, rows) => {
    const ids = lodash.map(rows, 'id');
    if (isSelected) this.setState({ selectedId: ids });
    else this.setState({ selectedId: [] });
  }

  getDeletePermission = () => {
    const { isDeleteMePermitted, isDeletePermitted } = this.state;
    if (isDeleteMePermitted || isDeletePermitted) {
      return true;
    }
    return false;
  }


  getUnselectableKeys = files => {
    const { deleteOrDownloadEnabled } = this.state;
    const unselectableKeys = [];
    if (!deleteOrDownloadEnabled) {
      files.forEach(file => {
        unselectableKeys.push(file.id);
      });
    }
    return unselectableKeys;
  }

  handleDragOver = e => {
    e.preventDefault();
  }

  handleDrop = event => {
    event.preventDefault();
    this.uploadFile(event.dataTransfer.files[0]);
    this.setState({ dragOver: false });
  }

  uploadFile = file => {
    const formInput = new FormData();
    formInput.append('file', file);// event.dataTransfer.files[0]);
    this.setState({
      file
    });
    const type = file.name.replace(/^.*\./, '').toLowerCase();
    if (fileTypes.includes(type)) {
      if (file.size === 0) {
        toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.FILE_UPLOAD_ZERO_SIZE'));
      } if (file.size <= 26214400 && file.size !== 0) {
        this.props.uploadFile(formInput);
      } else {
        toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.FILE_UPLOAD_SIZE_ERROR'));
      }
    } else {
      toastrErrorHandling({}, i18n.t('ERROR'),
        `${i18n.t('errorMessage.FILE_UPLOAD_TYPE_ERROR')} ${i18n.t('errorMessage.FILE_TYPES')}`);
    }
  }

  handleDragEnter = () => {
    this.setState({ dragOver: true });
  }

  handleDragLeave = () => {
    this.setState({ dragOver: false });
  }

  handleFileSelect = event => {
    event.preventDefault();
    this.uploadFile(event.target.files[0]);
    event.target.value = '';
  }

  openSlider = (e, row) => {
    this.props.openSlider(row);
  }

  nameFormatter = (cell, row) =>
    (<div className={styles.text_wrap}>
      <NewPermissible
        operation={{ operation: 'VIEW_DOCUMENT', model: 'document' }}
        restrictedComponent={
          <i
            title={i18n.t('tooltipMessage.CLICK_TO_VIEW')}
            className={`fa fa-binoculars ${styles.viewIcon} p-l-15 p-r-15`}
            onClick={e => this.openSlider(e, row)}
            role="presentation"
          />
        }
        permittedComponent={<i
          className={`fa fa-binoculars ${styles.viewIcon} p-l-15 p-r-15`}
          role="presentation"
          style={{ cursor: 'auto' }}
        />
        }
      />
      <NewPermissible
        operation={{ operation: 'DOWNLOAD_DOCUMENT', model: 'document' }}
        restrictedComponent={
          <a
            title={i18n.t('tooltipMessage.CLICK_TO_DOWNLOAD')}
            target="_blank"
            className={styles.fileName}
            href={`${constant.fileDownLoad.downloadURL}${row.id}?access_token=${this.authToken}`}
          >{cell}</a>
        }
        permittedComponent={<a
          className={styles.fileName}
          style={{ cursor: 'auto' }}
        >{cell}</a>
        }
      />
    </div>)

  dateFormatter = cell => (
    <div style={{ color: '#545051' }}>
      {Moment(cell).format('DD MMM YYYY')}
      <span className={styles.timeFormat}>
        {Moment(cell).format('LT')}
      </span>
    </div>
  )

  handleSelectRow = (row, isSelected) => {
    this.setState({
      showDropDown: isSelected
    }, isSelected && this.setState({ selectedId: [...this.state.selectedId, row.id] }));
    const index = this.state.selectedId.indexOf(row.id);
    if (!isSelected) this.setState(prevState => ({ removed: [...prevState.selectedId.splice(index, 1)] }));
  }

  handleConfirmDelete = () => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_FILE'), {
      onOk: () => {
        this.props.deleteFile((this.state.selectedId), this.setState({ selectedId: [] }));
        this.toggleDropdown();
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  columnTitle = cell => cell

  sizeFormatter = cell => {
    if (cell < 1048576) {
      return `${(cell / 1024).toFixed(3)} kB`;
    }
    return `${(cell / 1048576).toFixed(1)} MB`;
  }

  handleOutsideDropdownClick() {
    this.toggleDropdown();
  }

  toggleDropdown = () => {
    this.setState(previousState => ({
      openDropdown: !previousState.openDropdown
    }), () => {
      if (this.state.openDropdown) {
        document.addEventListener('click', this.handleOutsideDropdownClick, false);
      } else {
        document.removeEventListener('click', this.handleOutsideDropdownClick, false);
      }
    });
  }

  renderUploadIcons = () => (
    <div className={styles.uploadIcon}>
      <Col xs={12} className={styles.parser_main}>
        <i className={`${styles.icon} fa fa-cloud-upload`} />
        <h2><Trans>YOU_DO_NOT_HAVE_ANY_FILES_ON_THIS_RECORDS_YET</Trans></h2>
        <Col xs={12} className={styles.parser_ins}>
          <h4>
            <Trans>FILES_WILL_BE_DISPAYED_HERE_AS_THEY_ARE_UPLOADED</Trans>
          </h4>
          <div className={styles.fileInputWrapper}>
            <input
              accept={constant.FILE_TYPES}
              type="file"
              onChange={e => { this.handleFileSelect(e); }}
            />
            <Button className={`${styles.uploadButton} button-primary`}>{i18n.t('UPLOAD')}</Button>
          </div>
        </Col>
      </Col>
    </div>
  );

  renderDropdownButton = () =>
    (
      <div className={`${styles.dropDown} btn-group btn-group-sm`}>
        <DropdownButton
          open={this.state.openDropdown}
          onClick={this.toggleDropdown}
          className={`${styles.selectDropDown} customBtnDropDown`}
          title={i18n.t('SELECTED')}
          id={1}
          ref={c => { this.dropdownButton = c; }}
        >
          {this.getDeletePermission() && <MenuItem eventKey="1" onSelect={this.handleConfirmDelete}>
            <Trans>DELETE</Trans></MenuItem>}
          <NewPermissible operation={{ operation: 'DOWNLOAD_DOCUMENT', model: 'document' }}>
            {
              this.state.selectedId.length <= 1 && <MenuItem
                target="_blank"
                eventKey="2"
                data-toggle="tooltip"
                data-placement="left"
                title={i18n.t('tooltipMessage.THIS_ACTION_ONLY_BE_PERFORMED_ON_A_SINGLE_FILE')}
                onClick={this.toggleDropdown}
                href={`${constant.fileDownLoad.downloadURL}${this.state.selectedId}?access_token=${this.authToken}`}
              ><Trans>DOWNLOAD</Trans></MenuItem>
            }
          </NewPermissible>
        </DropdownButton>
      </div>
    )

  render() {
    const { files, fetching } = this.props;
    const { dragOver, selectedId, deleteOrDownloadEnabled } = this.state;
    const selectRowProp = {
      mode: 'checkbox',
      onSelect: this.handleSelectRow.bind(this),
      onSelectAll: this.onSelectAll.bind(this),
      unselectable: this.getUnselectableKeys(files)
    };
    return (
      <div className={styles.fileManager}>
        <Loader loading={fetching} styles={{ position: 'absolute', top: '50%' }} />
        { this.props.files.length === 0 && !fetching ?
          <NewPermissible operation={{ operation: 'UPLOAD_FILE', model: 'document' }}>
            <div
              className={`${styles.fileContainer} ${dragOver ? styles.fileContainer_onfileDrag : ''}`}
              onDrop={e => { this.handleDrop(e); }}
              onDragOver={e => { this.handleDragOver(e); }}
              onDragEnter={this.handleDragEnter}
              onDragLeave={this.handleDragLeave}
            >
              <div className={styles.uploadIndicator} />
              { dragOver && <div
                className={styles.uploadBox}
                style={dragOver ? { pointerEvents: 'none' } : {}}
              >
                <i className="fa fa-cloud-upload" /><br />
                <span>Drop file to upload</span>
              </div>}
              {this.renderUploadIcons()}
            </div>
          </NewPermissible>
          :
          <div>
            <div className={styles.fileMenus} >
              <NewPermissible operation={{ operation: 'UPLOAD_FILE', model: 'document' }}>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept={constant.FILE_TYPES}
                    onChange={e => { this.handleFileSelect(e); }}
                    title=" "
                  />
                  <Button className="button-primary"><Trans>ADD_FILE</Trans></Button>
                </div>
              </NewPermissible>
              {deleteOrDownloadEnabled && selectedId.length !== 0 &&
                <div style={{ float: 'right' }}>
                  {this.renderDropdownButton()}
                </div>
              }
            </div>
            <BootstrapTable
              data={files}
              striped
              hover
              condensed
              selectRow={selectRowProp}
            >
              <TableHeaderColumn dataField="id" width="70px" isKey hidden>ID</TableHeaderColumn>
              <TableHeaderColumn
                width="100px"
                dataFormat={this.nameFormatter}
                dataField="originalFilename"
                headerAlign="center"
                headerTitle={false}
                columnTitle={this.columnTitle}
              ><Trans>NAME</Trans></TableHeaderColumn>
              <TableHeaderColumn
                width="70px"
                dataField="createdAt"
                headerAlign="center"
                dataAlign="center"
                dataFormat={this.dateFormatter}
                headerTitle={false}
              ><Trans>DATE_ADDED</Trans></TableHeaderColumn>
              <TableHeaderColumn
                width="70px"
                dataFormat={this.sizeFormatter}
                headerAlign="center"
                dataAlign="center"
                dataField="size"
              ><Trans>FILE_SIZE</Trans></TableHeaderColumn>
            </BootstrapTable>
          </div>
        }
      </div>
    );
  }
}
