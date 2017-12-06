import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { CampaignService, CampaignSettingsService, CampaignContactService, TranslateService, UtilsService } from '../../../../../../services';

import { ModalContactImportComponent } from '../../../modals/contact-import/contact-import.modal';
import { ModalErrorsComponent } from '../../../modals/errors/errors.modal';

import { Campaign } from '../../../../../../models';

import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import * as CSV from 'papaparse';
import { Logger } from 'angular2-logger/core';

@Component({
  selector   : 'contacts-import',
  templateUrl: './contacts-import.component.html'
})
export class ContactsImportComponent implements OnInit {
  campaign: Campaign;
  campaigns: Campaign[];

  fileType: string;
  fileName: string;
  fileExtension: string;
  validFile: boolean            = false;
  validMimeTypes: Array<string> = [
    'application/excel',
    'application/vnd.ms-excel',
    'application/x-excel',
    'application/x-msexcel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
    'csv',
    'xls',
    'xlsx'
  ];

  databaseColumns: Object = {
    number     : 'Phone number',
    extension  : 'Phone extention',
    first_name : 'First name',
    last_name  : 'Last name',
    title      : 'Title',
    email      : 'Email',
    company    : 'Company name',
    line1      : 'Address',
    city       : 'City',
    postal_code: 'Postal code / ZIP',
    region     : 'Region / State',
    country    : 'Country',
    hints       : 'Contact info',
    website    : 'Website'
  };

  jsonDataStructure: Object = {
    contact    : {
      'first_name': '',
      'last_name' : '',
      'hints'      : '',
      'title'     : '',
      'company'   : '',
      'email'     : ''
    },
    phone      : {
      'number'   : '',
      'extension': ''
    },
    address    : {
      'line1'      : '',
      'city'       : '',
      'region'     : '',
      'postal_code': '',
      'country'    : ''
    },
    social_link: {
      'website': ''
    },
    keyvalues  : []
  };

  jsonStructure: Object = {
    campaign_id   : '',
    operation_type: '',
    merge_type    : '',
    data          : []
  };

  importData: Object = {
    bulk_import_id: ''
  };

  parsedFileData: Array<Object>;
  fileColumnNames: Array<string>         = [];
  extractedDataAfterMatch: Array<Object> = [];
  /** I use this var to create a stack of all available options for each column match select */
  availableColumnsStack: Object          = {};

  parsing: boolean               = false;
  canMatch: boolean              = false;
  dataPreparedForImport: boolean = false;
  importCompleted: boolean       = false;
  importErrors: any;

  timeoutBulkImportProgress: any = null;

  nrContactsImported: number         = 0;
  nrContactsImportedProgress: number = 0;

  crmLink: string;
  dbLink: string;
  closeLink: string;

  /** ModalContactImportComponent is strong dependent on ContactsImportComponent */
  @ViewChild(ModalContactImportComponent) private contactImportModal: ModalContactImportComponent;
  @ViewChild(ModalErrorsComponent) private errorsModal: ModalErrorsComponent;

  constructor(private campaignService: CampaignService,
              private campaignSettingsService: CampaignSettingsService,
              private route: ActivatedRoute,
              private router: Router,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private campaignContactService: CampaignContactService,
              private utilsService: UtilsService,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.campaign                 = this.route.snapshot.parent.parent.parent.data['campaign'];
    this.campaign.campaignSetting = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.getCampaignSettings(this.campaign.id);
    this.getCampaignList();
    this.buildInternalLinks();
  }

  getCampaignSettings(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting'
    }).toPromise()
      .then((campaign: Campaign) => {
          if (campaign.campaignSetting) {
            this.campaign.campaignSetting = campaign.campaignSetting;
          }
        }
      );
  }

  getCampaignList(): void {
    let requestParams = {
      page: {
        number: 1,
        size  : 1000
      }
    };

    let subs = this.campaignService.getList(requestParams).subscribe(
      (items: any[]) => this.campaigns = items,
      err => err,
      () => subs.unsubscribe()
    );
  }

  updateCampaignSettings(values: Array < string >): void {
    // if scrub = true then update
    if (values['scrub']) {
      this.campaign.campaignSetting.scrub = values['scrub'];

      this.campaignSettingsService.updateItem(this.campaign.campaignSetting);
    }

    delete values['scrub'];
  }

  close(): void {
    this.router.navigateByUrl(this.closeLink);
  }

  defaultPreventer(event: any): void {
    event.stopPropagation();
    event.preventDefault();
  }

  onDrop(event: any): void {
    this.defaultPreventer(event);
    this.parseFile(event.dataTransfer.files);
  }

  handleFile(event: any): void {
    this.defaultPreventer(event);
    this.parseFile(event.target.files);
  }

  parseFile(files: any): void {
    if (files.length !== 1) {
      this.toastr.error(this.translateService.translate('Please add one file to parse'));
      this.reset();
      return;
    }

    let file           = files[0]; // we accept only one file
    this.fileName      = file.name;
    this.fileExtension = this.getFileExtension(file);
    this.fileType      = file.type ? file.type : this.fileExtension;

    if (!this.isValidMimeType(this.fileType)) {
      this.toastr.error(this.translateService.translate('Please upload only xls, xlsx or csv files'));
      this.reset();
      return;
    }

    this.loadFileData(file);
  }

  getFileExtension(file: any): string {
    let fileNameSplited = file.name.split('.');
    return fileNameSplited[fileNameSplited.length - 1];
  }

  loadFileData(file: any): void {
    let reader = new FileReader();

    reader.onload = (event: any) => {
      let data     = [];
      this.parsing = true;

      if (!event) {
        data = (reader as any).content;
      } else {
        data = (event.target as any).result;
      }

      if (!data.length) {
        this.logger.error('We could not get the data from FileReader');
        this.toastr.error(this.translateService.translate('We could not read any data from this file'));
        this.reset();
        return;
      }

      this.parsedFileData = (this.fileType === 'text/csv'
      || this.fileType === 'application/csv'
      || this.fileType === 'csv') ?
        this.parseCsv(data) : this.parseXls(data);

      if (!(this.parsedFileData.length > 0)) {
        this.toastr.error(this.translateService.translate('There is no valid data in: ' + this.fileName));
        this.reset();
        return;
      }

      this.fillAvailableColumnsStack();
      this.validFile = true;
      this.parsing   = false;
    };

    reader.onerror = (event: any) => {
      this.logger.error('Error while loading file: ' + this.fileName, event);
      this.parsing = false;
    };
    reader.readAsBinaryString(file);
  }

  parseXls(data: Array<any>): Array < Object > {
    let parsedData    = [];
    let workbook      = XLSX.read(data, {type: 'binary'});
    let worksheetName = workbook.SheetNames[0]; // take only first worksheet

    if (workbook && workbook.Sheets.hasOwnProperty(worksheetName)) {
      let worksheet = workbook.Sheets[worksheetName];
      parsedData    = (XLSX as any).utils.sheet_to_row_object_array(worksheet); // get each row as array
    }

    return parsedData;
  }

  parseCsv(data: Array<any>): Array < Object > {
    let parsedData = CSV.parse(data, {header: true});
    // remove rows from parsedData if parsing errors
    if (parsedData.errors && parsedData.errors.length) {
      for (let error of parsedData.errors) {
        parsedData.data.splice(error.row, 1);
      }
    }

    return parsedData.data;
  }

  isValidMimeType(type: string): Boolean {
    return this.validMimeTypes.indexOf(type) !== -1;
  }

  fillAvailableColumnsStack(): void {
    this.fileColumnNames = Object.keys(this.parsedFileData[0]); // take column names
    let indexToBeRemoved = [];

    this.fileColumnNames.forEach((value, idx) => {
      if (value) { // I've done this because there are columns without names and values
        this.availableColumnsStack[value] = _.cloneDeep(this.databaseColumns);
      } else {
        indexToBeRemoved.push(idx);
      }
    });

    for (let idx of indexToBeRemoved) {
      this.fileColumnNames.splice(idx, 1);
    }
  }

  getMatchingColumns(values: Array < string >): Array < string > {
    // cleanup empty values
    for (let key in values) {
      if (values.hasOwnProperty(key) && values[key] === '') {
        delete values[key];
      }
    }

    if (!Object.keys(values).length) {
      this.toastr.error(this.translateService.translate('There are no columns to be matched'));
      return;
    }

    return values;
  }

  extractDataAfterMatch(fileData: Array < Object >, matchingColumns: Object): Array < Object > {
    let extractedData = [];

    fileData.map(
      row => {
        let data = {
          keyvalues: []
        };

        _.each(matchingColumns, (dbCol, fileCol) => {
          let keyvalues = {
            'key'  : '',
            'value': ''
          };

          if (dbCol === 'key') {
            keyvalues.key   = fileCol;
            keyvalues.value = row[fileCol];

            data['keyvalues'].push(keyvalues);
          } else if (row.hasOwnProperty(fileCol)) {
            data[dbCol] = row[fileCol];
          }
        });

        extractedData.push(data);
      }
    );

    return extractedData;
  }

  prepareDataForImport(values: Array < string >): void {
    this.updateCampaignSettings(values);

    let matchingColumns = this.getMatchingColumns(values);

    if (!matchingColumns) {
      this.reset();
      return;
    }

    this.extractedDataAfterMatch = this.extractDataAfterMatch(this.parsedFileData, matchingColumns);

    if (this.campaign.numberOfContacts > 0) {
      this.contactImportModal.show(); // this will trigger the import with add/replace/merge option
    } else {
      this.postImport({});
    }

    this.dataPreparedForImport = true;
  }

  /** send POST Request with bulk JSON data structure */
  postImport(options: any): void {
    this.prepareJsonStructureForImport();

    this.jsonStructure['operation_type'] = options.contactAction ? options.contactAction : 'add';
    this.jsonStructure['merge_type']     = options.mergeType ? options.mergeType : '';
    this.jsonStructure['campaign_id']    = this.campaign.id;

    /**
     * send Request
     *
     * response = {
     *   body: {},
     *   status: number,
     *   statusText: string
     * }
     */
    this.campaignContactService.bulkImport(this.jsonStructure)
      .then(response => {
          // if import succeed with no errors, just update nrContacts
          this.importData['bulk_import_id'] = response.body.data.id;

          this.timeoutBulkImportProgress = setInterval(
            () => {
              // Show progressbar with real-time progress
              this.campaignContactService.bulkImportProgress(this.importData)
                .then(res => {
                  this.nrContactsImportedProgress = res.body.data.attributes.progress;
                })
                .catch(res => {
                });

              // Get the result
              this.campaignContactService.bulkImportResult(this.importData)
                .then(resp => {
                  let status = resp.body.data.attributes.status;
                  if (status === 'success' || status === 'failed') {
                    // Remove timeout
                    window.clearInterval(this.timeoutBulkImportProgress);

                    this.nrContactsImported = resp.body.data.attributes.successfullyCreated;
                    this.campaign.numberOfContacts += this.nrContactsImported;
                    this.importCompleted    = true;

                    if (status === 'failed') {
                      this.importErrors = resp.body.data.attributes.bulkErrors ?
                        resp.body.data.attributes.bulkErrors : resp.status + ' - ' + resp.statusText;
                      this.errorsModal.show();
                    }
                  }
                })
                .catch(resp => {
                });
            }, 3000
          );
        }
      )
      .catch(response => {
          // take errors (OR response status if there are no errors) and send them to errorsModal
          this.nrContactsImported = response.body.data.attributes.successfullyCreated ? response.body.data.attributes.successfullyCreated : 0;
          this.importErrors       = response.body.data.attributes.bulkErrors ?
            response.body.data.attributes.bulkErrors : response.status + ' - ' + response.statusText;
          this.errorsModal.show();

          this.importCompleted = true;
        }
      );
  }

  prepareJsonStructureForImport(): void {
    _.each(this.extractedDataAfterMatch, row => {
      let contactData = _.cloneDeep(this.jsonDataStructure);

      _.each(this.jsonDataStructure, (dbKeys, structureKey) => {
        // populate keyvalues for each row
        if (row.hasOwnProperty('keyvalues')) {
          contactData['keyvalues'] = row['keyvalues'];
        }

        _.each(Object.keys(dbKeys), key => {
          if (row.hasOwnProperty(key)) {
            contactData[structureKey][key] = row[key];
          }
        });
      });

      this.jsonStructure['data'].push(contactData);
    });
  }

  reset(): void {
    this.dataPreparedForImport           = false;
    this.validFile                       = false;
    this.nrContactsImported              = 0;
    this.nrContactsImportedProgress      = 0;
    this.extractedDataAfterMatch         = [];
    this.availableColumnsStack           = {};
    this.canMatch                        = false;
    this.importCompleted                 = false;
    this.parsing                         = false;
    this.jsonStructure['campaign_id']    = '';
    this.jsonStructure['operation_type'] = '';
    this.jsonStructure['merge_type']     = '';
    this.jsonStructure['data']           = [];
    this.importErrors                    = [];
    this.importData['bulk_import_id']    = [];
  }

  updateAvailableColumns(colKey: string, value: string, formValues: Object): void {
    /**
     * current selected option = value and is not shown in formValues list
     * set current selected option manually
     * keep only selected options
     */
    let allSelectedValues = {};
    _.each(formValues, (formValue, key) => {
      // set selected option manually
      if (key === colKey && formValues.hasOwnProperty(key) && (formValue === '' || formValue !== value)) {
        allSelectedValues[key] = value;
        return;
      }

      // keep only selected options
      if (formValues.hasOwnProperty(key) && formValue !== '') {
        allSelectedValues[key] = formValue;
        return;
      }
    });

    let selectedDbColumns = _.values(allSelectedValues);
    this.canMatch         = (selectedDbColumns.indexOf('number') !== -1);

    _.each(this.availableColumnsStack,
      (dbColumns, xlsCol) => {
        let valuesToBeRemoved              = _.cloneDeep(allSelectedValues);
        this.availableColumnsStack[xlsCol] = _.cloneDeep(this.databaseColumns); // initial set of columns

        if (valuesToBeRemoved.hasOwnProperty(xlsCol)) { // skip if selected option exists for this column
          delete valuesToBeRemoved[xlsCol];
        }

        _.each(valuesToBeRemoved, (val: string) => {
          if (this.availableColumnsStack[xlsCol].hasOwnProperty(val)) {
            delete this.availableColumnsStack[xlsCol][val];
          }
        });
      }
    );
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.crmLink     = `${segmentedUrl}/contacts/from-crm`;
    this.dbLink      = `${segmentedUrl}/contacts/database`;
    this.closeLink   = segmentedUrl;
  }
}
