import {ChangeDetectorRef, Component, ElementRef, SecurityContext, ViewChild} from '@angular/core';
import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environments";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {CategoriesConfig} from "../../Components/constants/plan_&_packages/categories/categories";
import {map, Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";

import {
  CKBox,
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Alignment,
  Autoformat,
  BlockQuote,
  Heading,
  List,
  Link,
  CodeBlock,
  Table,
  TableToolbar,
  Highlight,
  HtmlEmbed,
  SourceEditing,
  ImageBlock,
  ImageUpload,
  ImageInsert,
  TableCaption,
  TableColumnResize,
  TableProperties,
  TableCellProperties,
  Superscript,
  Subscript,
  Strikethrough,
  SpecialCharactersText,
  AccessibilityHelp,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  CKBoxImageEdit,
  CloudServices,
  Code,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  HorizontalLine,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  LinkImage,
  ListProperties,
  PageBreak,
  PasteFromOffice,
  PictureEditing,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  Underline,
  Template,
  TextTransformation, TodoList, LinkUI, ButtonLabelView
} from 'ckeditor5';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {checkPermission} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";

interface Email {
  id: number;
  title: string;
  subject: string;
  service: string;
  trial: null | string; // or trial?: string; to make it optional
  active_plan: string;
  card: null | string; // or card?: string; to make it optional
  cleanup: null | string; // or cleanup?: string; to make it optional
  days: number;
  status: number;
  occurrence: number;
  email_body: string;
  created_at: string; // or Date; if you want to use Date type
  updated_at: string; // or Date; if you want to use Date type
  deleted_at: null | string; // or deleted_at?: string; to make it optional
}


@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.css'
})


export class EmailsComponent {
  emails$: Observable<any> = new Observable<any>();
  emailBody: { [index: number]: string } = {};
  body: SafeHtml = '';
  editEmailBody: string = '';
  public Editor = ClassicEditor;


  viewControl: string = '';
  inputValue: string = '';
  selectedItem: string | null = null;
  baseURL: string = environment.apiBASEURL;

  public addEmailForm: FormGroup;

  trialViewControl: boolean = true;
  edit: boolean = false;
  showErrors: boolean = false;
  paginateSpinner: boolean = false;
  addEditSpinner: boolean = false;
  deleteSpinner: boolean = false;
  showEmailForm: boolean = false;

  emailId: number = 0;
  total: number = 0;
  perPage: number = 20;
  p: number = 1;
  typingTimer: any;
  doneTypingInterval = 500;


  constructor(private toastMessages: ToastMessagesComponent,private appComponent: AppComponent, private breadcrumbService: BreadcrumbService, private formBuilder: FormBuilder, private httpClientRequest: HttpClientRequestService,
              private encryptDecrypt: EncryptDecryptService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;
    this.addEmailForm = this.formBuilder.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      service: ['', Validators.required],
      trial: [''],
      active_plan: [''],
      card: [''],
      cleanup: [''],
      addons: [''],
      bucket: [''],
      subscription: [''],
      invite_user: [''],
      forgot_password: [''],
      occurrence: [1, Validators.required],
      days: [0, Validators.required],
      status: [1, Validators.required],
      email_body: ['', Validators.required]
    });
  }

  public config: any = {
    toolbar: {
      items: [
        'SourceEditing',
        'HtmlEmbed',
        'codeBlock',
        'undo',
        'redo',
        '|',
        'previousPage',
        'nextPage',
        '|',
        'revisionHistory',
        'trackChanges',
        'comment',
        '|',
        'aiCommands',
        'aiAssistant',
        '|',
        'formatPainter',
        '|',
        'heading',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'link',
        'insertImage',
        'insertTable',
        'highlight',
        'blockQuote',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'multiLevelList',
        'todoList',
        'indent',
        'outdent'
      ],
      shouldNotGroupWhenFull: false
    },
    plugins: [
      SourceEditing,
      HtmlEmbed,
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      CodeBlock,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      Bold,
      CKBox,
      CKBoxImageEdit,
      CloudServices,
      Code,
      // DocumentOutline,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      // FormatPainter,
      Heading,
      Highlight,
      HorizontalLine,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      // ImportWord,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      LinkUI,
      List,
      ListProperties,
      Mention,
      // MultiLevelList,
      // OpenAITextAdapter,
      PageBreak,
      // Pagination,
      Paragraph,
      PasteFromOffice,
      // PasteFromOfficeEnhanced,
      PictureEditing,
      // PresenceList,
      // RealTimeCollaborativeComments,
      // RealTimeCollaborativeEditing,
      // RealTimeCollaborativeRevisionHistory,
      // RealTimeCollaborativeTrackChanges,
      RemoveFormat,
      // RevisionHistory,
      SelectAll,
      // SlashCommand,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      // TableOfContents,
      TableProperties,
      TableToolbar,
      Template,
      TextTransformation,
      TodoList,
      // TrackChanges,
      // TrackChangesData,
      Underline,
      Undo, ButtonLabelView
    ],
    // extraPlugins: [simplebutton],
    allowedContent: true,
    balloonToolbar: [
      'comment',
      '|',
      'aiAssistant',
      '|',
      'bold',
      'italic',
      '|',
      'link',
      'insertImage',
      '|',
      'bulletedList',
      'numberedList'
    ],

    // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckbox.html
    // ckbox: {
    //   // Be careful - do not use the development token endpoint on production systems!
    //   tokenUrl: 'https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckbox.html//'//https://112574.cke-cs.com/token/dev/VdC7QiFnDq2OcgEa0WgA2Jw8u5NkJT4IDhyQ?limit=10'
    // },
    collaboration: {
      // Modify the channelId to simulate editing different documents
      // https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration-integration.html#the-channelid-configuration-property
      channelId: 'document-id-1'
    },
    // Add configuration for the comments editor if the Comments plugin is added.
    // https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/annotations/annotations-custom-configuration.html#comment-editor-configuration
    comments: {
      editorConfig: {
        extraPlugins: [Autoformat, Bold, Italic, List, Mention],
        mention: {
          feeds: [
            {
              marker: '@',
              feed: [
                // See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#comments-with-mentions
                '@Baby Doe',
                '@Joe Doe',
                '@Jane Doe',
                '@Jane Roe',
                '@Richard Roe'
              ]
            }
          ]
        }
      }
    },
    documentOutline: {
      container: document.querySelector('#editor-outline')
    },

    fontFamily: {
      supportAllValues: true
    },

    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 22],
      supportAllValues: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph'
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1'
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2'
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3'
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4'
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5'
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6'
        }
      ]
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage',
        '|',
        'ckboxImageEdit'
      ]
    },
    initialData: ' ',
    licenseKey: 'Y2JFSXNicllRelBkSmZUYUc2NlBxbnVYVDNrNnZZRHBCa2l0QVFxRnc0Ni9nWldUY2p1cG41VjNjbkpDZXc9PS1NakF5TkRBNE1EST0=',
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file'
          }
        },
        // openInNewTab: {
        //   mode: 'manual',
        //   label: 'Open in a new tab',
        //   defaultValue: true,			// This option will be selected by default.
        //   attributes: {
        //     target: '_blank',
        //     rel: 'noopener noreferrer'
        //   }
        // }
      }

    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
    mention: {
      feeds: [
        {
          marker: '@',
          feed: [
            '@apple',
            '@bears',
            '@brownie',
            '@cake',
            '@cake',
            '@candy',
            '@canes',
            '@chocolate',
            '@cookie',
            '@cotton',
            '@cream',
            '@cupcake',
            '@danish',
            '@donut',
            '@dragée',
            '@fruitcake',
            '@gingerbread',
            '@gummi',
            '@ice',
            '@jelly-o',
            '@liquorice',
            '@macaroon',
            '@marzipan',
            '@oat',
            '@pie',
            '@plum',
            '@pudding',
            '@sesame',
            '@snaps',
            '@soufflé',
            '@sugar',
            '@sweet',
            '@topping',
            '@wafer'
          ]
        }
      ]
    },
    menuBar: {
      isVisible: true
    },
    pagination: {
      pageWidth: '21cm',
      pageHeight: '29.7cm',
      pageMargins: {
        top: '20mm',
        bottom: '20mm',
        right: '12mm',
        left: '12mm'
      }
    },
    language: 'en',
    backdrop: 'static',
    focus: {
      // Disable focus on the editor when inserting a link
      forceFocus: false
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties'
      ]
    },
    template: {
      definitions: [
        {
          title: 'Introduction',
          description: 'Simple introduction to an article',
          icon: '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <g id="icons/article-image-right">\n        <rect id="icon-bg" width="45" height="45" rx="2" fill="#A5E7EB"/>\n        <g id="page" filter="url(#filter0_d_1_507)">\n            <path d="M9 41H36V12L28 5H9V41Z" fill="white"/>\n            <path d="M35.25 12.3403V40.25H9.75V5.75H27.7182L35.25 12.3403Z" stroke="#333333" stroke-width="1.5"/>\n        </g>\n        <g id="image">\n            <path id="Rectangle 22" d="M21.5 23C21.5 22.1716 22.1716 21.5 23 21.5H31C31.8284 21.5 32.5 22.1716 32.5 23V29C32.5 29.8284 31.8284 30.5 31 30.5H23C22.1716 30.5 21.5 29.8284 21.5 29V23Z" fill="#B6E3FC" stroke="#333333"/>\n            <path id="Vector 1" d="M24.1184 27.8255C23.9404 27.7499 23.7347 27.7838 23.5904 27.9125L21.6673 29.6268C21.5124 29.7648 21.4589 29.9842 21.5328 30.178C21.6066 30.3719 21.7925 30.5 22 30.5H32C32.2761 30.5 32.5 30.2761 32.5 30V27.7143C32.5 27.5717 32.4391 27.4359 32.3327 27.3411L30.4096 25.6268C30.2125 25.451 29.9127 25.4589 29.7251 25.6448L26.5019 28.8372L24.1184 27.8255Z" fill="#44D500" stroke="#333333" stroke-linejoin="round"/>\n            <circle id="Ellipse 1" cx="26" cy="25" r="1.5" fill="#FFD12D" stroke="#333333"/>\n        </g>\n        <rect id="Rectangle 23" x="13" y="13" width="12" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 24" x="13" y="17" width="19" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 25" x="13" y="21" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 26" x="13" y="25" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 27" x="13" y="29" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 28" x="13" y="33" width="16" height="2" rx="1" fill="#B4B4B4"/>\n    </g>\n    <defs>\n        <filter id="filter0_d_1_507" x="9" y="5" width="28" height="37" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">\n            <feFlood flood-opacity="0" result="BackgroundImageFix"/>\n            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>\n            <feOffset dx="1" dy="1"/>\n            <feComposite in2="hardAlpha" operator="out"/>\n            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.29 0"/>\n            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_507"/>\n            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_507" result="shape"/>\n        </filter>\n    </defs>\n</svg>\n',
          data: "<h2>Introduction</h2><p>In today's fast-paced world, keeping up with the latest trends and insights is essential for both personal growth and professional development. This article aims to shed light on a topic that resonates with many, providing valuable information and actionable advice. Whether you're seeking to enhance your knowledge, improve your skills, or simply stay informed, our comprehensive analysis offers a deep dive into the subject matter, designed to empower and inspire our readers.</p>"
        }
      ]
    }
  }

  // @ViewChild('editor') editor: CKEditorComponent | undefined;

  ngAfterViewInit() {
    // const htmlData = '<p>This is some sample data</p><p><b>This text is bold</b></p><p><i>This text is italic</i></p>';
    // // @ts-ignore
    // this.editor?.editorInstance?.model.insertContent(htmlData);
  }


  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs([{
      label: 'Emails',
      url: '/emails'
    }]);
    this.breadcrumbService.setComponentName('Emails');
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');
    this.getEmails();
  }

  controlEmailAddEditView(flag: boolean = false) {
    this.showEmailForm = flag;
  }

  emailServiceFilters(filterValue: string) {
    if (this.notEmpty(filterValue)) {
      this.selectedItem = filterValue;
      this.getEmails('', filterValue.trim());
    } else {
      this.selectedItem = null;
      this.getEmails('', '');
    }
  }

  notEmpty(value: string | number): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  controlServicesChange(event: any) {
    let services_value = event.target.value.trim();
    if (services_value) {

      switch (services_value) {
        case "trial":
          this.viewControl = 'trial';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "active_plan":
          this.viewControl = 'active_plan';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "card":
          this.viewControl = 'card';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "cleanup":
          this.viewControl = 'cleanup';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "addons":
          this.viewControl = 'addons';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "bucket":
          this.viewControl = 'bucket';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "subscription":
          this.viewControl = 'subscription';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "invite_user":
          this.viewControl = 'invite_user';
          this.changeValidationsAccordingToSelection(services_value);
          break;
        case "forgot_password":
          this.viewControl = 'forgot_password';
          this.changeValidationsAccordingToSelection(services_value);
          break;
      }
    }

  }

  changeValidationsAccordingToSelection(selectedValue: string = ''): void {
    let modules: string[] = ['trial', 'active_plan', 'card', 'cleanup', 'addons', 'bucket', 'subscription', 'invite_user', 'forgot_password'];

    modules.forEach((element: string) => {
      let elementControl = this.addEmailForm.get(element);

      if (selectedValue !== element) {
        elementControl?.removeValidators(Validators.required);
        elementControl?.patchValue(null);
      } else {
        elementControl?.setValidators(Validators.required);
        elementControl?.setValue('');
      }

    });
  }

  trialControlChange(event: any) {
    let trial_value = event.target.value.trim();
    if (trial_value) {
      const inBetween: string[] = ['before_trial_expired'];
      if (!inBetween.includes(trial_value)) {
        this.trialViewControl = false;
      } else {
        this.trialViewControl = true;
      }
      console.log('entered')
    }

  }

  get formControl() {
    return this.addEmailForm.controls;
  }

  onEditorChange(event: any) {
    this.editEmailBody = event.editor.getData();
    this.addEmailForm.patchValue({email_body: this.editEmailBody});

    //
    // const editor = event.editor;
    // const model = editor.model;
    // const selection = model.selection;
    //
    // selection.setTo(new model.Range(model.createPositionAt(document.body, 'end')));

  }

  submitEmailForm() {


    if (this.addEmailForm.valid) {
      this.showErrors = false;
      this.addEditSpinner = true;
      let URL = this.baseURL + (this.edit ? 'api/settings/email/' + this.emailId : 'api/settings/email/store');
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let formData = this.addEmailForm.value;
      formData.email_body = this.editEmailBody;
      let body = formData;
      let method = this.edit ? "PUT" : "POST";

      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response);
          this.edit = false;
          this.addEditSpinner = false;
          // this.closeBtn.nativeElement.click();
          this.addEmailForm.reset();

          //fetch emails listing again for refreshing
          this.getEmails();
          //assign default selected values
          this.addEmailForm.patchValue({
            title: '',
            subject: '',
            service: '',
            trial: '',
            active_plan: '',
            card: '',
            cleanup: '',
            occurrence: 1,
            days: 0,
            status: 1,
            email_body: ''
          });
          this.showEmailForm = false;

        },
        (error) => {
          this.addEditSpinner = false;
          this.showEmailForm = true;
          //error() callback
          console.log('Request failed with error', error);

        });
    } else {
      this.showErrors = true;
      this.showEmailForm = true;
    }

  }

  getEmailDataForEdit(email_id: number = 0) {
    if(!checkPermission(moduleIds.emails, 'update')){
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error');
      return
    }

    let URL = this.baseURL + 'api/settings/email/' + email_id;
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body = this.addEmailForm.value;
    let method = "GET";
    this.edit = true;
    this.addEditSpinner = true;
    this.showEmailForm = true;

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log(decrypted_response)
        const emailData = decrypted_response.email;

        this.emailId = emailData.id;
        console.log(emailData.service === 'forgot_password' ? emailData.forgot_password : '')
        setTimeout(() => {
          this.addEmailForm.patchValue({
            title: emailData.title,
            subject: emailData.subject,
            service: emailData.service,
            trial: emailData.service === 'trial' ? emailData.trial : '',
            active_plan: emailData.service === 'active_plan' ? emailData.active_plan : '',
            card: emailData.service === 'card' ? emailData.card : '',
            cleanup: emailData.service === 'cleanup' ? emailData.cleanup : '',
            addons: emailData.service === 'addons' ? emailData.addons : '',
            bucket: emailData.service === 'bucket' ? emailData.bucket : '',
            subscription: emailData.service === 'subscription' ? emailData.subscription : '',
            invite_user: emailData.service === 'invite_user' ? emailData.invite_user : '',
            forgot_password: emailData.service === 'forgot_password' ? emailData.forgot_password : '',
            occurrence: emailData.occurrence,
            days: emailData.days,
            status: emailData.status,
            email_body: emailData.email_body
          });
        }, 300);
        //this variable controls service type for view  which service value is selected
        this.viewControl = emailData.service;

        this.editEmailBody = emailData.email_body;
        //assign null values which are not selected in service because enum type only allowed default null or specific values
        this.changeValidationsAccordingToSelection(emailData.service.trim());
        this.addEditSpinner = false;
      },
      (error) => {
        this.addEditSpinner = false;
        //error() callback
        console.log('Request failed with error', error);
      });
  }

  @ViewChild('closeBtn') closeBtn!: ElementRef;
  @ViewChild('closeDeletePopup') closeDeletePopup!: ElementRef;
  @ViewChild('emailPreviewModel') emailPreviewModel!: ElementRef;

  getEmails(search: string = '', filter: string = '') {
    // this.paginateSpinner=true;
    let decrypted_data: any;
    this.paginateSpinner = true;

    // Show the spinner
    // this.showSpinner = true;

    let URL = '';
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body: { limit: number, search?: string, filter?: string } = {
      "limit": this.perPage
    };


    if (search !== '') {
      if (this.notEmpty(filter)) {
        URL = this.baseURL + "api/settings/email?limit=" + this.perPage + "&search=" + search + "&filter=" + filter;
      } else {
        URL = this.baseURL + "api/settings/email?limit=" + this.perPage + "&search=" + search;
      }

    } else {
      if (this.notEmpty(filter)) {
        URL = this.baseURL + "api/settings/email?limit=" + this.perPage + "&filter=" + filter;
      } else {
        URL = this.baseURL + "api/settings/email?limit=" + this.perPage
      }
    }


    this.p = 1;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        // this.paginateSpinner=false;
        console.log(decrypted_data)
        if (decrypted_data.data.length > 0) {

          decrypted_data.data.forEach((email: Email) => {
            this.emailBody[email.id] = email.email_body;
          })

          //change incoming data array to observable
          this.emails$ = of(decrypted_data.data);
          this.total = decrypted_data.total;
        } else {
          this.emails$ = of([]);
          this.total = 0;
        }
        this.paginateSpinner = false;
      },
      (error) => {
        this.paginateSpinner = false;
        console.log('Request failed with error', error);
      });
  }

  getPage(page: number) {
    this.serverCall(page).subscribe({
      next: (res: any) => {
        this.emails$ = of(res.items);
        this.total = res.total;
        this.p = page;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  //
  serverCall(page: number): Observable<any> {
    // this.paginateSpinner=true;
    let URL: string = "";
    URL = this.baseURL + "api/settings/email?page=" + page;

    let body = {};
    const headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        decryptedData.data.forEach((email: Email) => {
          this.emailBody[email.id] = email.email_body;
        })
        console.log('server call decryptedData');
        console.log(decryptedData);
        // this.paginateSpinner=false;
        return {
          items: decryptedData.data,
          total: decryptedData.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );
  }

  triggerIdAssignment(emailId: number = 0) {
    this.emailId = emailId;
  }

  deleteFeature() {
    let URL: string = this.baseURL + 'api/settings/email/' + this.emailId;
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body = this.addEmailForm.value;
    let method: string = "DELETE";
    this.deleteSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log(decrypted_response);
        this.edit = false;
        this.deleteSpinner = false;
        this.closeDeletePopup.nativeElement.click();
        this.getEmails();
      },
      (error) => {
        this.deleteSpinner = false;
        //error() callback
        console.log('Request failed with error', error);
      });
  }

  onEditorReady(editor: any): void {
    editor.setData(this.editEmailBody);
  }

  onKeyUp(event: any) {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      // Call your action method here
      this.onStoppedTyping();
    }, this.doneTypingInterval);

    // Update the input value
    this.inputValue = event.target.value;
  }

  onStoppedTyping() {
    this.getEmails(this.inputValue);
  }

  loadEmailBody(emailId: number) {
    setTimeout(() => {
      this.body = this.sanitizer.bypassSecurityTrustHtml(this.decodeHtml(this.cleanHtml(this.emailBody[emailId])));
      // this.body = this.decodeHtml(this.cleanHtml(this.emailBody[emailId]));
      this.cdr.detectChanges();
    }, 300 as number)
  }

  cleanHtml(html: string): string {
    return html.replace(/\s\s+/g, ' ').trim();
  }

  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }


  protected readonly checkPermission = checkPermission;
  protected readonly moduleIds = moduleIds;
}

