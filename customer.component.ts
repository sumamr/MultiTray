import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
//import { CustomerService } from '../../Services/customer.service';
import { Customer, CustomerAddressForTransportAndPacking, CustomerDetails, CustomerTransportAndPackingDetails, GetALLCustomerDetails, GetCustomerDetails, PackingTypeDetails, Transport, TransportAndPackingDetails, TransportationCostForEachAddress } from '../../Models/customer.model';
import { CustomerPointOfContacts } from '../../Models/customerpointofcontacts.model';
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonService } from '../../Core/Services/common.service';
import { CustomerService } from '../../Core/Services/customer.service';
import { PointOfContact } from '../../Models/pointofcontacts.model';
import { EditCustomer } from '../../Models/editcustomer.model';
import { SessionService } from '../../Core/Services/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AddressBook } from '../../Models/addressbook.model';
import { create } from 'domain';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Console } from 'console';
//import * as $ from 'jquery';

declare var bootstrap: any;
@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ToastrModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {
  addressesdetails: any[] = []; // Declare the property with an appropriate type
  form: FormGroup;
  locationForm!: FormGroup;
  activeTab: number = 1;
  itemsPerPage: number = 10; // Define the number of items per page
  contactLabels = [
    { id: 1, name: 'Primary' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Purchase' },
    { id: 4, name: 'Invoice' },
    { id: 5, name: 'Quality' }
  ];
  //contactLabels = ['Primary', 'Sales', 'Purchase', 'Invoice', 'Quality'];
  getPrimaryContacts(pointOfContacts: any[]) {
    return pointOfContacts?.filter(p => p.pointOfContactType === 'Primary') || [];
  }
  disableRightClick(event: MouseEvent): void {
    event.preventDefault(); 
  }
  private getPointOfContactType(index: number): string {
    return this.contactLabels[index]?.name || ''; // Return the name or an empty string if not found
}
  selectedPricePalletName: string = '';
  placeholderForNoOfPalletField: string = '';
  showPriceTextBox:boolean= false;
  showNoOfPalletTextBox:boolean= false;
  showNoOfBoxesPerPallet:boolean= false;
  showNoOfPiecesPerRow:boolean= false;
  showNoOfRowsOnTop:boolean= false;

  // Flags for Static Packing Options Checkboxes
  showCardboardLayerPadCheckbox: boolean = false;
  showPlasticBigBoxCheckbox: boolean = false;
  showDoubleStackedCheckbox: boolean = false;
  show1By8PalletBagCheckbox: boolean = false;

  transportCostDetailsForSelectedAddress: TransportationCostForEachAddress[] = [];

  showTransportAndPackingInfoMessage: boolean = false;

  selectedIncotermName: string = '';
  selectedTypeOfPalletName: string = '';
  selectedTypeOfPackingID: string = '';
  allCustomers: Customer[] = [];
  allCustomerDetails:CustomerDetails[] = [];
  allCountries:any[]=[];
  allCustomerTypes:any[]=[];
  allPaymentTerms:any[]=[];
  showDiscountMessage: boolean = false;
  showTextBox: boolean = false;
  selectedUser: any = null;
  customerID: any;
  addressID: any;
  isCustomerInfoSaved: boolean = false;
  initialCustomerInfoState: any;
  isFormModified: boolean = false;
  isEditing: boolean = false;
  isEditingMode: boolean = false; // added by afraz to track editing mode

  customerIDToEditInAddMode : string | null = null;
  pointOfContactID : any;

  getCustomerDetail: GetALLCustomerDetails={
    customerID: '',
    companyName: '',
    telephone: '',
    address1: '',
    address2: '',
    address3: '',
    postCode: '',
    country: '',
    paymentTerm: '',
    emailId: '',
    type: '',
    pocSales: '',
    pocInvoice: '',
    pocPurchase: '',
  }
  customerDisplay: any = {};
  getallcustomerDetails: GetCustomerDetails = {
    table1Results: [],
    table2Results: []
  }

  addresseIDsFromAPIResponse: string[]=[];
  selectedAddressIds: string[] = []; // Store selected address IDs

  // Flag for selected Address IDs
  isAnyAddressSelected: boolean = false;
  isQuoteAssociated: boolean = false; // Flag to check if quote is associated with the Customer

  isAddressAssociated: boolean = false; // Flag to check if Address is associated with the Transport and Packing
 
  

  newCustomer : Customer = {
    customerID: '',
    customerName: '',
    address: '',
    city:'',
    state:'',
    postCode: '',
    country: '',
    paymentTerm:'',
    //paymentDays: 0,
    customerTypes:'',
    customerTypeID:'',
    //notes: string;
    isActive: false,
    isDeleted: false,
    isEnabled: false,
    countryID:'',
    mobileNumber:'',
    emailID:'',
    pointOfContacts:[],
  }
  newpointOfContact:PointOfContact={
    pointOfContactID:'',
    name:'',
    mobileNumber:'',
    emailId:'',
    countryID:'',
    countryCode:''
  }
  editCustomers : EditCustomer = {
    customerID: '',
    customerName: '',
    address: '',
    city:'',
    state:'',
    postCode: '',
    //country: '',
    paymentTerm:'',
    customerTypes:'',
    isActive: false,
    isDeleted: false,
    isEnabled: false,
    countryID:'',
    mobileNumber:'',
    emailID:'',
  }
  customerDetails : CustomerDetails = {
    customerID: '',
    customerName: '',
    address: '',
    postCode: '',
    country: '',
    paymentTerm:'',
    city:'',
    state:'',
    //paymentDays: 0,
    customerTypes:'',
    customerTypeID : '',
    //notes: string;
    isActive: false,
    isDeleted: false,
    isEnabled: false,
    countryID:'',
    mobileNumber:'',
    emailID:'',
    pointOfContacts:[],
    addressBook:[],
  }
  customerPointOfContacts:CustomerPointOfContacts[]=[];
  selectedCustomer: any;
  selectedCustomerId: any;
  selectedAddressId:any;
  filteredCustomers: CustomerDetails[] = []; 
  //filteredCustomers: CustomerPointOfContacts[] = []; 
  searchQuery: string = '';
  currentPage: number = 1;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string = '';
  originalCustomerStatus: boolean | null = null; 
  isCancelClicked: boolean = false; 
  route: ActivatedRoute;

  // Transport and Packing
  allIncoterms: any[] = [];
  allPricingTypes: any[] = [];
  allTypesOfPallet: any[] = [];
  allTypesOfPacking: any[] = [];
  allPackingTypes: PackingTypeDetails[] = [];


  //Dropdown Configuration
    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    countryValidationFlag: boolean = false;
    countriesdropdownSettings:IDropdownSettings = {};
    countrydropdownSettings: IDropdownSettings = {};
    countryCodeDropdownSettings: IDropdownSettings = {};
    customerTypesDropdownSettings:IDropdownSettings = {};
    paymentTermsDropdownSettings:IDropdownSettings = {};

    incotermdropdownSettings:IDropdownSettings = {};
    pricingTypedropdownSettings:IDropdownSettings = {};
    palletTypedropdownSettings:IDropdownSettings = {};
    packingTypedropdownSettings:IDropdownSettings = {};


    countryCodeValidationFlag: boolean = false;
    customerTypesValidationFlag: boolean = false;
    paymentTermsValidationFlag: boolean = false;
    selectedCountry: any[] = [];
    selectedCustomerTypes: any[] = [];
    selectedPaymentTerms: any[] = [];

    selectedIncoterms: any[] = [];
    incotermValidationFlag: boolean = false;
    selectedTypeOfPallet: any[] = [];
    typeOfPalletValidationFlag: boolean = false;
    selectedPricePallet: any[] = [];
    pricePalletValidationFlag: boolean = false;
    selectedTypeOfPacking: any[] = [];
    packingTypeValidationFlag: boolean = false;
    customerInfo: any;
    //transportInfo: any;
    //packingInfo: any;

    //Transport and Packing
    transportAndPackingDetails: TransportAndPackingDetails[] = [];
    transportAndPackingDetailsForAnAddress: CustomerTransportAndPackingDetails[]  = [];
    
    //Custom validation for email
    customEmailValidator(control: AbstractControl): ValidationErrors | null {
      const email = control.value;
      if (!email) return null;
      const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
     // const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return EMAIL_REGEX.test(email) ? null : { invalidEmail: true };
    }

    CustomerDetailsByID(customerID: string){
      this.GetAllCustomerDetailsByCustomerID(customerID);
    }


      GetAllCustomerDetailsByCustomerID(customerID: string): void {
        this.customerService.GetAllCustomerDetailsByCustomerID(customerID).subscribe({
          next: (response: GetCustomerDetails) => {
            // Now TypeScript knows response has table1Results and table2Results
           
            this.getallcustomerDetails = response;
        
            const baseDetails = response.table1Results[0];
            this.addressesdetails = response.table2Results;
            console.log('Base Details:',  this.addressesdetails);
            const pocPrimary = response.table1Results.find((p: any) => p.pointOfContactType === 'Primary');
            const pocSales = response.table1Results.find((p: any) => p.pointOfContactType === 'Sales');
            const pocInvoice = response.table1Results.find((p: any) => p.pointOfContactType === 'Invoice');
            const pocPurchase = response.table1Results.find((p: any) => p.pointOfContactType === 'Purchase');
           
      
            this.customerDisplay = {
              companyName: baseDetails.companyName,
              customerType: baseDetails.customerType,
              paymentTerm: baseDetails.paymentTerm,
              postCode: baseDetails.postCode,
              country: baseDetails.country,
              mobileNumber: pocPrimary?.mobileNumber || baseDetails.mobileNumber,
              emailID: pocPrimary?.emailID || baseDetails.emailID,
              pocSales: pocSales?.emailID || '',
              pocInvoice: pocInvoice?.emailID || '',
              pocPurchase: pocPurchase?.emailID || ''
             
              

            };
            console.log('Customer Display:', this.customerDisplay);
          },
          error: (err) => {
            console.error('Error fetching customer details:', err);
            this.responseMessage = `Error: ${err.error?.message || 'Something went wrong.'}`;
          },
        });
      }
    onPaymentTermsSelect(item: any, index: number) {
      if (['8 Days', '14 Days', 'Others'].includes(item.paymentTerm)) {
        this.showDiscountMessage = (item.paymentTerm === '8 Days');
        this.showTextBox = (item.paymentTerm === 'Others');
    
        if (this.selectedPaymentTerms.length > 0) {
          const paymentTermValue = item.paymentTerm === 'Others' ? '' : item.paymentTerm;
          const customerInfoArray = this.form.get('customerInfo') as FormArray;
          customerInfoArray.at(index).get('paymentTerms')?.setValue(paymentTermValue); 
        }
        this.paymentTermsValidationFlag = false;
      } else {
        // Explicitly set showDiscountMessage to false for any other payment term
        this.showDiscountMessage = false;
      }
    }
    onCustomerTypesSelect(item: any,index: number){
      if(this.selectedCustomerTypes.length > 0){
        // this.form.get('customerInfo.customerTypes')?.setValue(item.id);
        this.customerInfo.at(index).get('customerTypeID')?.setValue(item.customerTypeID);
        this.customerTypesValidationFlag = false;
      }
    }
    onCustomerTypesDeSelect(){
      this.customerTypesValidationFlag = true;
      this.selectedCustomerTypes = [];
    }
    onPaymentTermsDeSelect(){
      this.selectedPaymentTerms = [];
      this.paymentTermsValidationFlag = true;
      this.showDiscountMessage = false;
      this.showTextBox = false;
    }
    onCountrySelect(item: any,index: number) {
      if(this.selectedCountry.length > 0){
        this.customerInfo.at(index).get('countryID')?.setValue(item.countryID);
        // this.form.get('countryID')?.setValue(event);
      //this.countryValidationFlag = false;
      }
      this.countryValidationFlag = false;
    }
    onCountryDeSelect() {
      this.countryValidationFlag = true;
     // this.form.get('countryID')?.setValue(event);
      this.selectedCountry = [];
    }
   
    formatTimeToLocal(timeStr: string): string {
      if (!timeStr) return 'Not Available';
      const now = new Date();
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      now.setHours(hours, minutes, seconds || 0);
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    onCountryAddressSelect(item: any, index: number) {
      const addressGroup = this.customerInfo.at(index);
    
      if (addressGroup) {
        addressGroup.get('countryID')?.setValue(item.countryID); 
        addressGroup.get('countryID')?.markAsTouched(); 
        addressGroup.get('countryID')?.updateValueAndValidity(); 
      }
    }
    
    onCountryAddressDeSelect(index: number) {
      const addressGroup = this.customerInfo.at(index);
    
      if (addressGroup) {
        addressGroup.get('countryID')?.setValue(null); 
        addressGroup.get('countryID')?.markAsTouched(); 
        addressGroup.get('countryID')?.updateValueAndValidity(); 
      }
    }
    
    onPOCCountryAddressSelect(item: any, index: number) {
      const addressGroup = this.customerInfo.at(index);
    
      if (addressGroup) {
        addressGroup.get('POCCountryID')?.setValue(item.countryID);
        addressGroup.get('POCCountryID')?.markAsTouched(); 
        addressGroup.get('POCCountryID')?.updateValueAndValidity();
        this.countryValidationFlag = false;
      }
    }
    
    onPOCCountryAddressDeSelect(item: any, index: number) {
      const addressGroup = this.customerInfo.at(index);
    
      if (addressGroup) {
        addressGroup.get('POCCountryID')?.setValue(null); 
        addressGroup.get('POCCountryID')?.markAsTouched(); 
        addressGroup.get('POCCountryID')?.setErrors({ required: true }); 
        addressGroup.get('POCCountryID')?.updateValueAndValidity();
      }
    
      this.countryValidationFlag = true;
    }
    
    onCountryCodeMobileAddressSelect(item: any, index: number) {
      if (item && item.countryDetail) {  
          const countryDetail = item.countryDetail || "";
          const countryCodeMatch = countryDetail.match(/\+\d+/);
          const countryCode = countryCodeMatch ? countryCodeMatch[0] : "";
          if (!countryCode) {
              console.warn(`⚠️ No country code found in countryDetail: ${countryDetail}`);
          }
          this.addressBook.at(index).get('CountryCode')?.setValue(countryCode ? [countryCode] : []);
          this.countryCodeValidationFlag = false;
      } else {
          console.log(`⚠️ No country selected or countryDetail is missing.`);
      }
    }
    onCountryCodeMobileAddressSelectDeSelect  (item:any) {
      this.countryCodeValidationFlag = true;
     // this.form.get('CountryCode')?.setValue(event);
     // this.selectedCountry = [];
      item = null;
    }

   
    onCountryCodeSelect(item: any,index: number) {
      if(this.selectedCountry.length > 0){
        this.pointOfContacts.at(index).get('countryID')?.setValue(item.countryID);
        // this.form.get('countryID')?.setValue(event);
      this.countryCodeValidationFlag = false;
      }
    }
   
    // onCountryCodePOCSelect(item: any, index: number) {
    //   if (this.selectedCountry.length > 0) {
    //     this.pointOfContacts.at(index).get('countryID')?.setValue(item.countryID);
    //     this.countryCodeValidationFlag = false;
    //   }
    // }
   
    onCountryCodePOCSelect(item: any, index: number) {
      if (item && item.countryDetail) {
          const countryDetail = item.countryDetail || "";  
          const countryCodeMatch = countryDetail.match(/\+\d+/);
          const countryCode = countryCodeMatch ? countryCodeMatch[0] : "";  
          if (!countryCode) {
              console.warn(`⚠️ No country code found in countryDetail: ${countryDetail}`);
          }
          // const assignvaluePOc = this.pointOfContacts.at(index).value;
          const Id=this.pointOfContacts.at(index).value.countryID;
          this.pointOfContacts.at(index).get('countryID')?.setValue([countryCode]);
          this.pointOfContacts.at(index).value.countryCode=countryCode;
          this.pointOfContacts.at(index).value.countryID=Id;
          this.selectedCountry[index] = {
              countryID: item.countryID,
              displayText: countryCode ? [countryCode] : []
          };
          this.countryCodeValidationFlag = false;
      } else {
          console.log(`⚠️ No country selected or countryDetail is missing.`);
      }
    }
  //OLD CODEs
    // onCountryCodePOCDeSelect(index: number) {
    //   this.pointOfContacts.at(index).get('countryID')?.setValue(null);
    //   this.pointOfContacts.at(index).get('countryID')?.markAsTouched();
    //   this.countryCodeValidationFlag = true;
    //   this.selectedCountry = this.selectedCountry.filter(country => country.countryID !== this.pointOfContacts.at(index).get('countryID')?.value);
    // }
  
  onCountryCodePOCDeSelect(index: number) {
      const currentCountryID = this.pointOfContacts.at(index).get('countryID')?.value;
      this.pointOfContacts.at(index).get('countryID')?.setValue(null);
      this.pointOfContacts.at(index).get('countryID')?.markAsTouched();
      this.countryCodeValidationFlag = true;
      // Properly remove only the deselected country
      if (currentCountryID) {
          this.selectedCountry = this.selectedCountry.filter(country => country.countryID !== currentCountryID);
      }
  }
    customerpointofcontacts:CustomerPointOfContacts = {
      customerID:'',
      customerName:'',
      mobileNumber:'',
      emailID:'',
      address:'',
      isEnabled: false,
    }
    transportDetails: Transport ={
      incotermID:'',
      typeOfPalletID:'',
      pricingTypeID:'',
      maxPalletHeight:'',
      noOfPallet:'',
    }


   //Multiple Space validation
   sanitizeInput(property: string, index?: number) {
    const control = this.getControl(property, index);
    if (!control) {
      console.error(`🚨 FormControl for ${property} not found at index ${index}!`);
      return;
    }
    if (control.value) {
      const sanitizedValue = control.value.replace(/\s{2,}/g, ' ');
      if (sanitizedValue !== control.value) {
        control.setValue(sanitizedValue, { emitEvent: false });
      }
    }
  }
  
  handlePaste(event: ClipboardEvent, property: string, index?: number) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!pastedText.trim()) {
      console.warn("🚨 Empty paste detected!");
      return;
    }
    const sanitizedText = pastedText.replace(/\s+/g, ' ').trim();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const control = this.getControl(property, index);
    if (!control) {
      console.error(`🚨 FormControl for ${property} not found at index ${index}!`);
      return;
    }
    const currentValue = control.value || '';
    const beforeSelection = currentValue.substring(0, start);
    const afterSelection = currentValue.substring(end);
    const newValue = `${beforeSelection}${sanitizedText}${afterSelection}`.replace(/\s+/g, ' ').trim();
    control.setValue(newValue, { emitEvent: false });
  }
  
  preventMultipleSpaces(event: KeyboardEvent, property: string, index?: number) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const value = input.value;
    if (event.key === ' ' && cursorPosition === 0) {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' && value[cursorPosition - 1] === ' ') {
      event.preventDefault();
      return;
    }
    setTimeout(() => {
      const control = this.getControl(property, index);
      if (control) {
        const cleaned = input.value.replace(/\s{2,}/g, ' ');
        if (cleaned !== control.value) {
          control.setValue(cleaned, { emitEvent: false });
        }
      }
    }, 0);
  }  
  
  private getControl(property: string, index?: number): AbstractControl | null {
    const customerControl = this.form.get(`customerInfo.${property}`);
    if (customerControl) return customerControl;
  
    const pointOfContacts = this.form.get('pointOfContacts') as FormArray;
    if (pointOfContacts && typeof index === 'number' && pointOfContacts.at(index)) {
      const pocControl = pointOfContacts.at(index).get(property);
      if (pocControl) return pocControl;
    }
  
    const addressBook = this.form.get('addressBook') as FormArray;
    if (addressBook && typeof index === 'number' && addressBook.at(index)) {
      const addressControl = addressBook.at(index).get(property);
      if (addressControl) return addressControl;
    }
  
    return null;
  }
  
 //Multiple space validation 
  responseMessage: any;
  userLocale = navigator.language || 'en-US'; // Get the user locale
  numberFormat = new Intl.NumberFormat(this.userLocale);
  hiddenAddressID: string[] = []; // ✅ Define the type explicitly

  customerAddressForTransportAndPacking: CustomerAddressForTransportAndPacking[] = [];
    constructor(private cdr: ChangeDetectorRef,private fb: FormBuilder, route: ActivatedRoute, private router: Router) {
      this.filteredCustomers = this.allCustomerDetails;
      this.route = route;
       //this.filteredCustomers = this.customerPointOfContacts;
       //jan 08
       this.form = this.fb.group({
        customerInfo: this.fb.group({
          customerName: ['', Validators.required],
          address: ['', Validators.required],
          city: ['', Validators.required],
          //state: ['', Validators.required],
          customerTypes: [null, Validators.required],
          emailId: ['', [Validators.required, Validators.email]],
          mobileNumber: ['', Validators.required],
          postCode:['', Validators.required],
          country:['', Validators.required],
          paymentTerms: [''],
          paymentTermsForOthers : [''],
          //paymentTerms:['', Validators.required],
          name:['', Validators.required],
        }),
        pointOfContacts: this.fb.array(this.contactLabels.map((label, index) => this.createContactFormGroup(index))),
       // pointOfContacts: this.fb.array(this.contactLabels.map(label => this.createContactFormGroup(label))),
         addressBook: this.fb.array([this.createAddressFormGroup()]),
         locationForm: this.createLocationFormGroup(),
          transportInfo: this.createTransportFormGroup(),
          packingInfo: this.createPackingFormGroup()
      });
      // this.addLocationCheckboxes();
      // this.setupListeners();
       //jan 08
       this.initializeSelectedLocations();
       // 👉 Fix red validation highlight for non-primary contacts
        const contactsArray = this.form.get('pointOfContacts') as FormArray;
        contactsArray.controls.forEach((contact, index) => {
          const isPrimary = this.contactLabels[index]?.name === 'Primary';
          if (!isPrimary) {
            contact.get('name')?.markAsUntouched();
            contact.get('emailId')?.markAsUntouched();
            contact.get('mobileNumber')?.markAsUntouched();
            contact.get('countryID')?.markAsUntouched();
            contact.get('countryCode')?.markAsUntouched();
          }
        });
     }
    
     //pointofcontacts
     createContactFormGroup(index: number): FormGroup {
        const isPrimary = this.contactLabels[index]?.name === 'Primary'; // or use .type

        return this.fb.group({
          contactType: [this.contactLabels[index]?.name, Validators.required],
          name: ['', isPrimary ? Validators.required : []],
          emailId: ['', isPrimary ? [Validators.required, Validators.email, this.customEmailValidator] : [Validators.email, this.customEmailValidator]],
          mobileNumber: ['', isPrimary ? [Validators.required, Validators.minLength(8)] : []],
          countryID: ['', isPrimary ? Validators.required : []],
          countryCode: ['', isPrimary ? Validators.required : []]
        });
      }
    //  createContactFormGroup(index: number): FormGroup {
    //   return this.fb.group({
    //     contactType: [this.contactLabels[index]?.name, Validators.required], // Assign contactType based on index
    //    // contactType: [label, Validators.required],
    //     name: ['', Validators.required],
    //     emailId: ['', [Validators.required, Validators.email, this.customEmailValidator]],
    //     mobileNumber: ['', [Validators.required,Validators.minLength(10)]],
    //     countryID:['', Validators.required],
    //     countryCode:['',Validators.required]
    //   });
    // }
     //Addrss
    //  createAddressFormGroup(): FormGroup {
    //   return this.fb.group({
    //     addressHeading: ['', Validators.required],
    //     address: ['', Validators.required],
    //     city: ['', Validators.required],
    //     state: ['', Validators.required],
    //     countryID: ['', Validators.required],
    //     postCode: ['', Validators.required],
    //     POCName: ['', Validators.required],
    //     POCEmail: ['', [Validators.required, Validators.email]],
    //     POCMobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
    //    // POCMobile: ['', Validators.required],
    //     POCCountryID:['', Validators.required],
    //     CountryCode:['', Validators.required],
    //   });
    // }
    createAddressFormGroup(): FormGroup {
      const netherlands = this.allCountries.find(
        (c) => c.country?.toLowerCase() === 'netherlands'
      );
    
      const defaultCountry = netherlands ? [{ countryID: netherlands.countryID, country: netherlands.country, countryDetail:netherlands.countryDetail }] : [];
    
      return this.fb.group({
        addressHeading: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        //state: ['', Validators.required],
        countryID: [defaultCountry, Validators.required], // Set default country here
        postCode: ['', Validators.required],
        POCName: ['', Validators.required],
        POCEmail: ['', [Validators.required, Validators.email,this.customEmailValidator]],
        POCMobile: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
       // POCCountryID: [defaultCountry, Validators.required], // Set default country here
        CountryCode: [netherlands ? [netherlands.countryCode] : [], Validators.required], // Set default country code here
      });
    }

    //Location
    createLocationFormGroup(): FormGroup {
      return this.fb.group({
        allLocations: [false], // Controls the "All Locations" checkbox
        selectedLocations: this.fb.array([]) // Holds individual location checkboxes
      });
    }
    // Transport
    createTransportFormGroup(): FormGroup {
      return this.fb.group({
        incoterm: [null, Validators.required],
        typeOfPallet: [null, Validators.required],
        pricingType: [null, Validators.required],
        maxPalletHeight: ['', Validators.required],
        // price: [''],
        transportationCost: ['', Validators.required], // show only when any location (checkbox) is not selected // commenting for now
        noOfPallet: [''],
        firstLoadingTime: [''],
        lastLoadingTime: [''],
        transportCosts: this.fb.array([]) // Holds transport costs for selected locations
      });
    }

    // Packing
    createPackingFormGroup(): FormGroup {
      return this.fb.group({
        //palletType: [null, Validators.required],
        packingType: [null, Validators.required],
        noOfBoxesPerPallet: ['', Validators.required],
        noOfPiecesPerRow: [''],
        noOfRowsOnTop: [''],
        //packingCost: [0, Validators.required],
        //Below fields are for Packing options
        isCardboardLayerPad: [false],
        isPlasticBagForBigBox: [false],
        isDoubleStacked: [false],
        is1By8PalletBag: [false],

        selectedPackingTypeIDs: [''], // This will store selected packingTypeIDs as comma-separated values
        packingOptions: this.fb.array([]) // Dynamic checkboxes for packing options
      });
    }
    get pointOfContacts(): FormArray {
      return this.form.get('pointOfContacts') as FormArray;
    }
    get addressBook(): FormArray {
      return this.form.get('addressBook') as FormArray;
    }
    get selectedLocations(): FormArray {
      return this.form.get('locationForm.selectedLocations') as FormArray;
    }
  
    get transportInfo(): FormGroup {
      return this.form.get('transportInfo') as FormGroup;
    }
    get transportCosts(): FormArray {
      return this.form.get('transportInfo.transportCosts') as FormArray;
    }

    get packingInfo(): FormGroup {
      return this.form.get('packingInfo') as FormGroup;
    }
    addLocationCheckboxes() {
      this.customerAddressForTransportAndPacking.forEach(() => this.selectedLocations.push(this.fb.control(false)));
    }
  
    setupListeners() {
      // Listener for "All Locations" checkbox
      this.locationForm.get('allLocations')?.valueChanges.subscribe((checked) => {
        this.selectedLocations.controls.forEach(control => control.setValue(checked));
      });
  
      // Listener for individual checkboxes
      this.selectedLocations.valueChanges.subscribe((values) => {
        const allChecked = values.every((v: boolean) => v);
        this.locationForm.get('allLocations')?.setValue(allChecked, { emitEvent: false });
      });
    }
    addAddress(): void {
      this.addressBook.push(this.createAddressFormGroup());
    }
  
    removeAddress(index: number): void {
      this.addressBook.removeAt(index);
    }
  
     //Address
   
     prepareModal() {
      this.showTransportAndPackingInfoMessage = false;
      this.selectedCustomer = null;
      this.showTextBox = false;
      this.activeTab = 1; // Reset to first tab when modal opens
      this.form.reset();
      
      const netherlands = this.allCountries.find(
        (c) => c.country?.toLowerCase() === 'netherlands'
      );
    
      // Reset the addressBook FormArray
      const addressBookFormArray = this.form.get('addressBook') as FormArray;
      addressBookFormArray.clear(); // ✅ Clear old addresses
      addressBookFormArray.push(this.createAddressFormGroup()); // ✅ Add one fresh address form


      if (netherlands) 
      {
        this.form.get('customerInfo.country')?.patchValue([{ countryID: netherlands.countryID, country: netherlands.country }]);
        
        // Assuming the form structure
        // const pointOfContactsFormArray = this.form.get('pointOfContacts') as FormArray;
        // pointOfContactsFormArray.controls.forEach(control => {
        //   control.get('countryID')?.patchValue([netherlands.countryCode]);
        // });
    
        // const addressBookFormArray = this.form.get('addressBook') as FormArray;
        // addressBookFormArray.controls.forEach(control => {
        //   control.get('countryID')?.patchValue([netherlands.country,netherlands.countryCode]);
        // });
        const addressBookFormArray = this.form.get('addressBook') as FormArray;
        addressBookFormArray.controls.forEach(control => {
          control.get('countryID')?.patchValue([{ countryID: netherlands.countryID, country: netherlands.country }]);
          control.get('POCCountryID')?.patchValue([{ countryID: netherlands.countryID, countryDetail: netherlands.countryDetail }]);
          control.get('CountryCode')?.patchValue([netherlands.countryCode]);
       });
    
        console.log('Netherlands set as default:', netherlands);
      } else {
        console.warn('Netherlands not found in country list');
      }
    }
    // addAllPointOfContacts(): void {
    //   const contacts = this.form.get('pointOfContacts') as FormArray;
    //   contacts.clear(); // Clear existing contacts
    //   this.contactLabels.forEach((label, index) => {
    //     contacts.push(this.createContactFormGroup(index)); // Add a new contact form group for each label
    //   });
    // }
    // saveCustomerAndChangeTab(): void {
    async setActiveTab(tabNumber: number) {
      const customerInfo = this.form.get('customerInfo');
  
      const hasUnsavedChanges = this.isEditing && 
        JSON.stringify(customerInfo?.value) !== this.initialCustomerInfoState;
  
      if (tabNumber === 2 && !this.isCustomerInfoSaved && hasUnsavedChanges) {
        const userConfirmed = confirm('Please save the customer details first.');
  
        if (userConfirmed) {
          try {
            await this.saveAndAddAddress();
            this.isCustomerInfoSaved = true;
            this.initialCustomerInfoState = JSON.stringify(customerInfo?.value); 
            this.activeTab = tabNumber;
          } catch (error) {
            console.error('Error while saving customer details:', error);
            alert('An error occurred while saving customer details.');
          }
        }
      } else {
        this.activeTab = tabNumber;
      }
      
    }
    
    disableTransportAndPackingTab: boolean = true;
    // Loading Customer Addresses in Transport and Packing Tab
    loadCustomerAddresses(): void {
      this.clearAllFieldsInTransportAndPacking();
      this.allPackingTypes=[];
     
      this.customerService.getCustomerAddresses(this.customerID).subscribe({
        next: (response) => {
          console.log('Customer Addresses:', response);
          if(response){

       
            this.customerAddressForTransportAndPacking = response;
            //this.addresseIDsFromAPIResponse = response.map((address: any) => address.addressID);
            if(this.isEditingMode){
              const customerAllAddressIDs = response.map((address: any) => address.addressID).join(',');
              const requestBody = {
                addressIDs: customerAllAddressIDs
              }
              if(customerAllAddressIDs){
                this.customerService.getTransportAndPackingDetails(requestBody).subscribe({
                  next: (response) => {
                    this.addresseIDsFromAPIResponse = response.map((address: any) => address.addressID);
                   
                  },
                  error: (error) => {
                    console.error('Error loading transport and packing details:', error);
                  }
                });
              }
            }
            this.disableTransportAndPackingTab = false;
            this.setActiveTab(3);
            this.initializeSelectedLocations();

            
            // Listen for "All Locations" checkbox changes
            this.form.get('locationForm.allLocations')?.valueChanges.subscribe((checked) => {
              this.selectedLocations.controls.forEach(control => control.setValue(checked));
            this.updateSelectedLocations(checked);
            this.loadTransportAndPackingDetailsForAnAddress(this.getSelectedAddressIDsForTransportAndPacking());
           
            });

            // Listen for individual checkboxes and update "All Locations" checkbox
            this.selectedLocations.valueChanges.subscribe((values) => {
              const allChecked = values.every((v: boolean) => v);
              this.form.get('locationForm.allLocations')?.setValue(allChecked, { emitEvent: false });
            this.updateTransportCostFields();
            const selectedAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
          
            });
           
           
          }
          else{
            this.disableTransportAndPackingTab = true;
          }
        },
        error: (error) => {
          this.disableTransportAndPackingTab = true;
          console.error('Error loading customer addresses:', error);
        }
      });
    }

    afraz(){
      this.form.get('locationForm.allLocations')?.valueChanges.subscribe((checked) => {
              this.selectedLocations.controls.forEach(control => control.setValue(checked));
            this.updateSelectedLocations(checked);
       });
        this.selectedLocations.valueChanges.subscribe((values) => {
              const allChecked = values.every((v: boolean) => v);
              this.form.get('locationForm.allLocations')?.setValue(allChecked, { emitEvent: false });
            this.updateTransportCostFields();
        });
    }
    getPostCodeByAddressID(addressID: string) {
      const address = this.customerAddressForTransportAndPacking.find((address) => address.addressID === addressID);
      return address?.postCode;
    }
    // This function initializes the selectedLocations FormArray
    initializeSelectedLocations() {
      const selectedLocationsArray = this.form.get('locationForm.selectedLocations') as FormArray;
      selectedLocationsArray.clear(); // Clear existing controls if any

      if (this.customerAddressForTransportAndPacking?.length) {
        this.customerAddressForTransportAndPacking.forEach(() => {
          selectedLocationsArray.push(this.fb.control(false)); // Add a FormControl for each address
        });
      }
      
    }
    // Function to update selected locations based on "All Locations" checkbox
    updateSelectedLocations(selectAll: boolean) {
      this.selectedLocations.controls.forEach((control) => control.setValue(selectAll));
      this.updateTransportCostFields();
    }

    // Function to update transport cost fields when locations are checked/unchecked
    updateTransportCostFields() {
      
      const selectedAddressIDs = this.customerAddressForTransportAndPacking
      .filter((_, idx) => this.selectedLocations.at(idx)?.value) // Get selected locations
      .map(address => address.addressID);

      // Remove transport costs for unchecked locations
      for (let i = this.transportCosts.length - 1; i >= 0; i--) {
        const control = this.transportCosts.at(i);
        if (!selectedAddressIDs.includes(control.value?.addressID)) {
          this.transportCosts.removeAt(i);
        }
      }

      // Add transport costs for newly checked locations
      this.customerAddressForTransportAndPacking.forEach((address, idx) => {
        if (this.selectedLocations.at(idx).value && 
            !this.transportCosts.controls.some(control => control.value?.addressID === address.addressID)) {
          this.transportCosts.push(this.createTransportCostFormGroup(address));
        }
      });
      
      if(this.transportCosts.length > 0){
        this.isAnyAddressSelected = true;
        // Remove required validation for transportation cost field
        this.form.get('transportInfo.transportationCost')?.clearValidators();
        //this.form.get('transportInfo.transportationCost')?.patchValue(null);
      }
      else{
        this.isAnyAddressSelected = false;
        // Add required validation for transportation cost field
        this.form.get('transportInfo.transportationCost')?.setValidators([Validators.required]);
      }
      this.form.get('transportInfo.transportationCost')?.updateValueAndValidity();
    }
    
    
    // Create transport cost form group for each selected address
    createTransportCostFormGroup(address: any): FormGroup {
      //console.log('Afraz Address:', address);
      return this.fb.group({
        addressID: [address.addressID], // Store the address ID for reference
        transportationCost: ['', Validators.required] // Input field for cost
      });
    }
    fetchTransportationCostForSelectedLocations(){
      const requestBody = {
        addressIDs: this.getSelectedAddressIDsForTransportAndPacking(),
        incoterm: this.selectedIncotermName,
        typeOfPallet: this.selectedTypeOfPalletName,
        noOfPallets: this.form.get('transportInfo.noOfPallet')?.value ? this.form.get('transportInfo.noOfPallet')?.value : 0,
      };
      this.getTransportCostForSelectedAddress(requestBody);
    }
    getTransportCostForSelectedAddress(requestBody: any) {
      this.customerService.getTransportCostForSelectedAddress(requestBody).subscribe({
        next: (response) => {
          this.transportCostDetailsForSelectedAddress = response;
          let toastrShown = false; // Flag to track if toastr is shown
          if (response) {
            response.forEach((costData: any) => {
              const control = this.transportCosts.controls.find(ctrl => ctrl.get('addressID')?.value === costData.addressID);
              if (control) {
                // show only one toastr message if costData.transportationCost is 0 for any address
               // Show toastr only once if transportationCost is 0
              if (costData.transportationCost === 0 && !toastrShown) {
                this.toastr.warning("Transportation cost is 0 for one or more addresses.", "Warning",{
                  progressBar: true,
                  closeButton: true,
                });
                toastrShown = true;
              }
                control.patchValue({ transportationCost: this.formatBasedOnLocale(costData.transportationCost) });
              }
            });
          } else {
            console.warn("Invalid response for transport costs.");
          }
        },
        error: (error) => {
          console.error('Error calculating transportation cost:', error);
          this.toastr.error('Error calculating transportation cost', 'Error',{
            progressBar: true,
            closeButton: true
          });        }
      });

    }
    restrictToNumbersWithCommaAndPoint(event: KeyboardEvent) {
      const charCode = event.charCode ? event.charCode : event.keyCode;
      // Allow numbers (48-57), comma (44), and dot (46)
      if ((charCode < 48 || charCode > 57) && charCode !== 44 && charCode !== 46) {
        event.preventDefault(); // Prevent non-numeric, non-comma, and non-dot characters
      }
      const allowedChars = /[0-9.,]/;
      if (!allowedChars.test(event.key)) {
        event.preventDefault();
     
    }
    }
   
    showCalculateTransportationButton(): boolean {
      // if(this.selectedIncotermName != '' && this.selectedTypeOfPalletName != '' && this.form.get('transportInfo.noOfPallet')?.value){
      //   return true;
      // }
      // return false;
      if(this.selectedIncotermName != '' && this.selectedIncotermName == 'DAP (Delivery at Place)' ){
        return true;
      }
      return false;
    }
    clearAllTransportationCostFields() {
      this.transportCosts.controls.forEach(control => {
        control.get('transportationCost')?.patchValue('');
      });
    }
    onIncotermSelect(item: any) {
      if(item){
         this.clearAllTransportationCostFields();
        this.selectedIncotermName = item.incoterm;
      // this.showPriceTextBox = !(item.incoterm === 'DAP (Delivery at Place)');
      // if(this.showPriceTextBox){
      //   this.form.get('transportInfo.price')?.setValidators([Validators.required]);
      // }
      // else {
      //   this.form.get('transportInfo.price')?.clearValidators();
      //   this.form.get('transportInfo.price')?.patchValue(null);
      // }
      // this.form.get('transportInfo.price')?.updateValueAndValidity(); // Important!
      this.incotermValidationFlag = false;
      //this.fetchTransportationCostForSelectedLocations();
      }
    }
    onIncotermDeSelect(item: any){
      this.clearAllTransportationCostFields();
     
      this.selectedIncotermName = '';
      //this.showPriceTextBox = !(item.incoterm === 'DAP (Delivery at Place)');
      // this.showPriceTextBox = false;
      // if(!this.showPriceTextBox){
      //   this.form.get('transportInfo.price')?.clearValidators();
      //   this.form.get('transportInfo.price')?.patchValue(null);
      // }
      // this.form.get('transportInfo.price')?.updateValueAndValidity(); // Important!
      this.incotermValidationFlag = true;
      item = null;
    }

    onTypeOfPalletSelect(item: any) {
      if(item){
        this.clearAllTransportationCostFields();
        this.selectedTypeOfPalletName = item.typeOfPallet;
         // Code related to Dynamic Packing Options Starts Here
        // const typeOfPallet = this.selectedTypeOfPalletName === 'Plastic Pallet' || this.selectedTypeOfPalletName === 'Returnable Pallet' ? this.selectedTypeOfPalletName : null;
        // if(this.selectedTypeOfPackingID){
        // this.getPackingTypesByTypeOfPackingID(typeOfPallet, this.selectedTypeOfPackingID);
        // }
        this.showOrHidePackingCheckboxes(this.selectedTypeOfPalletName, this.selectedTypeOfPackingID);
         // Code related to Dynamic Packing Options Ends Here
        this.typeOfPalletValidationFlag = false;
        this.selectedTypeOfPallet = this.allTypesOfPallet.filter(pallet => pallet.typeOfPalletID === item.typeOfPalletID);
        // this.form.get('packingInfo.packingCost')?.patchValue(this.selectedTypeOfPallet[0].cost);
       
        //this.form.get('transportInfo.noOfPallet')?.patchValue(null);
        this.showNoOfPalletTextBox = (this.selectedPricePallet.length > 0 && this.selectedTypeOfPallet.length > 0) || (this.transportAndPackingDetailsForAnAddress[0]?.pricingType && this.transportAndPackingDetailsForAnAddress[0].typeOfPallet) ? true : false;
        //this.showNoOfPalletTextBox = true;
        if(this.showNoOfPalletTextBox){
          this.form.get('transportInfo.noOfPallet')?.setValidators([Validators.required, Validators.min(1)]);
          //this.selectedPricePalletName = item.pricingType ?? this.transportAndPackingDetailsForAnAddress[0].pricingType;
        }
        else {
          this.form.get('transportInfo.noOfPallet')?.clearValidators();
          this.form.get('transportInfo.noOfPallet')?.patchValue(null);
        }
        this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
        const placeholderMapping: Record<string, Record<string, string>> = {
          'Full Truck': { 'Block Pallet': 'Enter between 1 - 26', otherPallets: 'Enter between 1 - 33' },
          'Half Truck': { 'Block Pallet': 'Enter between 1 - 12', otherPallets: 'Enter between 1 - 16' }
        };
        
        const pricingType = this.selectedPricePalletName;
        const palletType = this.selectedTypeOfPalletName === 'Block Pallet' ? 'Block Pallet' : 'default';
        
        this.placeholderForNoOfPalletField = placeholderMapping[pricingType]?.[palletType] ?? '';
        const palletMapping: Record<string, Record<string, number>> = {
          'Full Truck': { 'Block Pallet': 26, otherPallets: 33 },
          'Half Truck': { 'Block Pallet': 12, otherPallets: 16 }
        };
        
        const noOfPallet = palletMapping[this.selectedPricePalletName]?.[this.selectedTypeOfPalletName ==='Block Pallet' ? 'Block Pallet' : 'otherPallets' ] ?? 1;
        this.form.get('transportInfo.noOfPallet')?.patchValue(noOfPallet);
        //this.calculatePackingCost();
        //this.fetchTransportationCostForSelectedLocations();

      }
    }
    onTypeOfPalletDeSelect(item: any){
      this.clearAllTransportationCostFields();
      this.selectedTypeOfPalletName = '';
      this.typeOfPalletValidationFlag = true;
      item = null;
      this.selectedTypeOfPallet = [];
      this.showNoOfPalletTextBox = false;
    }

    onPricePalletSelect(item: any) {
      if(item){
        this.clearAllTransportationCostFields();
        // this.showNoOfPalletTextBox = (item.pricingType === 'Price per Pallet');
        // if(this.showNoOfPalletTextBox){
        //   this.form.get('transportInfo.noOfPallet')?.setValidators([Validators.required, Validators.min(1), Validators.max(32)]);
        // }
        // else {
        //   this.form.get('transportInfo.noOfPallet')?.clearValidators();
        //   this.form.get('transportInfo.noOfPallet')?.patchValue(null);
        // }
        // this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
        this.selectedPricePallet = this.allPricingTypes.filter(pricePallet => pricePallet.pricingTypeID === item.pricingTypeID);
        this.showNoOfPalletTextBox = (this.selectedPricePallet.length > 0 && this.selectedTypeOfPallet.length > 0) || (this.transportAndPackingDetailsForAnAddress[0]?.pricingType && this.transportAndPackingDetailsForAnAddress[0]?.typeOfPallet) ? true : false;
        //this.showNoOfPalletTextBox = true;
        if(this.showNoOfPalletTextBox){
          this.form.get('transportInfo.noOfPallet')?.setValidators([Validators.required, Validators.min(1)]);
          this.selectedPricePalletName = item.pricingType;
        }
        else {
          this.form.get('transportInfo.noOfPallet')?.clearValidators();
          this.form.get('transportInfo.noOfPallet')?.patchValue(null);
        }
        this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
        const palletMapping: Record<string, Record<string, number>> = {
          'Full Truck': { 'Block Pallet': 26, otherPallets: 33 },
          'Half Truck': { 'Block Pallet': 12, otherPallets: 16 }
        };
        
        const pricingType = item.pricingType;
        const palletType = this.selectedTypeOfPalletName === 'Block Pallet' ? 'Block Pallet' : 'otherPallets';
        
        this.placeholderForNoOfPalletField = `Enter between 1 - ${palletMapping[pricingType]?.[palletType] ?? 33}`;
        const noOfPallet = palletMapping[pricingType]?.[palletType] ?? 1;
        this.form.get('transportInfo.noOfPallet')?.patchValue(noOfPallet);
        //check no of pallet field has value
        // if(this.form.get('transportInfo.noOfPallet')?.value){
        //   const packingCostValue = parseInt(this.form.get('packingInfo.packingCost')?.value);
        //   const noOfPalletValue = parseInt(this.form.get('transportInfo.noOfPallet')?.value);
        //   this.form.get('packingInfo.packingCost')?.patchValue(packingCostValue * noOfPalletValue);
        // }
        // this.calculatePackingCost();
        this.pricePalletValidationFlag = false;
      }
    }
    onPricePalletDeSelect(item: any){
      this.clearAllTransportationCostFields();
      //this.showNoOfPalletTextBox = !(item.pricingType === 'Price per Pallet');
      this.selectedPricePallet = [];
      this.showNoOfPalletTextBox = false;
      this.selectedPricePalletName = '';
      if(!this.showNoOfPalletTextBox){
        this.form.get('transportInfo.noOfPallet')?.clearValidators();
        this.form.get('transportInfo.noOfPallet')?.patchValue(null);
      }
      this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
      //this.form.get('transportInfo.noOfPallet')?.setValue(null);
      this.pricePalletValidationFlag = true;
      item = null;
    }

    onPackingTypeSelect(item: any) {
      if(item)
      {
        // Code related to Dynamic Packing Options Starts Here
        this.showOrHidePackingCheckboxes(this.selectedTypeOfPalletName, item.typeOfPackingID);
        
        // Code related to Dynamic Packing Options Ends Here

        // Code related to Static Packing Options Starts Here
        // this.showCardboardLayerPadCheckbox = (item.typeOfPacking === 'BOX-001' || item.typeOfPacking === 'Export Box With LID' || item.typeOfPacking === 'BOX-001 with LID' || item.typeOfPacking === 'BOX-002 40DG' || item.typeOfPacking === 'BOX-003 48DG' || item.typeOfPacking === 'BOX-006 55DG' || item.typeOfPacking === 'BOX-004 60DG');

        // this.showPlasticBigBoxCheckbox = (item.typeOfPacking === 'BOX-001' || item.typeOfPacking === 'Export Box With LID' || item.typeOfPacking === 'BOX-001 with LID' || item.typeOfPacking === 'LID-001');

        // this.show1By8PalletBagCheckbox = (item.typeOfPacking === 'BOX-002 40DG' || item.typeOfPacking === 'BOX-003 48DG' || item.typeOfPacking === 'BOX-006 55DG' || item.typeOfPacking === 'BOX-004 60DG' || item.typeOfPacking === 'LID-001');

        // this.showDoubleStackedCheckbox = (item.typeOfPacking === 'BOX-001' || item.typeOfPacking === 'Export Box With LID' || item.typeOfPacking === 'BOX-001 with LID' || item.typeOfPacking === 'LID-001');

        // Code related to Static Packing Options Ends Here

        // Code to clear the checkbox options
        this.form.get('packingInfo')?.patchValue({ is1By8PalletBag: false, isCardboardLayerPad: false, isDoubleStacked: false, isPlasticBagForBigBox: false });

        this.showOrHideNoOfPiecesPerRowAndNoOfRowsOnTop(item.typeOfPacking);
      
        if(item.typeOfPacking === 'BOX-001' || item.typeOfPacking === 'Export Box With LID' || item.typeOfPacking === 'BOX-001 with LID' || item.typeOfPacking === 'LID-001')
        {
          this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(1);
        }
        else{
          this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(null);
        }
        // this.calculatePackingCost();
        this.calculateNoOfBoxes();
      }
    }
    onPackingTypeDeSelect(item: any){
      this.allPackingTypes = [];
      this.selectedTypeOfPackingID = '';
      this.showNoOfBoxesPerPallet = false;
      this.showNoOfPiecesPerRow = false;
      this.showNoOfRowsOnTop = false;
      this.packingTypeValidationFlag = true;
      item = null;
      this.calculateNoOfBoxes();
    }
    showOrHideNoOfPiecesPerRowAndNoOfRowsOnTop(typeOfPacking: string){
      this.showNoOfPiecesPerRow = (typeOfPacking === 'BOX-002 40DG' || typeOfPacking === 'BOX-003 48DG' || typeOfPacking === 'BOX-006 55DG' || typeOfPacking === 'BOX-004 60DG');
      if(this.showNoOfPiecesPerRow){
        this.form.get('packingInfo.noOfPiecesPerRow')?.setValidators([Validators.required]);
      }
      else {
        this.form.get('packingInfo.noOfPiecesPerRow')?.clearValidators();
        this.form.get('packingInfo.noOfPiecesPerRow')?.patchValue(null);
        this.form.get('packingInfo.noOfPiecesPerRow')?.markAsPristine();
        this.form.get('packingInfo.noOfPiecesPerRow')?.markAsUntouched();
        this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsPristine();
        this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsUntouched();
      }
      this.form.get('packingInfo.noOfPiecesPerRow')?.updateValueAndValidity(); // Important!
      this.showNoOfRowsOnTop = (typeOfPacking === 'BOX-002 40DG' || typeOfPacking === 'BOX-003 48DG' || typeOfPacking === 'BOX-006 55DG' || typeOfPacking === 'BOX-004 60DG');
      this.packingTypeValidationFlag = false;
      if(this.showNoOfRowsOnTop){
        this.form.get('packingInfo.noOfRowsOnTop')?.setValidators([Validators.required]);
      }
      else {
        this.form.get('packingInfo.noOfRowsOnTop')?.clearValidators();
        this.form.get('packingInfo.noOfRowsOnTop')?.patchValue(null);
        this.form.get('packingInfo.noOfRowsOnTop')?.markAsPristine();
        this.form.get('packingInfo.noOfRowsOnTop')?.markAsUntouched();
        this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsPristine();
        this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsUntouched();
      }
      this.form.get('packingInfo.noOfRowsOnTop')?.updateValueAndValidity(); // Important!
    }
    showOrHidePackingCheckboxes(selectedTypeOfPalletName: string, typeOfPackingID: string, data?: any){

        this.selectedTypeOfPackingID = typeOfPackingID;
        this.selectedTypeOfPacking = this.allTypesOfPacking.filter(packing => packing.typeOfPackingID === typeOfPackingID);
        const typeOfPallet = selectedTypeOfPalletName === 'Plastic Pallet' || selectedTypeOfPalletName === 'Returnable Pallet' ? selectedTypeOfPalletName : null;
        this.getPackingTypesByTypeOfPackingID(typeOfPallet, this.selectedTypeOfPackingID, data);
      
    }
    calculatePackingCost() {
      this.form.get('packingInfo.packingCost')?.patchValue(0);
      const typeOfPalletValue = this.selectedTypeOfPallet.length > 0 ? parseFloat(this.selectedTypeOfPallet[0].cost) : 0;
      const noOfPalletValue = this.form.get('transportInfo.noOfPallet')?.value ? parseInt(this.form.get('transportInfo.noOfPallet')?.value) : 1;
      const typeOfPackingValue = this.selectedTypeOfPacking.length > 0 ? parseFloat(this.selectedTypeOfPacking[0].pricePer1000) : 0;
      let selectedPackingOptionsTotalCost = 0;
      const noOfBoxesPerPallet = this.form.get('packingInfo.noOfBoxesPerPallet')?.value ? parseInt(this.form.get('packingInfo.noOfBoxesPerPallet')?.value) : 1;
      const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
      
      // packingOptionsArray.controls.forEach(control => {
      //   if (control.get('checked')?.value) {
      //     let costValue = parseFloat(control.get('cost')?.value || 0);
      //     selectedPackingOptionsCost += costValue;
      //   }
      // });

      // if control.get('name')?.value === 'isCardboardLayerPad' && control.get('checked')?.value multiply by no of pallets else no of boxes
      if(packingOptionsArray.length > 0 ){
        packingOptionsArray.controls.forEach(control => {
          if (control.get('checked')?.value) {
            let costValue = parseFloat(control.get('cost')?.value || 0);
            if(control.get('name')?.value === 'Cardboard layer pad (2 per pallet)'){
              selectedPackingOptionsTotalCost += costValue * noOfPalletValue;
            }
            else{
              selectedPackingOptionsTotalCost += costValue * noOfBoxesPerPallet;
            }
          }
        });
      }
      //console.log('Selected Packing Options Cost:', selectedPackingOptionsTotalCost);
      
      this.form.get('packingInfo.packingCost')?.patchValue((typeOfPalletValue * noOfPalletValue) + (typeOfPackingValue * noOfPalletValue) + selectedPackingOptionsTotalCost);
    }
    calculateNoOfBoxes(){
      const noOfPiecesPerRow = parseInt(this.form.get('packingInfo.noOfPiecesPerRow')?.value);
      const noOfRowsOnTop = parseInt(this.form.get('packingInfo.noOfRowsOnTop')?.value);
      if(noOfPiecesPerRow && noOfRowsOnTop){
      const noOfBoxes = noOfPiecesPerRow * noOfRowsOnTop;
      this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(noOfBoxes);
      }
      else if((this.showNoOfPiecesPerRow && this.showNoOfRowsOnTop) && (isNaN(noOfPiecesPerRow) || isNaN(noOfRowsOnTop))){
        this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(null);
      }
      else if(this.form.get('packingInfo.noOfRowsOnTop')?.value == 0){
        this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(noOfPiecesPerRow);
      }
    }

    //OLD CODE before adding popup
    //  setActiveTab(tabNumber: number) {
    //   if (tabNumber === 2 && !this.isCustomerInfoSaved) {
    //     const userConfirmed = confirm('Please save the customer details first.');
    // if (userConfirmed) {
    //   this.saveCustomerAndChangeTab();
    //   this.activeTab = tabNumber; 
    // }
    //   }
    //   else{
    //     this.activeTab = tabNumber;
    //   }
    //  // this.activeTab = tabNumber;
    //   if(tabNumber === 1){
    //     const customerInfo = this.form.get('customerInfo')?.value;
    //     if (customerInfo) {
    //       this.form.get('customerInfo.customerName')?.setValue(customerInfo.customerName);
    //       this.form.get('customerInfo.customerTypes')?.setValue(customerInfo.customerTypes);
    //       // Set more fields if needed
    //     }
    //   }
    // }
    //2nd tab
    // saveAddresses(): void {
    //   // Extract and process POCCountryID from addressBook
    //   const requestBody = this.form.value.addressBook.map((address: any) => {
    //     const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
    //       ? address.POCCountryID[0].countryID // Extract countryID from the array
    //       : null; 
    //     const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
    //       ? address.countryID[0].countryID // Extract countryID from the first element in the array
    //       : address.countryID; 
    
    //     const updatedAddress = {
    //       ...address,
    //       AddressHeading: address.AddressHeading?.substring(0, 50),
    //       Address: address.Address?.substring(0, 250),
    //       City: address.City?.substring(0, 50),
    //       State: address.State?.substring(0, 50),
    //       POCEmail: address.POCEmail?.substring(0, 120),
    //       POCMobile: address.POCMobile?.substring(0, 120),
    //       POCCountryID: pocCountryID,
    //       countryID: countryID         
    //     };
    
    //     // Optionally remove any fields you don't want to send, e.g., remove the countryID if it's null
    //     if (updatedAddress.countryID === null) {
    //       delete updatedAddress.countryID;
    //     }
    
    //     // Log the updated address for verification
    //     console.log('Updated Address:', updatedAddress);
    
    //     return updatedAddress;
    //   });
    
    //   // Determine if we need to add or update
    //   const hasExistingAddress = requestBody.some((address: any) => address.addressID && address.addressID.trim() !== '');
      
    //   if (hasExistingAddress) {
    //     // If any address has a valid AddressID, perform an update
    //     this.customerService.updateAddresses(requestBody, this.customerID, this.userID).subscribe(
    //       response => {
    //         console.log('Addresses updated successfully:', response);
    //         this.toastr.success('Address Updated Successfully', 'Success',{
    //           progressBar: true
    //         });
    //         this.form.reset();
    //         this.closeModal();
    //         this.getAllCustomers();
    //       },
    //       error => {
    //         console.error('Error updating addresses:', error);
    //         if (error.status === 200) {
    //           this.toastr.success('Address Updated Successfully', 'Success',{
    //             progressBar: true
    //           });
    //           //this.setActiveTab(2);
    //           this.form.reset();
    //           this.closeModal();
    //           this.getAllCustomers();
    //         } else {
    //           this.toastr.error('Failed to update address', 'Error');
    //         }
    //       }
    //     );
    //   } else {
    //     // If no address has a valid AddressID, perform an add
    //     this.customerService.addAddresses(requestBody, this.customerID, this.userID).subscribe(
    //       response => {
    //         console.log('Addresses saved successfully:', response);
    //         this.toastr.success('Address Added Successfully', 'Success',{
    //           progressBar: true
    //         });
    //         this.closeModal();
    //         this.getAllCustomers();
    //       },
    //       error => {
    //         console.error('Error saving addresses:', error);
    //         if (error.status === 200) {
    //           this.toastr.success('Address Added Successfully', 'Success',{
    //             progressBar: true
    //           });
    //           this.setActiveTab(2);
    //           this.form.reset();
    //           this.closeModal();
    //           this.getAllCustomers();
    //         } else {
    //           this.toastr.error('Failed to add address', 'Error');
    //         }
    //       }
    //     );
    //   }
    // }
    //////////Add or Edit address previous code///////////////////
    // saveAddresses(): void {
    //   const existingAddresses: AddressBook[] = [];
    //   const newAddresses: AddressBook[] = [];
    
    //   let updatedExistingAddresses = false;
    
    //   this.form.value.addressBook.forEach((address: any) => {
    //     const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
    //       ? address.POCCountryID[0].countryID
    //       : null;
    //     const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
    //       ? address.countryID[0].countryID
    //       : address.countryID;
    //       const countryCode = Array.isArray(address.CountryCode) && address.CountryCode.length > 0
    //       ? address.CountryCode[0].toString() // Convert to string if it's an array
    //       : address.CountryCode?.toString();
    
    //     const preparedAddress = {
    //       ...address,
    //       AddressHeading: address.AddressHeading?.substring(0, 50),
    //       Address: address.Address?.substring(0, 250),
    //       City: address.City?.substring(0, 50),
    //       State: address.State?.substring(0, 50),
    //       POCEmail: address.POCEmail?.substring(0, 120),
    //       POCMobile: address.POCMobile?.substring(0, 120),
    //       POCCountryID: pocCountryID,
    //       countryID: countryID,
    //       countryCode: countryCode?.toString()
    //     };
    
    //     // ❌ Exclude CountryCode if it's present
    // if ('CountryCode' in preparedAddress) {
    //   delete preparedAddress.CountryCode;
    // }
    //     if (preparedAddress.countryID === null) {
    //       delete preparedAddress.countryID;
    //     }
    
    //     if (preparedAddress.addressID && preparedAddress.addressID.trim() !== '') {
    //       existingAddresses.push(preparedAddress);
    //     } else {
    //       newAddresses.push(preparedAddress);
    //     }
    //   });
    
    //   if (existingAddresses.length > 0) {
    //     this.customerService.updateAddresses(existingAddresses, this.customerID, this.userID).subscribe(
    //       response => {
    //         console.log('Update response:', response);
    
    //         updatedExistingAddresses = true;
    //         this.checkAndAddNewAddresses(newAddresses, updatedExistingAddresses);
    //       },
    //       error => {
    //         this.handleErrorResponse(error, 'Address Updated Successfully', 'Failed to update address');
    //       }
    //     );
    //   } else {
    //     this.checkAndAddNewAddresses(newAddresses, updatedExistingAddresses);
    //   }
    // }
    // suma's old code starts here
    // saveAddresses(): void {
    //   const existingAddressesToUpdate: AddressBook[] = [];
    //   const newAddressesToAdd: AddressBook[] = [];
    
    //   this.customerService.getCustomerAddresses(this.customerID).subscribe(
    //     dbAddresses => {
    //       const existingAddressIDs: string[] = dbAddresses?.map((a: any) => a.addressID) || [];
    
    //       // ✅ Transform dbAddresses to patch into the form
    //       const transformedAddresses = dbAddresses.map((addr: any) => ({
    //         addressID: addr.addressID,
    //       //   AddressHeading: addr.addressHeading,
    //       //   Address: addr.address,
    //       //   City: addr.city,
    //       //   State: addr.state,
    //       //   postCode: addr.postCode,
    //       //   POCCountryID: addr.pocCountryID,
    //       //  // POCCountryID: addr.pocCountryID ? [addr.pocCountryID] : null,
    //       //   POCName: addr.pocName,
    //       //   POCEmail: addr.pocEmail,
    //       //   POCMobile: addr.pocMobile,
    //       //   countryID: addr.countryID,
    //       //  // countryID: addr.countryID ? [addr.countryID] : null,
    //       //   countryCode: addr.countryCode ? [addr.countryCode] : null,
    //       //   CountryCode: addr.countryCode ? [addr.countryCode] : null // for compatibility
    //       }));
    
    //       // ✅ Patch transformed addresses to form
    //       this.form.patchValue({ addressBook: transformedAddresses });
    
    //      this.form.value.addressBook.forEach((address: any, index: number) => {
    //       const original = transformedAddresses[index];
    //         const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
    //           ? address.POCCountryID[0].countryID
    //           : address.POCCountryID;
    //         const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
    //           ? address.countryID[0].countryID
    //           : address.countryID;
    //         const countryCode = Array.isArray(address.CountryCode) && address.CountryCode.length > 0
    //           ? address.CountryCode[0].toString()
    //           : address.CountryCode?.toString();
    
    //         const preparedAddress: any = {
    //           ...address,
    //           addressID: transformedAddresses[index]?.addressID ?? null,
    //           AddressHeading: address.AddressHeading?.substring(0, 50),
    //           Address: address.Address?.substring(0, 250),
    //           City: address.City?.substring(0, 50),
    //           State: address.State?.substring(0, 50),
    //           POCEmail: address.POCEmail?.substring(0, 120),
    //           POCMobile: address.POCMobile?.substring(0, 120),
    //           POCCountryID: pocCountryID,
    //           countryID: countryID,
    //           countryCode: countryCode
    //         };
    
    //         delete preparedAddress.CountryCode;
    
    //         const addrID = preparedAddress.addressID;

    //         if (addrID && existingAddressIDs.includes(addrID)) {
    //           existingAddressesToUpdate.push(preparedAddress);
    //         } else {
    //           preparedAddress.addressID = null;
    //           newAddressesToAdd.push(preparedAddress);
    //         }
    //       });
    
    //       // 🔄 Send updates first, then new adds
    //       if (existingAddressesToUpdate.length > 0) {
    //         this.customerService.updateAddresses(existingAddressesToUpdate, this.customerID, this.userID).subscribe(
    //           res => this.checkAndAddNewAddresses(newAddressesToAdd, true),
    //           err => this.handleErrorResponse(err, 'Some addresses were updated', 'Failed to update some addresses')
    //         );
    //       } else {
    //         this.checkAndAddNewAddresses(newAddressesToAdd, false);
    //       }
    //     },
    //     error => {
    //       // No addresses in DB (404)
    //       if (error.status === 404) {
    //         this.form.value.addressBook.forEach((address: any) => {
    //           const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
    //             ? address.POCCountryID[0].countryID
    //             : null;
    //           const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
    //             ? address.countryID[0].countryID
    //             : address.countryID;
    //           const countryCode = Array.isArray(address.CountryCode) && address.CountryCode.length > 0
    //             ? address.CountryCode[0].toString()
    //             : address.CountryCode?.toString();
    
    //           const newAddr = {
    //             ...address,
    //             addressID: null,
    //             POCCountryID: pocCountryID,
    //             countryID: countryID,
    //             countryCode: countryCode
    //           };
    //           delete newAddr.CountryCode;
    //           newAddressesToAdd.push(newAddr);
    //         });
    
    //         this.checkAndAddNewAddresses(newAddressesToAdd, false);
    //       } else {
    //         this.handleErrorResponse(error, '', 'Failed to fetch customer addresses');
    //       }
    //     }
    //   );
    // }

    // suma's old code ends here
    // afraz new code starts here
    saveAddresses(): void {
    const existingAddressesToUpdate: AddressBook[] = [];
    const newAddressesToAdd: AddressBook[] = [];
    const modifiedAddressIDs: string[] = [];

    this.customerService.getCustomerAddresses(this.customerID).subscribe(
      dbAddresses => {
        const existingAddressIDs: string[] = dbAddresses?.map((a: any) => a.addressID) || [];

        // Create a map for quick lookup
        const dbMap = new Map(dbAddresses.map((addr: any) => [addr.addressID, addr]));

        // Transform dbAddresses to patch into the form
        const transformedAddresses = dbAddresses.map((addr: any) => ({
          addressID: addr.addressID
        }));

        this.form.patchValue({ addressBook: transformedAddresses });

        this.form.value.addressBook.forEach((address: any, index: number) => {
          const original = dbMap.get(address.addressID);
          const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
            ? address.POCCountryID[0].countryID
            : address.POCCountryID;
          const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
            ? address.countryID[0].countryID
            : address.countryID;
          const countryCode = Array.isArray(address.CountryCode) && address.CountryCode.length > 0
            ? address.CountryCode[0].toString()
            : address.CountryCode?.toString();

          const preparedAddress: any = {
            ...address,
            addressID: transformedAddresses[index]?.addressID ?? null,
            AddressHeading: address.AddressHeading?.substring(0, 50),
            Address: address.Address?.substring(0, 250),
            City: address.City?.substring(0, 50),
            State: address.State?.substring(0, 50),
            postCode: address.postCode,
            POCEmail: address.POCEmail?.substring(0, 120),
            POCMobile: address.POCMobile?.substring(0, 120),
            POCCountryID: pocCountryID,
            countryID: countryID,
            countryCode: countryCode
          };

          delete preparedAddress.CountryCode;

          const addrID = preparedAddress.addressID;

          // Check for modified postCode or countryID
          if (addrID && original && (original.postCode !== preparedAddress.postCode || original.countryID !== preparedAddress.countryID)) {
            modifiedAddressIDs.push(addrID);
          }

          if (addrID && existingAddressIDs.includes(addrID)) {
            existingAddressesToUpdate.push(preparedAddress);
          } else {
            preparedAddress.addressID = null;
            newAddressesToAdd.push(preparedAddress);
          }
        });

        const proceedWithSave = () => {
          if (existingAddressesToUpdate.length > 0) {
            this.customerService.updateAddresses(existingAddressesToUpdate, this.customerID, this.userID).subscribe(
              res => this.checkAndAddNewAddresses(newAddressesToAdd, true),
              err => this.handleErrorResponse(err, 'Some addresses were updated', 'Failed to update some addresses')
            );
          } else {
            this.checkAndAddNewAddresses(newAddressesToAdd, false);
          }
        };

        if (modifiedAddressIDs.length > 0) {
          const idString = modifiedAddressIDs.join(',');
          this.customerService.checkAddressesWithTransportCost(idString).subscribe(
            (res:any) => {
              if (res.length > 0) {

                 //const modal = bootstrap.Modal.getInstance(document.getElementById('update-transportation-cost-to-zero-popup'));
                const modal = new bootstrap.Modal(document.getElementById('update-transportation-cost-to-zero-popup'));
                 if(modal){
                  modal.show(); // Show the modal
                 }
                  // Cleanup old event listeners if any
                  const yesButton = document.getElementById('confirm-update-transport-cost');
                  const newClickHandler = () => {
                    const requestBody = {
                      addressIDs: idString,
                      userID: this.userID
                    };

                    this.customerService.updateTransportCostToZero(requestBody).subscribe(
                      () => {
                        modal.hide();
                        proceedWithSave(); // continue after updating cost
                      },
                      (err: any) => this.handleErrorResponse(err, '', 'Failed to update transport cost')
                    );

                    yesButton?.removeEventListener('click', newClickHandler); // Prevent multiple bindings
                  };

                  yesButton?.addEventListener('click', newClickHandler);
                // Show confirmation dialog
                // if (confirm('One or more addresses have transportation cost. Do you want to set them to zero?')) {
                //   const requestBody = {
                //     addressIDs: idString,
                //     userID: this.userID
                //   }
                //   this.customerService.updateTransportCostToZero(requestBody).subscribe(
                //     () => proceedWithSave(),
                //     (err: any) => this.handleErrorResponse(err, '', 'Failed to update transport cost')
                //   );
                // } else {
                //   //proceedWithSave(); // Continue without changing cost
                // }
              } else {
                proceedWithSave();
              }
            },
            (err:any) => {
              this.handleErrorResponse(err, '', 'Failed to check transport cost');
            }
          );
        } else {
          proceedWithSave();
        }
      },
      error => {
        if (error.status === 404) {
          this.form.value.addressBook.forEach((address: any) => {
            const pocCountryID = Array.isArray(address.POCCountryID) && address.POCCountryID.length > 0
              ? address.POCCountryID[0].countryID
              : null;
            const countryID = Array.isArray(address.countryID) && address.countryID.length > 0
              ? address.countryID[0].countryID
              : address.countryID;
            const countryCode = Array.isArray(address.CountryCode) && address.CountryCode.length > 0
              ? address.CountryCode[0].toString()
              : address.CountryCode?.toString();

            const newAddr = {
              ...address,
              addressID: null,
              POCCountryID: pocCountryID,
              countryID: countryID,
              countryCode: countryCode
            };
            delete newAddr.CountryCode;
            newAddressesToAdd.push(newAddr);
          });

          this.checkAndAddNewAddresses(newAddressesToAdd, false);
        } else {
          this.handleErrorResponse(error, '', 'Failed to fetch customer addresses');
        }
      }
    );
  }
  cancelTransportationCostUpdationToZero(){
    const modal = new bootstrap.Modal(document.getElementById('update-transportation-cost-to-zero-popup'));
    if(modal){
    modal.hide(); // Show the modal
    }
  }
  confirmTransportationCostUpdationToZero(){

  }
   // afraz new code starts here


    checkAndAddNewAddresses(newAddresses: AddressBook[], updatedExistingAddresses: boolean) {
      if (newAddresses.length > 0) {
        this.customerService.addAddresses(newAddresses, this.customerID, this.userID).subscribe(
          response => {
            console.log('Add response:', response);
    
            const addedNewAddresses = true;
            this.displaySuccessMessage(updatedExistingAddresses, addedNewAddresses);
    
           // this.resetForm();
            this.setActiveTab(3);
            this.loadCustomerAddresses();
            // if(this.customerAddressForTransportAndPacking){
            //   this.disableTransportAndPackingTab = false;
            // }
            // else{
            //   this.disableTransportAndPackingTab = true;
            // }
          },
          error => {
            this.handleErrorResponse(error, '', 'Failed to add address');
          }
        );
      } else if (updatedExistingAddresses) {
        this.displaySuccessMessage(updatedExistingAddresses, false);
       // this.resetForm();

        this.setActiveTab(3);
        this.loadCustomerAddresses();
      }
    }
    
    displaySuccessMessage(updatedExistingAddresses: boolean, addedNewAddresses: boolean): void {
      if (updatedExistingAddresses && addedNewAddresses) {
        this.toastr.success('Addresses Updated and Added Successfully', 'Success', {
          progressBar: true,
          timeOut:1500,
          closeButton:true
        });
      } else if (addedNewAddresses) {
        this.toastr.success('Address Added Successfully', 'Success', {
          progressBar: true,
          timeOut:1500,
          closeButton:true
        });
      } else if (updatedExistingAddresses) {
        this.toastr.success('Address Updated Successfully', 'Success', {
          progressBar: true,
          timeOut:1500,
          closeButton:true
        });
      }
    }
    resetForm(): void {
      this.form.reset();
      //this.closeModal();
      this.getAllCustomers();
      this.disableTransportAndPackingTabOnCancel();

    }
    // Define the handleErrorResponse method
  handleErrorResponse(error: any, successMessage: string, errorMessage: string): void {
    if (error.status === 200) {
      this.toastr.success(successMessage, 'Success', {
        progressBar: true,
        timeOut:1500,
        closeButton:true
      });
      //this.form.reset();
      this.closeModal();
      this.getAllCustomers();
    } else {
      console.error('Error:', error);
      this.toastr.error(errorMessage, 'Error', {
        progressBar: true
      });
    }
  }
  // private generateUUID(): string {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  //     const r = (Math.random() * 16) | 0;
  //     const v = c === 'x' ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }
    //Add Customer and PointOfContacts.
    saveAndAddAddress() {
      const customerInfo = this.form.get('customerInfo')?.value;
      if (!customerInfo) {
        console.log('Customer info is invalid');
        this.form.get('customerInfo')?.markAllAsTouched();
        return;
      }
       const contactsArray = this.form.get('pointOfContacts') as FormArray;
      
        // Check if all mobile numbers have at least 8 digits
        const invalidContacts = contactsArray.controls.filter(contact => {
          const mobileNumber = contact.get('mobileNumber')?.value;
          return mobileNumber && mobileNumber.length < 8; // Validate only non-empty numbers
        });

        // Mobile validation
        if (invalidContacts.length > 0) {
          this.toastr.error('Please enter a valid mobile number (at least 8 digits).', 'Error');
          
          // Mark only invalid mobile number fields as touched
          invalidContacts.forEach(contact => {
            contact.get('mobileNumber')?.markAsTouched();
          });

          console.log('Invalid mobile number detected');
          return;
        }
        // ✅ Proceed with saving if all validations pass
        console.log('Customer Data:', this.form.value);
        // Track invalid contacts
        const incompleteContacts = contactsArray.controls.filter(contact => {
          const name = contact.get('name')?.value?.trim();
          const emailId = contact.get('emailId')?.value?.trim();
          const mobileNumber = contact.get('mobileNumber')?.value?.trim();
          const countryID = contact.get('countryID')?.value;
        
          // Check if countryID is actually selected (non-empty array with valid value)
          const isCountrySelected = Array.isArray(countryID) && countryID.length > 0;
        
          // const isAnyFieldTouched =
          //   contact.get('name')?.touched ||
          //   contact.get('emailId')?.touched ||
          //   contact.get('mobileNumber')?.touched ||
          //   contact.get('countryID')?.touched;
        
          const isAnyFieldFilled =
            !!name || !!emailId || !!mobileNumber || isCountrySelected;
        
         // If any field is touched or filled, validate all fields
          if (isAnyFieldFilled) {
            const isInvalid = !name || !emailId || !mobileNumber || !isCountrySelected;
        
            if (isInvalid) {
               if (!name) {
                contact.get('name')?.setValidators(Validators.required);
                contact.get('name')?.updateValueAndValidity();
              }
              if (!emailId) {
                contact.get('emailId')?.setValidators([Validators.required, Validators.email]);
                contact.get('emailId')?.updateValueAndValidity();
              }
              if (!mobileNumber) {
                contact.get('mobileNumber')?.setValidators([Validators.required, Validators.minLength(10)]);
                contact.get('mobileNumber')?.updateValueAndValidity();
              }
              if (!isCountrySelected) {
                contact.get('countryID')?.setValidators(Validators.required);
                contact.get('countryID')?.updateValueAndValidity();
              }
              // Mark all as touched to trigger error display
              contact.get('name')?.markAsTouched();
              contact.get('emailId')?.markAsTouched();
              contact.get('mobileNumber')?.markAsTouched();
              contact.get('countryID')?.markAsTouched();
        
              return true;
            }
          }
        
          return false;
        });
        
        if (incompleteContacts.length > 0) {
          this.toastr.error('Please fill all required fields for the entered Point of Contact.', 'Error');
          return;
        }
        // Check for invalid email format in POC
        const contactsWithInvalidEmails = contactsArray.controls.filter(contact => {
          const emailControl = contact.get('emailId');
          return emailControl &&  emailControl.value && emailControl.invalid && (emailControl.touched || emailControl.dirty);
        });

        if (contactsWithInvalidEmails.length > 0) {
          this.toastr.error('Please enter a valid email address format.', 'Error');
          
          contactsWithInvalidEmails.forEach(contact => {
            contact.get('emailId')?.markAsTouched();
          });

          return;
        }

       let paymentTerm: string;
      // if (this.showTextBox) {
      //   const userEnteredValue = this.form.get('customerInfo.paymentTerms')?.value || '';
      //   paymentTerm = `${userEnteredValue} Days`;
      // } else {
      //   paymentTerm = Array.isArray(customerInfo.paymentTerms) && customerInfo.paymentTerms.length > 0
      //   ? customerInfo.paymentTerms[0].paymentTerm
      //   : customerInfo.paymentTerms;
      // }
      if (this.showTextBox) {
        const userEnteredValue = this.form.get('customerInfo.paymentTermsForOthers')?.value || ''; // Use the correct formControlName
        paymentTerm = `${userEnteredValue.trim()} Days`;
      } else {
        paymentTerm = Array.isArray(customerInfo.paymentTerms) && customerInfo.paymentTerms.length > 0
          ? customerInfo.paymentTerms[0].paymentTerm
          : customerInfo.paymentTerms;
      }
      //To fetch countryID based on the countryCode and assign it to the pointofContacts.countryID
      // for (let i = 0; i < this.pointOfContacts.length; i++) {
      //   const contactControl = this.pointOfContacts.at(i); 
      //   const contact = contactControl.value; 
      //   const countryCode = Array.isArray(contact.countryID) && contact.countryID.length > 0
      //       ? contact.countryID[0]  
      //       : contact.countryID;
      //   if (countryCode) {
      //       const matchingCountry = this.allCountries.find(x => x.countryCode === countryCode);
      //       if (matchingCountry) {
      //           contactControl.get('countryID')?.setValue(matchingCountry.countryID);
      //           contact.countryID = matchingCountry.countryID; 
      //       } 
      //       contact.countryCode = countryCode; 
      //   }
      // }
      //new code to resolve the dropdown issue for POC CountryID
      for (let i = 0; i < this.pointOfContacts.length; i++) {
        const contactControl = this.pointOfContacts.at(i);
        const contact = contactControl.value;
      
        const selected = contactControl.get('countryID')?.value;
        const selectedCountry = Array.isArray(selected) && selected.length > 0 ? selected[0] : null;
      
        if (selectedCountry) {
          const countryCode = typeof selectedCountry === 'string' ? selectedCountry : selectedCountry.countryCode;
      
          const matched = this.allCountries.find(c => c.countryCode === countryCode);
          if (matched) {
            const modifiedCountry = {
              ...matched,
              countryDetail: matched.countryCode // Just show +91
            };
            contactControl.get('countryID')?.setValue([modifiedCountry]);
          }
        }
      }
     // Filter out incomplete or invalid pointOfContacts
      const formattedContacts = this.pointOfContacts.value.map((contact: any, index: number) => {
      const PointOfContactType = this.contactLabels[index].name; // Retrieves the name of the contact label
      return {
        //pointOfContactID: this.pointOfContactID || null,
        pointOfContactID: Array.isArray(this.pointOfContactID) ? this.pointOfContactID[index] || null : this.pointOfContactID || null,
        //pointOfContactID: Array.isArray(this.pointOfContactID) ? this.pointOfContactID: this.pointOfContactID ? [this.pointOfContactID] : null,
        ...contact,
        PointOfContactType,
        countryCode: this.isEditing 
        ? (Array.isArray(contact.countryID) && contact.countryID.length > 0
            ? contact.countryID[0].countryDetail 
            : (this.allCountries.find(x => x.countryID === contact.countryID)?.countryDetail || ""))
        : (contact.countryCode || 
            (this.allCountries.find(x => x.countryID === contact.countryID)?.countryCode || "")),
        countryID: this.isEditing 
        ? (Array.isArray(contact.countryID) && contact.countryID.length > 0
            ? contact.countryID[0].countryID
            : (contact.countryID || null))
        : (Array.isArray(contact.countryID) && contact.countryID.length > 0
           ? contact.countryID[0].countryID
           : (contact.countryID || null))
      };
      }).filter((contact: { name: string; emailId: string; mobileNumber: string; countryID: any; }) =>
        contact.name && contact.emailId && contact.mobileNumber && contact.countryID
      );
    
      const hasPrimaryPOC = formattedContacts.some(
        (contact: any) => contact.PointOfContactType === 'Primary'
      );

      if (!hasPrimaryPOC) {
        this.toastr.error('Primary Point of Contact is required.', 'Error');
        contactsArray.controls.forEach(contact => {
          const contactType = contact.get('contactType')?.value;
          if (contactType === 'Primary') {
            contact.markAsTouched(); // Mark only primary contacts as touched
          }
        });
        return;
      }
      const customerData = {
        customerID: this.customerIDToEditInAddMode ?? customerInfo.customerID,
        customerName: customerInfo.customerName,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        postCode:customerInfo.postCode,
        countryID: Array.isArray(customerInfo.country) && customerInfo.country.length > 0
          ? customerInfo.country[0].countryID
          : customerInfo.country,
        customerTypeID: Array.isArray(customerInfo.customerTypes) && customerInfo.customerTypes.length > 0
          ? customerInfo.customerTypes[0].customerTypeID
          : customerInfo.customerTypes,
        // paymentTerm: Array.isArray(customerInfo.paymentTerms) && customerInfo.paymentTerms.length > 0
        //   ? customerInfo.paymentTerms[0]?.paymentTerm
        //   : customerInfo.paymentTerm,
          paymentTerm: paymentTerm,
        pointOfContacts: formattedContacts // Send all valid contacts
      };
    
      console.log('Customer Data to Send:', customerData);
      console.log('May 19 aftr update', customerData);
    
      // Call the API based on add or update
      if (this.selectedCustomer || this.customerIDToEditInAddMode) {
        this.isEditing = false; 
        this.customerService.updateCustomer(customerData).subscribe({
          next: (response) => {
            if (response) {
             this.responseMessage = response.message;
              console.log('Customer updated successfully:', response);
              this.toastr.success('Customer Updated Successfully', 'Success',{
                progressBar: true,
                timeOut:1500,
                closeButton:true
              });
              this.getAllCustomers();
              this.setActiveTab(2);
            } else {
              console.error('Unexpected response:', response);
             // this.toastr.error('Failed to update customer', 'Error');
             this.toastr.error(response?.message || 'Failed to update customer', 'Error');
            }
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            const backendMessage = error?.error?.message || 'Failed to update customer';
            this.toastr.error(backendMessage, 'Error');
          },
        });
      } else {
        this.isEditing = false; 
        this.customerService.addCustomer(customerData).subscribe({
          next: (response) => {
            console.log('May 19',response);
            if (response && response.success && response.customer) {
              this.customerID = response.customer.customerID;
              //this.pointOfContactID = response.customer.pointOfContacts[0].pointOfContactID;
              this.pointOfContactID = response.customer.pointOfContacts.map((poc: { pointOfContactID: string }) => poc.pointOfContactID);
              console.log('pointOfContactID May 19', this.pointOfContactID);
              this.customerIDToEditInAddMode = this.customerID;
             console.log('May 19 ID',this.customerIDToEditInAddMode);
              console.log('Customer added successfully:', response);
              this.toastr.success('Customer Added Successfully', 'Success',{
                progressBar: true,
                timeOut:1500,
                closeButton:true
              });
              this.getAllCustomers();
              this.setActiveTab(2);
            } else {
              console.error('Unexpected response:', response);
            //  this.toastr.error('Failed to add customer', 'Error');
            this.toastr.error(response?.message || 'Failed to update customer', 'Error');
            }
          },
          error: (error) => {
            console.error('Error adding customer:', error);
            if (error.status === 200) {
              this.toastr.success('Customer Added Successfully', 'Success',{
               progressBar: true,
               timeOut:1500,
               closeButton:true
              });
              this.setActiveTab(2);
            } else {
             // this.toastr.error('Failed to add customer', 'Error');
             console.error('Error updating customer:', error);
             const backendMessage = error?.error?.message || 'Failed to update customer';
             this.toastr.error(backendMessage, 'Error');
            }
          },
        });
      }
    }
     //Add Customer jan 08
private logInvalidControls() {
  const controls = this.form.controls;
  for (const name in controls) {
    if (controls[name].invalid) {
      console.log(`Invalid Control: ${name}`, controls[name].errors);
    }
  }
}
validate() {
 // this.form.markAllAsTouched();
 // Validate customerInfo
 if (this.form.get('customerInfo')?.invalid) {
  this.form.get('customerInfo')?.markAllAsTouched();
  }
  if(this.selectedCountry.length > 0){
    this.newCustomer.countryID = this.selectedCountry[0].countryID;
    this.newCustomer.customerTypes = this.selectedCustomerTypes[0].customerType;
    this.newpointOfContact.countryID = this.selectedCountry[0].countryID;
    this.countryCodeValidationFlag = false;
  }
    // Iterate over pointOfContacts to apply custom logic
  this.pointOfContacts.controls.forEach(control => {
    const formGroup = control as FormGroup; 
    if (Object.values(formGroup.controls).some(innerControl => innerControl.touched)) {
      // Mark the form group as touched only if at least one control is touched
      formGroup.markAsTouched();
    }
  });
  //Validate address
  const addressBookArray = this.form.get('addressBook') as FormArray;
  if (addressBookArray) {
    addressBookArray.controls.forEach(control => {
      const formGroup = control as FormGroup;
      if (Object.values(formGroup.controls).some(innerControl => innerControl.touched)) {
        formGroup.markAsTouched();
      }
    });
  }
  if (this.form.valid) {
    this.saveAndAddAddress();
  } else {
    console.log('Form is invalid');
    this.logInvalidControls();
  }
   }
 
 //Add customer jan 08
    onSubmit() {
      if (this.form.valid) {
        console.log('Form Submitted', this.form.value);
        this.closeModal();
      } else {
        console.log('Form is not complete');
      }
    }
  
    closeModal() {
      const modalElement = document.getElementById('addCustomer');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();
      }
    }

    commonService = inject(CommonService);
    toastr = inject(ToastrService)
    customerService=inject(CustomerService)
    sessionService = inject(SessionService);

    private initializeForm(): void {
      this.form = this.fb.group({
        customerInfo: this.fb.group({
          customerID:[''],
          customerName: ['', Validators.required],
          address: ['', Validators.required],
          city: ['', Validators.required],
          //state: ['', Validators.required],
          customerTypes: ['', Validators.required],
          // emailId: ['', [Validators.required, Validators.email]],
          // mobileNumber: ['', Validators.required],
          postCode: ['', Validators.required],
          country: [[], Validators.required],
          paymentTerms: [''],
          paymentTermsForOthers:[''],
          //paymentTerms: ['', Validators.required],
          //name: ['', Validators.required]
        }),
        pointOfContacts: this.fb.array(this.contactLabels.map((label, index) => this.createContactFormGroup(index))),
       // pointOfContacts: this.fb.array(this.contactLabels.map(label => this.createContactFormGroup(label))),
       locationForm: this.createLocationFormGroup(),
       addressBook: this.fb.array([this.createAddressFormGroup()]),
        transportInfo: this.createTransportFormGroup(),
        packingInfo: this.createPackingFormGroup()
      });
      this.initialCustomerInfoState = { ...this.form.get('customerInfo')?.value };
      
    }
    userID : any;
    ngOnInit(): void {
  this.initializeForm();
  this.userID = this.sessionService.sessionStorageGetUserId();
  // Fetch all customers and set up dropdown settings
  this.getAllCustomers();
  this.getAllCountries();
  this.getAllCustomerTypes();
  this.getAllPaymentTerms();

  this.getAllIncoterms();
  this.getAllPricingTypes();
  this.getAllTypesOfPallets();
  this.getAllTypesOfPacking();
  //this.getAllPackingTypes();
  this.route.queryParamMap.subscribe(params => { 
    const customerID = params.get('customerID'); // Correct way to get query param
    console.log('customerID:', customerID);
    if (customerID) {
     // this.getUserDetailsByID(userId);
     console.log('customerID:', customerID);
      this.loadCustomerDetails(customerID);

      // ✅ Immediately remove it from the URL after using
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { customerID: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
     
     
    }
  });

  // Listen for form changes for alert popup
  this.form.get('customerInfo')?.valueChanges.subscribe(() => {
    this.isCustomerInfoSaved = false; 
  });
  // Initialize dropdown settings
  this.countriesdropdownSettings = {
    idField: 'countryID',
    textField: 'country',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
    //searchPlaceholderText: 'Search Country Code'
  };
  this.countrydropdownSettings = {
    idField: 'countryID',
    textField: 'countryDetail',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
    //searchPlaceholderText: 'Search Country Code'
  };
  this.countryCodeDropdownSettings = {
    idField: 'countryID',
    textField: 'countryCode',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText	: 'No Data Available',
    closeDropDownOnSelection: true
    //searchPlaceholderText: 'Search Country Code'
  };
  this.customerTypesDropdownSettings = {
    idField: 'customerTypeID',
    textField: 'customerTypeName',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
    //searchPlaceholderText: 'Search Country Code'
  };
  this.paymentTermsDropdownSettings = {
    idField: 'paymentTermID',
    textField: 'paymentTerm',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
  }

  this.incotermdropdownSettings = {
    idField: 'incotermID',
    textField: 'incoterm',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
  }

  this.pricingTypedropdownSettings = {
    idField: 'pricingTypeID',
    textField: 'pricingType',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
  }
  this.palletTypedropdownSettings = {
    idField: 'typeOfPalletID',
    textField: 'typeOfPallet',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
  }
  this.packingTypedropdownSettings = {
    idField: 'typeOfPackingID',
    textField: 'typeOfPacking',
    allowSearchFilter: true,
    singleSelection: true,
    itemsShowLimit:2,
    noDataAvailablePlaceholderText  : 'No Data Available',
    closeDropDownOnSelection: true
  }

 }

 loadCustomerDetails(customerID: string) {
  this.openCustomerDetailsModal();
  
  this.CustomerDetailsByID(customerID);


}

openCustomerDetailsModal() {
  const modalElement = document.getElementById('user-details-modal');
  if (modalElement) {
    console.log('Opening modal');
    const modal = new bootstrap.Offcanvas(modalElement);
    modal.show();
  }
}

ngOnDestroy() {
  const modalElement = document.getElementById('user-details-modal');
  if (modalElement) {
    const modal = bootstrap.Offcanvas.getInstance(modalElement);
    if (modal) modal.hide();
  }
} 
    //jan 03
  get totalRecords(): number {
     //return this.customerPointOfContacts.length;
     return this.allCustomerDetails.length;
  }
  get recordsRange(): string {
      const startRecord = (this.currentPage - 1) * 10 + 1; 
      const endRecord = Math.min(startRecord + 10 - 1, this.totalRecords);
      return `Showing ${startRecord} to ${endRecord} of ${this.totalRecords} records`;
  }
  // Get All Incoterms
  getAllIncoterms(){
    this.customerService.getAllIncoterms().subscribe({
      next: (response: any[]) => {
        this.allIncoterms = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }

  // Get All Pricing Types
  getAllPricingTypes(){
    this.customerService.getAllPricingTypes().subscribe({
      next: (response: any[]) => {
        this.allPricingTypes = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }

  // Get All Types Of Pallets

  getAllTypesOfPallets(){
    this.customerService.getAllTypesOfPallet().subscribe({
      next: (response: any[]) => {
        this.allTypesOfPallet = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }

  // Get All Types Of Packing

  getAllTypesOfPacking(){
    this.customerService.getAllTypesOfPacking().subscribe({
      next: (response: any[]) => {
        this.allTypesOfPacking = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }
  // Get All Packing Types
  getPackingTypesByTypeOfPackingID(typeOfPallet: string | null, typeOfPackingID : string, data?: any){
    const requestBody = {
      typeOfPallet: typeOfPallet ? typeOfPallet : null,
      typeOfPackingID: typeOfPackingID
    }
    console.log('GetPackingTypesByTypeOfPackingID Request Body:', requestBody);
    this.customerService.getPackingTypesByTypeOfPackingID(requestBody).subscribe({
      next: (response: any[]) => {
        this.allPackingTypes = response;
        console.log('GetPackingTypesByTypeOfPackingID Response ', response);
        //this.addPackingOptionsToForm();
        //this.populatePackingOptions(response);
        this.populatePackingOptions2(data);
      },
      error: (error: { message: any; }) => {
        console.log('GetPackingTypesByTypeOfPackingID Error', error);
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }

   // Get All Countries
   getAllCountries() {
    this.commonService.getAllCountries().subscribe({
      next: (response: any[]) => {
        this.allCountries = response;
        console.log('COUNTRIES:', this.allCountries);        
      },
      error: (error) => {
        console.error('Error fetching countries:', error);
      }
    });
  }
  
  //Get All Customer Types
  getAllCustomerTypes(){
    this.commonService.getAllCustomerTypes().subscribe({
      next: (response: any[]) => {
        this.allCustomerTypes = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }
  //Get All Payment Terms
  getAllPaymentTerms(){
    this.commonService.getAllPaymentTerms().subscribe({
      next: (response: any[]) => {
        this.allPaymentTerms = response;
      },
      error: (error: { message: any; }) => {
        this.responseMessage = `Error: ${error.message || 'Something went wrong.'}`;
      }
    });
  }
    //jan 03
    //Search
    // filterCustomers() {
    //   console.log('Search Query:', this.searchQuery); 
    //   if (this.searchQuery) {
    //     this.filteredCustomers = this.allCustomerDetails.filter(customer =>
    //     // this.filteredCustomers = this.customerPointOfContacts.filter(customer =>
    //       Object.values(customer).some(value => {
    //         if (value != null) {
    //           console.log('Checking:', value); 
    //           return value.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
    //         }
    //         return false;
    //       })
    //     );
    //   } else {
    //     this.filteredCustomers = [...this.allCustomerDetails];
    //    // this.filteredCustomers = [...this.customerPointOfContacts];
    //   }
    // }
    //Search for all columns
    filterCustomers() {
      console.log('Search Query:', this.searchQuery); 
      if (this.searchQuery) {
        const lowerCaseQuery = this.searchQuery.toLowerCase();
    
        this.filteredCustomers = this.allCustomerDetails.filter(customer => {
          // Check top-level properties
          const topLevelMatches = Object.values(customer).some(value => {
            if (typeof value === 'string' || typeof value === 'number') {
              console.log('Checking:', value);
              return value.toString().toLowerCase().includes(lowerCaseQuery);
            }
            return false;
          });
    
          // Check nested pointOfContacts properties
          const contactMatches = customer.pointOfContacts?.some(contact => {
            const values = Object.values(contact);
            return values.some(value => {
              if (typeof value === 'string') {
                console.log('Checking contact:', value);
                return value.toLowerCase().includes(lowerCaseQuery);
              }
              return false;
            });
          });
    
          return topLevelMatches || contactMatches;
        });
      } else {
        this.filteredCustomers = [...this.allCustomerDetails];
      }
    }

    //Sorting
    getSortClass(column: string): string {
      if (this.sortColumn === column) {
          return this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
      }
      return '';
    }
    getSortArrowClass(column: string, direction: string): string {
       if (this.sortColumn === column) {
            return this.sortDirection === direction ? 'active' : 'inactive';
        }
        return 'inactive';
    }
    sortData(column: string) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    
      this.filteredCustomers.sort((a: any, b: any) => {
        let valueA: any;
        let valueB: any;
        
        if (column === 'mobileNumber' || column === 'emailID') {
          // Assuming you want to sort by the first contact's mobileNumber or emailID
          valueA = a.pointOfContacts?.[0]?.[column] || '';
          valueB = b.pointOfContacts?.[0]?.[column] || '';
        } else {
          valueA = a[column];
          valueB = b[column];
        }
    
        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    // sortData(column: string) {
    //   if (this.sortColumn === column) {
    //     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    //   } else {
    //     this.sortColumn = column;
    //     this.sortDirection = 'asc';
    //   }
  
    //   this.filteredCustomers.sort((a: any, b: any) => {
    //     const valueA = a[column];
    //     const valueB = b[column];
        
    //     if (valueA < valueB) {
    //       return this.sortDirection === 'asc' ? -1 : 1;
    //     }
    //     if (valueA > valueB) {
    //       return this.sortDirection === 'asc' ? 1 : -1;
    //     }
    //     return 0;
    //   });
    // }
    //Get all Customers
    getAllCustomers(){
      this.customerService.getAllCustomers().subscribe({
        next: (response) => {
          //this.customerPointOfContacts = response;
          this.allCustomerDetails= response;
          this.filteredCustomers = [...this.allCustomerDetails];
          this.checkCurrentPageAfterDeletion();
          //this.filteredCustomers = [...this.customerPointOfContacts];
        },
        error: (error) => {
          console.log(`Error: ${error.message || 'Something went wrong.'}`);
        }
      });
    }
      // closeModal(){
      // }
  //   validate(form: any) {
  //     if (form.valid) {
  //       this.addCustomer(form);
  //     } else {
  //       console.log('Form is invalid');
  //     }
  //  }
  //Getting the pointOfContactType from API to display dynamically in both Add and edit page.
  getContactLabelName(contactTypeId: number | null): string {
    if (contactTypeId === null || contactTypeId === undefined) return 'Unknown';
    const label = this.contactLabels.find(label => label.id === contactTypeId);
    return label ? label.name : 'Unknown';
  }
  editCustomer(customer: CustomerDetails) {
    this.setActiveTab(1);
    this.isEditingMode = true;
    this.showTransportAndPackingInfoMessage = false;
    this.isEditing = true;
    console.log('Customer Data:', customer);

    this.selectedCustomer = customer.customerID;
    this.selectedCustomerId = customer.customerID;
    this.customerID = customer.customerID;

    const netherlands = this.allCountries.find(
      (c) => c.country?.toLowerCase() === 'netherlands'
    );
    
  
    if (netherlands) 
    {
      this.form.get('customerInfo.country')?.patchValue([{ countryID: netherlands.countryID, country: netherlands.country }]);
      
      // Assuming the form structure
      const pointOfContactsFormArray = this.form.get('pointOfContacts') as FormArray;
      pointOfContactsFormArray.controls.forEach(control => {
        control.get('countryID')?.patchValue([netherlands.countryCode]);
      });
  
      // const addressBookFormArray = this.form.get('addressBook') as FormArray;
      // addressBookFormArray.controls.forEach(control => {
      //   control.get('countryID')?.patchValue([netherlands.country,netherlands.countryCode]);
      // });
      const addressBookFormArray = this.form.get('addressBook') as FormArray;
      addressBookFormArray.controls.forEach(control => {
        control.get('countryID')?.patchValue([{ countryID: netherlands.countryID, country: netherlands.country }]);
        control.get('POCCountryID')?.patchValue([{ countryID: netherlands.countryID, countryDetail: netherlands.countryDetail }]);
        control.get('CountryCode')?.patchValue([netherlands.countryCode]);
     });
  
      console.log('Netherlands set as default:', netherlands);
    } else {
      console.warn('Netherlands not found in country list');
    }
  
    

    const selectedCustomerType = this.allCustomerTypes.find(
      (type: { customerTypeID: string }) => type.customerTypeID === customer.customerTypeID
    );
    
    const selectedCountry = this.allCountries.find(
      (country: { countryID: string }) => country.countryID === customer.countryID
    );
    const selectedPaymentTerms = this.allPaymentTerms.find(
      (terms: { paymentTerm: string }) => terms.paymentTerm === customer.paymentTerm
    );
    let paymentTermToUse: string;
    if (selectedPaymentTerms) {
    paymentTermToUse = selectedPaymentTerms.paymentTerm;
    } else {
       paymentTermToUse = customer.paymentTerm;
    }
    console.log('Paymentterms',selectedPaymentTerms);
    this.showDiscountMessage = paymentTermToUse === '8 Days';
    this.form.get('customerInfo')?.patchValue({
      
      customerID: this.selectedCustomerId,
      //customerID:customer.customerID,
      customerName: customer.customerName,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      emailId: customer.emailID,
      mobileNumber: customer.mobileNumber,
      postCode: customer.postCode,
      customerTypes: selectedCustomerType ? [{ customerTypeID: selectedCustomerType.customerTypeID, customerTypeName: selectedCustomerType.customerTypeName }] : null,
      country: selectedCountry ? [{ countryID: selectedCountry.countryID, country: selectedCountry.country }] : null,
      paymentTerms: selectedPaymentTerms ? [{ paymentTermID: selectedPaymentTerms.paymentTermID, paymentTerm: selectedPaymentTerms.paymentTerm }] : [{ paymentTermID: null, paymentTerm: customer.paymentTerm }],
    });
    //Binding the POC according to the pointOfContactType from API. 
    // const pointOfContactsFormArray = this.form.get('pointOfContacts') as FormArray;
    // pointOfContactsFormArray.clear(); // Clear existing form groups
    // const contactMap = new Map<string, any>(
    //   customer.pointOfContacts.map((contact: any) => [contact.pointOfContactType.trim().toLowerCase(), contact])
    // );
    // this.contactLabels.forEach(label => {
    //   const contactTypeName = label.name.trim().toLowerCase();
    //   const contact = contactMap.get(contactTypeName);
    //   const selectedCountry = contact
    //     ? this.allCountries.find(
    //         (countryDetail: { countryID: string; countryCode: string }) => countryDetail.countryID === contact.countryID
    //       )
    //     : null;
    //   pointOfContactsFormArray.push(
    //     this.fb.group({
    //       pointOfContactID: [contact ? contact.pointOfContactID : null],
    //       PointOfContactType: [label.id, Validators.required], // Always bind the label id
    //       name: [contact ? contact.name : '', Validators.required],
    //       emailId: [contact ? contact.emailID : '', [Validators.required, Validators.email, this.customEmailValidator]],
    //       mobileNumber: [contact ? contact.mobileNumber : '', Validators.required],
    //       countryID: [selectedCountry ? [selectedCountry.countryCode] : []],
    //     })
    //   );
    // });
    // Patch pointOfContacts section
      const pointOfContactsFormArray = this.form.get('pointOfContacts') as FormArray;
      pointOfContactsFormArray.clear(); // Clear existing form groups
      const contactMap = new Map<string, any>(
        customer.pointOfContacts.map((contact: any) => [contact.pointOfContactType.trim().toLowerCase(), contact])
      );
      this.contactLabels.forEach((label, index) => {
        const contactTypeName = label.name.trim().toLowerCase();
        const contact = contactMap.get(contactTypeName);
        const selectedCountry = contact
          ? this.allCountries.find(
              (countryDetail: { countryID: string; countryCode: string }) => countryDetail.countryID === contact.countryID
            )
          : null;
        const isPrimary = label.name === 'Primary';
        pointOfContactsFormArray.push(
          this.fb.group({
            pointOfContactID: [contact ? contact.pointOfContactID : null],
            PointOfContactType: [label.id, Validators.required],
            name: [contact ? contact.name : '', isPrimary ? Validators.required : []],
            emailId: [ contact ? contact.emailID : '', isPrimary? [Validators.required, Validators.email, this.customEmailValidator] : [Validators.email, this.customEmailValidator]],
            mobileNumber: [contact ? contact.mobileNumber : '', isPrimary ? [Validators.required, Validators.minLength(8)] : []],            
            countryID: [selectedCountry ? [selectedCountry.countryCode] : [], isPrimary ? Validators.required : []],
            countryCode: [selectedCountry ? selectedCountry.countryCode : '', isPrimary ? Validators.required : []]
          })
        );
      });
    // Patch pointOfContacts section
     // Fetch addresses for the customer using both customerId and userId
  this.customerService.getCustomerAddresses(customer.customerID).subscribe(
    (addresses) => {
      console.log('Fetched addresses:', addresses); // Verify that addresses are fetched
      if(addresses.length > 0){
        this.disableTransportAndPackingTab = false;
      }
      else{
        this.disableTransportAndPackingTab = true;
      }
      const addressBookFormArray = this.form.get('addressBook') as FormArray;
      addressBookFormArray.clear();
      console.log('feb 13',addresses);
      addresses.forEach((address: any) => {
        const addressGroup = this.createAddressFormGroup(); 
        addressGroup.addControl('addressID', this.fb.control(address.addressID || null));

        const addressCountry = this.allCountries.find((c) => c.countryID === address.countryID ) || this.allCountries.find( (c) => c.country?.toLowerCase() === 'netherlands' );
        addressGroup.patchValue({
          addressID: address.addressID,  // Ensure addressID is set here
          addressHeading: address.addressHeading,
          address: address.address,
          city: address.city,
          state: address.state,
          countryID: addressCountry ? [{ countryID: addressCountry.countryID, country: addressCountry.country }] : null,
          //countryID: selectedCountry ? [{ countryID: selectedCountry.countryID, country: selectedCountry.country }] : null,
         // countryID: address.countryID,
          postCode: address.postCode,
          POCName: address.pocName,
          POCEmail: address.pocEmail,
          POCMobile: address.pocMobile,
          POCCountryID: selectedCountry ? [{ countryID: selectedCountry.countryID, countryDetail: selectedCountry.country }] : null,
          //CountryCode: address.countryCode && address.countryCode !== '+' ? address.countryCode : null
          CountryCode: address.countryCode ? [address.countryCode] : []
          //POCCountryID: address.pocCountryID
        });
       // addressGroup.patchValue(address); 
        addressBookFormArray.push(addressGroup);
      });
    },
    (error) => {
      console.error('Error fetching addresses:', error);
      // Handle error appropriately
    }
  );
   // Capture initial form state and reset pristine state
   this.initialCustomerInfoState = JSON.stringify(this.form.get('customerInfo')?.value);
   this.form.get('customerInfo')?.markAsPristine();
  }

  //  onSubmit(){
  //    console.log('onSubmit');
  //  }
    // Delete method
    selectCustomerForDeletion(customer: Customer| CustomerPointOfContacts ): void {
      this.selectedCustomerId = customer.customerID;
      this.checkIfQuoteAssociated(customer.customerID);
    }
    checkCurrentPageAfterDeletion() {
    const totalRecords = this.filteredCustomers.length;
    const totalPages = Math.ceil(totalRecords / this.itemsPerPage);

  // If current page exceeds total pages, move to the last page available
     if (this.currentPage > totalPages) {
        this.currentPage = totalPages > 0 ? totalPages : 1;
     }
    }

    checkIfQuoteAssociated(customerID: any): void {
      this.customerService.checkIfCustomerAssociatedWithQuote(customerID).subscribe({
        next: (response) => {
          this.isQuoteAssociated = response;
          // if (this.isQuoteAssociated) {
          //   this.toastr.error('Cannot delete Customer RFQ as it is associated with a Quote.', 'Error', {
          //     progressBar: true
          //   });
          // } 
          // else {
          //   this.openDeleteConfirmationModal(customerRFQ.customerRFQID);
          // }
        },
        error: (error) => {
        console.log('Error:', error.message || 'Something went wrong.');
        }
      });
    }
    confirmDelete(): void {
      if (this.selectedCustomerId) {
        this.customerService.deleteCustomer(this.selectedCustomerId).subscribe(
          {
            next: (response: any) => {
              if (response && response.statusCode === 200) {
                this.toastr.success('Deleted Successfully', 'Success',{
                  progressBar: true,
                  timeOut:1500,
                  closeButton:true
                });
              } else {
                this.toastr.error('Unexpected response format or status', 'Error');
              }
              this.selectedCustomerId = null;
              const deletePopup = document.getElementById('delete-popup');
              if (deletePopup) {
                const modalInstance = bootstrap.Modal.getInstance(deletePopup);
                modalInstance?.hide();
              }
              this.getAllCustomers();
              this.checkCurrentPageAfterDeletion();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error:', error);
              if (error.status === 200) {
                this.toastr.success('Deleted Successfully', 'Success',{
                  progressBar: true,
                  timeOut:1500,
                  closeButton:true
                });
              this.selectedCustomerId = null;
                  const deletePopup = document.getElementById('delete-popup');
              if (deletePopup) {
                const modalInstance = bootstrap.Modal.getInstance(deletePopup);
                modalInstance?.hide();
              }
              this.getAllCustomers();
              this.checkCurrentPageAfterDeletion();
              } else {
                this.toastr.error('An error occurred while deleting the customer', 'Error');
              }
            }
          }
        );
      } else {
        console.error('No customer ID is set for deletion');
      }
    }
    private closeEditCustomerOffcanvas(): void {
      const editCustomerOffcanvasElement = document.getElementById('addCustomer');
      if (editCustomerOffcanvasElement) {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(editCustomerOffcanvasElement);
        if (!offcanvasInstance) {
          // If no instance exists, create a new one to ensure it can be closed
          const newOffcanvasInstance = new bootstrap.Offcanvas(editCustomerOffcanvasElement);
          newOffcanvasInstance.hide();
        } else {
          offcanvasInstance.hide();
        }
      }
    }
    selectedIndexForDeletion: number | null = null;

    //OLD CODE
    // selectedAddressForDeletion(addressGroup: any, index: number): void {
    //   console.log('Selected Address Group:', addressGroup);
    //   this.selectedIndexForDeletion = index;
    //   if (addressGroup && addressGroup.addressID) {
    //     // ✅ Direct ID
    //     this.selectedAddressId = addressGroup.addressID;
    //     console.log('Selected Address ID:', this.selectedAddressId);
    //   } else {
    //     // 🔄 Fallback using data from getCustomerAddresses
    //     this.customerService.getCustomerAddresses(this.customerID).subscribe(dbAddresses => {
    //       const transformedAddresses = dbAddresses?.map((addr: any) => ({
    //         addressID: addr.addressID
    //       })) || [];
    
    //       const fallbackAddressID = transformedAddresses?.[index]?.addressID ?? null;
    
    //       if (fallbackAddressID) {
    //         this.selectedAddressId = fallbackAddressID;
    //         console.log('Fallback Address ID from DB:', this.selectedAddressId);
    
    //         // ✅ Find index from FormArray using addressID
    //         const addressArray = this.form.get('addressBook') as FormArray;
    //         const formIndex = addressArray.controls.findIndex(group => group.value.addressID === fallbackAddressID);

    //         if (formIndex !== -1) {
    //           this.removeAddressFromFormArrayByIndex(formIndex);  // ✅ Remove using correct index
    //         } else {
    //           console.warn('Address ID found in DB but not in form, removing by ID as fallback');
    //           this.removeAddressFromFormArray(fallbackAddressID);
    //         }
    //       } 
    //       else {
    //         this.selectedAddressId = null;
    //         console.error('Address ID is undefined even from fallback DB list');
    //         this.removeAddressFromFormArray(this.selectedAddressId);
    //       }
    //     });
    //   }
    // }
    
    selectedAddressForDeletion(addressGroup: any, index: number): void {
      console.log('Selected Address Group:', addressGroup);
      this.selectedIndexForDeletion = index;

      if (addressGroup && addressGroup.addressID) {
        // ✅ Direct ID
        this.selectedAddressId = addressGroup.addressID;
        console.log('Selected Address ID:', this.selectedAddressId);
      } else {
        // 🔄 Fallback using data from getCustomerAddresses
        this.customerService.getCustomerAddresses(this.customerID).subscribe(dbAddresses => {
          const transformedAddresses = dbAddresses?.map((addr: any) => ({
            addressID: addr.addressID
          })) || [];
          const fallbackAddressID = transformedAddresses?.[index]?.addressID ?? null;
          if (fallbackAddressID) {
            this.selectedAddressId = fallbackAddressID;
            console.log('Fallback Address ID from DB:', this.selectedAddressId);
            // ✅ Find index from FormArray using addressID
            const addressArray = this.form.get('addressBook') as FormArray;
            const formIndex = addressArray.controls.findIndex(group => group.value.addressID === fallbackAddressID);
            if (formIndex !== -1) {
              console.log('[Info] Address found in form. Will delete on confirmation.');
            } else {
              console.warn('Address ID found in DB but not in form. Will attempt fallback deletion on confirmation.');
            }
          } else {
            this.selectedAddressId = null;
            console.error('Address ID is undefined even from fallback DB list');
          }
        });
      }
      this.checkIfAddressIDUsedInTransportAndPacking(this.selectedAddressId);
    }

    checkIfAddressIDUsedInTransportAndPacking(addressID: any): void {
      this.customerService.checkIfAddressIDUsedInTransportAndPacking(addressID).subscribe({
        next: (response) => {
          this.isAddressAssociated = response;
          // if (this.isQuoteAssociated) {
          //   this.toastr.error('Cannot delete Customer RFQ as it is associated with a Quote.', 'Error', {
          //     progressBar: true
          //   });
          // } 
          // else {
          //   this.openDeleteConfirmationModal(customerRFQ.customerRFQID);
          // }
        },
        error: (error) => {
        console.log('Error:', error.message || 'Something went wrong.');
        }
      });
    }

    onDelete(): void {
      if (this.selectedAddressId) {
        this.customerService.DeleteCustomerAddress(this.selectedAddressId).subscribe({
          next: (response: string) => {
            const message = response || 'Deleted Successfully';
            this.toastr.success(message, 'Success', { progressBar: true, timeOut:1500,
              closeButton:true });
            const addressArray = this.form.get('addressBook') as FormArray;
            const index = addressArray.controls.findIndex(control => control.get('addressID')?.value === this.selectedAddressId);
            if (index !== -1) {
              this.removeAddressFromFormArrayByIndex(index);
            } else {
              // ✅ Fallback: Try removing the first address with undefined or null ID
              const fallbackIndex = addressArray.controls.findIndex(control => {
                const id = control.get('addressID')?.value;
                return !id || id === null || id.trim() === '';
              });
    
              if (fallbackIndex !== -1) {
                console.warn(`Fallback removal at index ${fallbackIndex}`);
                this.removeAddressFromFormArrayByIndex(fallbackIndex);
              } else {
                console.warn('No matching addressID or fallback found. No address removed.');
              }
            }
            this.selectedAddressId = null;
            const deletePopup = document.getElementById('delete-address-popup');
            if (deletePopup) {
              const modalInstance = bootstrap.Modal.getInstance(deletePopup);
              modalInstance?.hide();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error:', error);
    
            if (error.status === 200 && typeof error.error === 'string') {
              this.toastr.success(error.error || 'Deleted Successfully', 'Success', {
                 progressBar: true,
                 timeOut:1500,
                 closeButton:true 
                });
    
              const addressArray = this.form.get('addressBook') as FormArray;
              const index = addressArray.controls.findIndex(control => control.get('addressID')?.value === this.selectedAddressId);
    
              if (index !== -1) {
                this.removeAddressFromFormArrayByIndex(index);
              } else {
                const fallbackIndex = addressArray.controls.findIndex(control => {
                  const id = control.get('addressID')?.value;
                  return !id || id === null || id.trim() === '';
                });
    
                if (fallbackIndex !== -1) {
                  this.removeAddressFromFormArrayByIndex(fallbackIndex);
                }
              }
            } else {
              this.toastr.error('An error occurred while deleting the customer', 'Error');
            }
    
            this.selectedAddressId = null;
    
            const deletePopup = document.getElementById('delete-address-popup');
            if (deletePopup) {
              const modalInstance = bootstrap.Modal.getInstance(deletePopup);
              modalInstance?.hide();
            }
          }
        });
      }
      else {
        const addressArray = this.form.get('addressBook') as FormArray;
        const emptyIndex = this.selectedIndexForDeletion;
      
        if (emptyIndex !== null && emptyIndex >= 0 && emptyIndex < addressArray.length) {
          console.warn(`Removing empty address form group at index ${emptyIndex}`);
          this.removeAddressFromFormArrayByIndex(emptyIndex);
          this.toastr.success('Empty address removed successfully', 'Success', { 
            progressBar: true,
            timeOut: 1500,
            closeButton: true 
          });
        } else {
          console.warn('No valid index found to remove empty address group.');
          this.toastr.info('No empty address found to remove', 'Info', { progressBar: true });
        }
      
        const deletePopup = document.getElementById('delete-address-popup');
        if (deletePopup) {
          const modalInstance = bootstrap.Modal.getInstance(deletePopup);
          modalInstance?.hide();
        }
      }
      
    }    
    
    
    private removeAddressFromFormArray(addressId: string): void {
      const addressArray = this.form.get('addressBook') as FormArray;
      const index = addressArray.controls.findIndex((group) => group.value.addressID === addressId);
      if (index !== -1) {
        addressArray.removeAt(index);
      }
    }
    private removeAddressFromFormArrayByIndex(index: number): void {
      const addressArray = this.form.get('addressBook') as FormArray;
      if (index >= 0 && index < addressArray.length) {
        addressArray.removeAt(index);
      } else {
        console.warn(`Invalid index: ${index}. Cannot remove address.`);
      }
    }

    //Customer Status
    openUserStatusUpdateConfirmationModal(customer: any,  event: Event): void {
      event.preventDefault();
      this.checkIfQuoteAssociated(customer.customerID);
      this.selectedCustomer = customer;
      this.originalCustomerStatus = customer.isEnabled; // Save the original status
      this.isCancelClicked = false; // Reset cancel tracking
      const modal = new bootstrap.Modal(document.getElementById('update-status-popup'));
      modal.show();
    }
    confirmUpdateStatus(): void {
      if (this.selectedCustomer) {
        const updatedStatus = !this.originalCustomerStatus; 
        const requestBody = {
          customerID: this.selectedCustomer.customerID,
          isEnabled: updatedStatus
        };
        this.customerService.updateCustomerStatus(requestBody).subscribe({
          next: (response) => {
            console.log('Customer status updated successfully:', response);
            this.selectedCustomer.isEnabled = updatedStatus; // Update UI
            this.selectedCustomer = null;
            this.toastr.success('Customer Status Updated Successfully','Success',{
              progressBar: true,
              timeOut:1500,
              closeButton:true
            });
            // const modal = bootstrap.Modal.getInstance(document.getElementById('update-status-popup'));
            // modal.hide(); // Close the modal
            this.resetUserUpdateStausModalState();
          },
          error: (error) => {
            console.error('Error updating Customer status:', error);
            alert('Failed to update Customer status.');
          }
        });
      }
    }
    cancelUpdate(): void {
      this.isCancelClicked = true; 
      this.isQuoteAssociated = false; // Reset quote association status
      if (this.selectedCustomer) {
        this.selectedCustomer.isEnabled = this.originalCustomerStatus;
        //this.user.isEnabled = this.originalUserStatus;
      }
      //this.getAllUsers(); 
      this.resetUserUpdateStausModalState();
    }
   
    resetUserUpdateStausModalState(): void {
      this.selectedCustomer = null;
      this.originalCustomerStatus = null;
      const modal = bootstrap.Modal.getInstance(document.getElementById('update-status-popup'));
      modal.hide(); 
    }

    restrictToNumbers(event: KeyboardEvent) {
      const charCode = event.charCode ? event.charCode : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault(); // Prevent non-numeric characters
      }
    }
   //Getting Primary Address Details on click of link
   getCustomerPOCDetails(event: Event): void {
  event.preventDefault();
  console.log('Fetching CustomerDetails');
  const customerID = this.customerID;
  this.customerService.getCustomerPOCDetails(customerID).subscribe(
    (address: any) => {
      console.log('Fetched Primary address:', address);
      const addressBookFormArray = this.form.get('addressBook') as FormArray;
      let addressGroup: FormGroup;
      // If at least one address exists, patch the first one
      if (addressBookFormArray.length > 0) {
        addressGroup = addressBookFormArray.at(0) as FormGroup;
      } else {
        // Otherwise, create a new one
        addressGroup = this.createAddressFormGroup();
        addressBookFormArray.push(addressGroup);
      }
      const selectedCountry = this.allCountries.find(
        (country: { countryID: string }) => country.countryID === address.countryID
      );
      const selectedPOCCountry = this.allCountries.find(
        (country: { countryID: string }) => country.countryID === address.pocCountryID
      );
      const countryCode = selectedPOCCountry?.countryCode || null;

      // Add 'addressID' control only if not already added
      if (!addressGroup.contains('addressID')) {
        addressGroup.addControl('addressID', this.fb.control(address.addressID || null));
      }
      addressGroup.patchValue({
        addressHeading: address.addressHeading || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        countryID: selectedCountry ? [{ countryID: selectedCountry.countryID,country: selectedCountry.country,countryDetail: selectedCountry.country}] : [],
        postCode: address.postCode || '',
        POCName: address.pocName || '',
        POCEmail: address.pocEmail || '',
        POCMobile: address.pocMobile || '',
        // POCCountryID: selectedPOCCountry ? [{ countryID: selectedPOCCountry.countryID, country: selectedPOCCountry.country, countryDetail: selectedPOCCountry.country }] : [],
           // CountryCode: address.countryCode ? [address.countryCode] : []
        CountryCode: countryCode ? [countryCode] : []
      });
    },
    (error) => {
      console.error('Error fetching address:', error);
    }
  );
}
    
    showLocations: boolean = true;
    //Transport and Packing

     // Prevent manual entry of numbers outside the range
    validateNoOfPallet(event: any) {
      let value = event.target.value;
      if (value < 1) {
        event.target.value = 1;
        this.form.get('transportInfo.noOfPallet')?.setValue(1);
      } else if (value > 32) {
        event.target.value = 32;
        this.form.get('transportInfo.noOfPallet')?.setValue(32);
      }
    }

    // Restrict input to numbers only
    restrictInput(event: KeyboardEvent) {
     
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
    // restrictMaxPalletHeight(event: KeyboardEvent) {
    //   const charCode = event.charCode ? event.charCode : event.keyCode;
    //   if ((charCode < 48 || charCode > 57) && charCode !== 44) {
    //     event.preventDefault(); // Prevent non-numeric and non-comma characters
    //   }
    // }
    //userLocale: string = navigator.language || 'en-US'; // Detect user locale

    restrictMaxPalletHeight(event: KeyboardEvent) {
      const charCode = event.charCode ? event.charCode : event.keyCode;
      const decimalSeparator = (1.1).toLocaleString(this.userLocale).charAt(1); // Get locale decimal separator

      if ((charCode < 48 || charCode > 57) && event.key !== decimalSeparator) {
        event.preventDefault(); // Prevent non-numeric and non-decimal-separator characters
      }
    }

    formatMaxPalletHeight(event: any) {
      let value = event.target.value;
      if (!value) return;

      // Convert input to a number
      let numberValue = parseFloat(value.replace(/[^0-9.,]/g, '')); // Remove invalid characters
      if (isNaN(numberValue)) return;

      // Format based on locale
      event.target.value = new Intl.NumberFormat(this.userLocale, { maximumFractionDigits: 2 }).format(numberValue);
    }
    
    onAllLocation(event:any){
      if(event.target.checked){
        this.showLocations = false;
      }else{
        this.showLocations = true;
      }
    

    }
    getSelectedAddressIDsForTransportAndPacking(): string {
      const selectedIds: string[] = [];
      const selectedLocationsArray = this.form.get('locationForm.selectedLocations') as FormArray;

      if (selectedLocationsArray) {
        selectedLocationsArray.controls.forEach((control, index) => {
          if (control.value) {  // Check if the checkbox is selected
            const addressId = this.customerAddressForTransportAndPacking[index]?.addressID;
            if (addressId) {
              selectedIds.push(addressId);
            }
          }
        });
      }
      return selectedIds.join(','); // Convert array to a comma-separated string
    }
    
    firstSavedAddressID: string = '';
    
    saveTransportAndPackingDetails(){
      let maxPalletHeightValue = this.form.get('transportInfo.maxPalletHeight')?.value;
      const parsedMaxPalletHeightValue = this.formatNumberValue(maxPalletHeightValue, 'max pallet height');
      const parsedTransportationCostValue = this.formatNumberValue(this.form.get('transportInfo.transportationCost')?.value, 'transportation cost');
      




       // Call this method when you need to get the selected address IDs
      const selectedAddresses = this.getSelectedAddressIDsForTransportAndPacking();
      //console.log(selectedAddresses);
      const transportCostOfOneLocation = {
        addressID: this.selectedAddressIDToViewTPDetails,
        // transportationCost: this.form.get('transportInfo.transportationCost')?.value ? this.form.get('transportInfo.transportationCost')?.value : null
        transportationCost : parsedTransportationCostValue
      }
      const transportCostsData = this.transportCosts.controls.map(control => ({
        addressID: control.get('addressID')?.value,
        transportationCost: control.get('transportationCost')?.value ? this.formatNumberValue(control.get('transportationCost')?.value, 'transportation cost') : control.get('transportationCost')?.value
      }));
      const requestBody ={
        customerID: this.customerID,  // this.customerID,
        transportID: null,
        addressIDs: this.isAnyAddressSelected ? selectedAddresses : this.selectedAddressIDToViewTPDetails,
        incotermID: this.form.get('transportInfo.incoterm')?.value[0].incotermID,
        pricingTypeID: this.form.get('transportInfo.pricingType')?.value[0].pricingTypeID,
        // price: this.form.get('transportInfo.price')?.value ? this.form.get('transportInfo.price')?.value : null,
        typeOfPalletID: this.form.get('transportInfo.typeOfPallet')?.value[0].typeOfPalletID,
        //maxPalletHeight: this.form.get('transportInfo.maxPalletHeight')?.value,
        maxPalletHeight: parsedMaxPalletHeightValue,
        noOfPallets: this.form.get('transportInfo.noOfPallet')?.value ? this.form.get('transportInfo.noOfPallet')?.value : null,

        firstLoadingTime: this.form.get('transportInfo.firstLoadingTime')?.value ? this.form.get('transportInfo.firstLoadingTime')?.value + ':00' : null,
        lastLoadingTime: this.form.get('transportInfo.lastLoadingTime')?.value ? this.form.get('transportInfo.lastLoadingTime')?.value + ':00' : null,

        transportationCostData: this.isAnyAddressSelected ? transportCostsData : [transportCostOfOneLocation],
        packingID: null,
        typeOfPackingID: this.form.get('packingInfo.packingType')?.value[0].typeOfPackingID,
        noOfBoxesPerPallet: this.form.get('packingInfo.noOfBoxesPerPallet')?.value,
        noOfPiecesPerRow: this.form.get('packingInfo.noOfPiecesPerRow')?.value ? this.form.get('packingInfo.noOfPiecesPerRow')?.value : null,
        noOfRowOnTop: this.form.get('packingInfo.noOfRowsOnTop')?.value ? this.form.get('packingInfo.noOfRowsOnTop')?.value : null,
        isCardboardLayerPad: this.form.get('packingInfo.isCardboardLayerPad')?.value ? this.form.get('packingInfo.isCardboardLayerPad')?.value : false,
        isDoubleStacked: this.form.get('packingInfo.isDoubleStacked')?.value ? this.form.get('packingInfo.isDoubleStacked')?.value : false,
        isPlasticBagForBigBox: this.form.get('packingInfo.isPlasticBagForBigBox')?.value ? this.form.get('packingInfo.isPlasticBagForBigBox')?.value : false,
        is1By8PalletBag: this.form.get('packingInfo.is1By8PalletBag')?.value ? this.form.get('packingInfo.is1By8PalletBag')?.value : false,
        packingCost: this.form.get('packingInfo.packingCost')?.value ? this.form.get('packingInfo.packingCost')?.value : null,
        createdBy: this.userID,
        updatedBy: this.userID,
        selectedPackingTypeIDs: this.form.get('packingInfo.selectedPackingTypeIDs')?.value ? this.form.get('packingInfo.selectedPackingTypeIDs')?.value : null
      }
      console.log("Req Body");
      console.log(requestBody);
      //console.log('Selected Addresses:', selectedAddresses);
     
      
      if(parsedMaxPalletHeightValue != 0 && (parsedTransportationCostValue != 0 || transportCostsData.length != 0)){ 
      
        this.customerService.createOrUpdateTransportAndPackingDetails(requestBody).subscribe({
          next: (response) => {
            //console.log('Transport and Packing data:', response);
            this.transportAndPackingDetails = response.transportAndPackingDetails;
            this.addresseIDsFromAPIResponse = this.transportAndPackingDetails.map((res: any) => res.addressID); // Extract IDs from response
            // Store the first saved address ID
            if (this.transportAndPackingDetails.length > 0 && this.transportAndPackingDetails.length == 1) {
              this.firstSavedAddressID = this.transportAndPackingDetails[0].addressID;
            }
            this.form.get('locationForm.selectedLocations')?.reset(); // Reset the checkboxes
            //this.form.reset(); // Reset the form
            this.toastr.success('Transport and Packing Details Saved Successfully', 'Success',{
              progressBar: true,
              closeButton: true
            });
            var offcanvas = document.getElementById('addCustomer');
            if (offcanvas) {
              var offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
              if (offcanvasInstance) {
                offcanvasInstance.hide(); // Hide the offcanvas
              }

              // // add data-dismiss="offcanvas" attribute to the button
              // var saveTransportPackingBtn = document.getElementById('save-transport-packing-btn');
              // if (saveTransportPackingBtn) {
              //   saveTransportPackingBtn.setAttribute('data-bs-dismiss', 'offcanvas');
              // }

              
            }
            this.loadTransportAndPackingDetailsForAnAddress(this.transportAndPackingDetails[0].addressID);
          },
          error: (error) => {
            console.error('Error adding or updating transport and packing data:', error);}
        });
      }


    }
    formatNumberValue(fieldValue: string, fieldName: string) : number {
      // if the field value has comma without dot, then return 0
      // if (fieldValue.length > 3 && fieldValue.toString().includes(',') && !fieldValue.toString().includes('.')) {
      //   this.toastr.error(`Invalid ${fieldName}. Please enter a valid number.`, 'Error', {
      //     progressBar: true
      //   });
      //   return 0;
      // }
      if(fieldValue){
        const consecutiveDots = /\.\.+/; // Matches ".." or "...."
        const consecutiveCommas = /,,+/; // Matches ",," or ",,,"
        if (consecutiveDots.test(fieldValue.toString()) || consecutiveCommas.test(fieldValue.toString())) {
          //console.error('Invalid max pallet height input:', this.form.get('transportInfo.maxPalletHeight')?.value);
          this.toastr.error(`Invalid ${fieldName}. Please enter a valid number.`, 'Error',{
            progressBar: true
          });
          //alert('Invalid stacking height. Please enter a valid number.');
          return 0;
        }
        const isCommaAsDecimal = /^\d{1,}(,\d{2})$/.test(fieldValue.toString());
 
        if (isCommaAsDecimal) {
          // Convert single comma (e.g., "12346,78" → "12346.78")
          fieldValue = fieldValue.toString().replace(',', '.');
        } else {
          // Detect if the number is in European format (thousands with dot and decimals with a comma, e.g., "4.350,25")
          const isEuropeanFormat = /^\d{1,3}(\.\d{3})*,\d{1,3}$/.test(fieldValue.toString());
          
          if (isEuropeanFormat) {
            // Convert European format: remove thousand separators (dots), change last comma to a dot
            fieldValue = fieldValue.toString().replace(/\./g, '').replace(',', '.');
          } else {
            // Remove thousand separators and keep decimal dot (assuming US format)
            fieldValue = fieldValue.toString().replace(/,/g, '');
          }
        }
          // Convert to float
          const parsedValue = parseFloat(fieldValue);
        
      
        // Ensure it's a valid number before saving
        if (isNaN(parsedValue)) {
          this.toastr.error(`Invalid ${fieldName}. Please enter a valid number.`, 'Error',{
            progressBar: true
          });
          return 0;
        }
      

        
        return parsedValue;
      }
      return 0;
    }

    isAddressAddedForTransportAndPacking(addressID: string): boolean {
      return this.addresseIDsFromAPIResponse.includes(addressID);
    }
    
    toggleSelection(addressID: string, index: number) {
      const isSelected = this.selectedAddressIds.includes(addressID);
    
      if (isSelected) {
        // Remove from selected list
        this.selectedAddressIds = this.selectedAddressIds.filter(id => id !== addressID);
        (this.form.get('locationForm.selectedLocations') as FormArray).controls[index].setValue(false);
      } else {
        // Add to selected list
        this.selectedAddressIds.push(addressID);
        (this.form.get('locationForm.selectedLocations') as FormArray).controls[index].setValue(true);
      }
    }
    selectedAddressIDToViewTPDetails : string = '';
    toggleCheckbox(index: number) {
      const formArray = this.form.get('locationForm.selectedLocations') as FormArray;
      const currentValue = formArray.at(index).value;
      formArray.at(index).setValue(!currentValue);

      //this.checkTransportAndPackingDetailsForAllAddresses();
    }

    loadTransportAndPackingDetailsForAnAddress(addressID: string, checkboxIndex?: number) {
      if(checkboxIndex != undefined){
        this.toggleCheckbox(checkboxIndex!);

      }
      const allAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
      if(allAddressIDs.includes(',') || allAddressIDs ==''){
        this.clearAllFieldsInTransportAndPacking();
        return;
      }
      // this.form.get('transportInfo.price')?.clearValidators();
      // this.form.get('transportInfo.price')?.patchValue(null);
      // this.form.get('transportInfo.price')?.updateValueAndValidity(); // Important!
      this.form.get('transportInfo.noOfPallet')?.clearValidators();
      this.form.get('transportInfo.noOfPallet')?.patchValue(null);
      this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
      //this.form.get('transportInfo.price')?.markAsUntouched();
      this.form.get('transportInfo.noOfPallet')?.markAsUntouched();
      //this.form.get('transportInfo.price')?.markAsPristine();
      this.form.get('transportInfo.noOfPallet')?.markAsPristine();
      // this.form.get('transportInfo.incoterm')?.reset();
      // this.form.get('packingInfo')?.reset();
      
      this.incotermValidationFlag = false;
      this.typeOfPalletValidationFlag = false;
      this.pricePalletValidationFlag = false;
      this.packingTypeValidationFlag = false;
      this.firstSavedAddressID = '';
      this.selectedAddressIDToViewTPDetails = addressID;
      const requestBody ={
        addressIDs: allAddressIDs ? allAddressIDs : addressID
      }
      if(addressID)
      {
        
        
        this.customerService.getTransportAndPackingDetails(requestBody).subscribe({
          next: (response) => {
            console.log('Transport and Packing data For an Address:', response);
          this.transportAndPackingDetailsForAnAddress = response;
          if(this.transportAndPackingDetailsForAnAddress.length > 0){

              // Bind the transportation cost from response to respective address

              const control = this.transportCosts.controls.find(ctrl => ctrl.get('addressID')?.value ==addressID);
        
              if(control){
                control.patchValue({ transportationCost: this.formatBasedOnLocale(this.formatBasedOnLocale(this.transportAndPackingDetailsForAnAddress[0].transportationCost)) });
              }
              if(control == undefined){
                this.transportCosts.clear();
                const newControl = this.fb.group({
                  addressID: [this.transportAndPackingDetailsForAnAddress[0].addressID],
                  transportationCost: [this.formatBasedOnLocale(this.transportAndPackingDetailsForAnAddress[0].transportationCost)]
                });
                this.transportCosts.push(newControl);
              }
              // if(control == undefined){
              //   this.transportCosts.clear();
              //   const selectedAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
              //   if(!selectedAddressIDs.includes(addressID)){
              //     const addressID = selectedAddressIDs;
              //     const newControl = this.fb.group({
              //     addressID: addressID,
              //     transportationCost: [(this.formatBasedOnLocale(this.transportAndPackingDetailsForAnAddress[0].transportationCost))]
              //   });
              //   this.transportCosts.push(newControl);
              //   }
               
                
              // }

              this.form.get('transportInfo.incoterm')?.patchValue([{ incotermID: this.transportAndPackingDetailsForAnAddress[0].incotermID, incoterm: this.transportAndPackingDetailsForAnAddress[0].incoterm }]);
              this.selectedIncotermName = this.transportAndPackingDetailsForAnAddress[0].incoterm;

              if(this.transportAndPackingDetailsForAnAddress[0].incoterm == 'DAP (Delivery at Place)'){
              
                // this.showPriceTextBox = false;
                // this.form.get('transportInfo.price')?.clearValidators();
                // this.form.get('transportInfo.price')?.patchValue(null);
              }
              else{
                // this.showPriceTextBox = true;
                // this.form.get('transportInfo.price')?.setValidators([Validators.required]);
              }
              //this.form.get('transportInfo.price')?.updateValueAndValidity(); // Important!
              this.form.get('transportInfo.pricingType')?.patchValue([{ pricingTypeID: this.transportAndPackingDetailsForAnAddress[0].pricingTypeID, pricingType: this.transportAndPackingDetailsForAnAddress[0].pricingType }]);
              this.selectedPricePalletName = this.transportAndPackingDetailsForAnAddress[0].pricingType;
              // if(this.transportAndPackingDetailsForAnAddress[0].pricingType == 'Price per Pallet'){
              //   this.showNoOfPalletTextBox = true;
              //   this.form.get('transportInfo.noOfPallet')?.setValidators([Validators.required, Validators.min(1), Validators.max(32)]);
              // }
              // else{
              //   this.showNoOfPalletTextBox = false;
              //   this.form.get('transportInfo.noOfPallet')?.clearValidators();
              //   this.form.get('transportInfo.noOfPallet')?.patchValue(null);
              // }
              // this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
              // show no of pallet textbox only if type of pallet and pricing type is selected
              if(this.transportAndPackingDetailsForAnAddress[0].pricingType && this.transportAndPackingDetailsForAnAddress[0].typeOfPallet){
                this.showNoOfPalletTextBox = true;
                this.form.get('transportInfo.noOfPallet')?.setValidators([Validators.required, Validators.min(1)]);
            
              }
              else{
                this.showNoOfPalletTextBox = false;
                this.form.get('transportInfo.noOfPallet')?.clearValidators();
              }
              this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
              //this.showNoOfPalletTextBox = true;
              
              //this.form.get('transportInfo.price')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].price);
              this.form.get('transportInfo.typeOfPallet')?.patchValue([{ typeOfPalletID: this.transportAndPackingDetailsForAnAddress[0].typeOfPalletID, typeOfPallet: this.transportAndPackingDetailsForAnAddress[0].typeOfPallet }]);

              this.selectedTypeOfPalletName = this.transportAndPackingDetailsForAnAddress[0].typeOfPallet;

              this.form.get('transportInfo.maxPalletHeight')?.patchValue(this.formatBasedOnLocale(this.transportAndPackingDetailsForAnAddress[0].maxPalletHeight));
              this.form.get('transportInfo.noOfPallet')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].noOfPallets);

              this.form.get('transportInfo.firstLoadingTime')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].firstLoadingTime ? this.transportAndPackingDetailsForAnAddress[0].firstLoadingTime.substring(0, 5) : null);
              this.form.get('transportInfo.lastLoadingTime')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].lastLoadingTime ? this.transportAndPackingDetailsForAnAddress[0].lastLoadingTime.substring(0, 5) : null);

              this.form.get('transportInfo.transportationCost')?.patchValue(this.formatBasedOnLocale(this.transportAndPackingDetailsForAnAddress[0].transportationCost)); // Important!
              this.form.get('packingInfo.packingType')?.patchValue([{ typeOfPackingID: this.transportAndPackingDetailsForAnAddress[0].typeOfPackingID, typeOfPacking: this.transportAndPackingDetailsForAnAddress[0].typeOfPacking }]);
              this.showOrHideNoOfPiecesPerRowAndNoOfRowsOnTop(this.transportAndPackingDetailsForAnAddress[0].typeOfPacking);
              this.showOrHidePackingCheckboxes(this.transportAndPackingDetailsForAnAddress[0].typeOfPallet, this.transportAndPackingDetailsForAnAddress[0].typeOfPackingID, this.transportAndPackingDetailsForAnAddress[0]);

              

              // if(this.transportAndPackingDetailsForAnAddress[0].typeOfPacking == 'Big Pallet Box' || this.transportAndPackingDetailsForAnAddress[0].typeOfPacking == 'Large Export Box' || this.transportAndPackingDetailsForAnAddress[0].typeOfPacking == 'Returnable Box'){
              // this.showPlasticBigBoxCheckbox = true;
              // this.showDoubleStackedCheckbox = true;

              // }
              // else{
              //   this.showPlasticBigBoxCheckbox = false;
              //   this.showDoubleStackedCheckbox = false;
              // }
              // if(this.transportAndPackingDetailsForAnAddress[0].typeOfPacking == '40DG' || this.transportAndPackingDetailsForAnAddress[0].typeOfPacking == '60DG'){
              //   this.show1By8PalletBagCheckbox = true;
              // }
              // else{
              //   this.show1By8PalletBagCheckbox = false;
              // }
              this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].noOfBoxesPerPallet);
              this.form.get('packingInfo.noOfPiecesPerRow')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].noOfPiecesPerRow);
              this.form.get('packingInfo.noOfRowsOnTop')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].noOfRowOnTop);
              this.form.get('packingInfo.isCardboardLayerPad')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].isCardboardLayerPad);
              this.form.get('packingInfo.isDoubleStacked')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].isDoubleStacked);
              this.form.get('packingInfo.isPlasticBagForBigBox')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].isPlasticBagForBigBox);
              this.form.get('packingInfo.is1By8PalletBag')?.patchValue(this.transportAndPackingDetailsForAnAddress[0].is1By8PalletBag);

            
            }
            else{
              this.clearAllFieldsInTransportAndPacking();
            }
          }
        });
      }
      //this.fetchTransportationCostForSelectedLocations();
    }
    // Below method is to check if the details are same for all addresses
    checkTransportAndPackingDetailsForAllAddresses() {
      this.showTransportAndPackingInfoMessage = false;
      const allAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
      if(allAddressIDs){
        const addressIDArray = allAddressIDs.split(',').map((id : string) => id.trim()); // Split and trim address IDs
        let firstResponse: any = null;
        let allSame = true;
        let requests: any[] = [];
      
        addressIDArray.forEach((addressID : string)=> {
          requests.push(this.customerService.getTransportAndPackingDetails({ addressIDs: addressID }));
          //requests.push(this.loadTransportAndPackingDetailsForAnAddress(addressID));
        });
      
        forkJoin(requests).subscribe((responses) => {
          responses.forEach((response, index) => {
            if (index === 0) {
              firstResponse = response;
            } else if (response && firstResponse) {
              // if (JSON.stringify(response) !== JSON.stringify(firstResponse)) {
              //   allSame = false;
              // }

              if (
                response[0].incotermID != firstResponse[0].incotermID ||
                response[0].typeOfPalletID != firstResponse[0].typeOfPalletID ||
                response[0].pricingTypeID != firstResponse[0].pricingTypeID ||
                response[0].noOfPallets != firstResponse[0].noOfPallets ||
                response[0].maxPalletHeight != firstResponse[0].maxPalletHeight ||
                response[0].firstLoadingTime != firstResponse[0].firstLoadingTime ||
                response[0].lastLoadingTime != firstResponse[0].lastLoadingTime ||
                response[0].transportationCost != firstResponse[0].transportationCost ||
                response[0].typeOfPackingID != firstResponse[0].typeOfPackingID ||
                response[0].noOfBoxesPerPallet != firstResponse[0].noOfBoxesPerPallet ||
                response[0].noOfPiecesPerRow != firstResponse[0].noOfPiecesPerRow ||
                response[0].noOfRowOnTop != firstResponse[0].noOfRowOnTop ||
                response[0].isCardboardLayerPad != firstResponse[0].isCardboardLayerPad ||
                response[0].isDoubleStacked != firstResponse[0].isDoubleStacked ||
                response[0].isPlasticBagForBigBox != firstResponse[0].isPlasticBagForBigBox ||
                response[0].is1By8PalletBag != firstResponse[0].is1By8PalletBag
              ) {
                console.log("Hitting Console");
                allSame = false;
              }
            }
          });
      
          if (allSame) {
            console.log("Details are same for all Addresses");
            this.showTransportAndPackingInfoMessage = false;
            this.selectedAddressIDToViewTPDetails = this.getSelectedAddressIDsForTransportAndPacking();
            //this.selectedAddressIDToViewTPDetails = firstResponse[0].addressID;
            this.loadTransportAndPackingDetailsForAnAddress(this.selectedAddressIDToViewTPDetails);
          } else {
            this.showTransportAndPackingInfoMessage = true;
            this.selectedAddressIDToViewTPDetails = '';
            this.clearAllFieldsInTransportAndPacking();
            console.log("Details are not same for all Addresses");
          }

          
        });
      }
      else{
       
        this.selectedAddressIDToViewTPDetails = '';
        this.clearAllFieldsInTransportAndPacking();
      }
    }

    compareAddressDetails(): void {
      this.showTransportAndPackingInfoMessage = false;
      const selectedAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
      const addressIDs = selectedAddressIDs.split(',').map(id => id.trim());
      const addressDetailsList: any[] = [];
      if (addressIDs.length > 0) {
    
      const fetchAddressPromises = addressIDs.map(id => this.customerService.getTransportAndPackingDetails({ addressIDs: id }).toPromise());
      
    
      Promise.all(fetchAddressPromises).then((detailsList) => {
        addressDetailsList.push(...detailsList);
    
        const areAllDetailsSame = addressDetailsList.every(detail => 
          //JSON.stringify(detail) === JSON.stringify(addressDetailsList[0])
          detail.incotermID == addressDetailsList[0].incotermID &&
          detail.typeOfPalletID == addressDetailsList[0].typeOfPalletID &&
          detail.pricingTypeID == addressDetailsList[0].pricingTypeID &&
          detail.noOfPallets == addressDetailsList[0].noOfPallets &&
          detail.maxPalletHeight == addressDetailsList[0].maxPalletHeight &&
          detail.firstLoadingTime == addressDetailsList[0].firstLoadingTime &&
          detail.lastLoadingTime == addressDetailsList[0].lastLoadingTime &&
          detail.transportationCost == addressDetailsList[0].transportationCost &&
          detail.packingID == addressDetailsList[0].packingID &&
          detail.typeOfPackingID == addressDetailsList[0].typeOfPackingID &&
          detail.noOfBoxesPerPallet == addressDetailsList[0].noOfBoxesPerPallet &&
          detail.noOfPiecesPerRow == addressDetailsList[0].noOfPiecesPerRow &&
          detail.noOfRowOnTop == addressDetailsList[0].noOfRowOnTop &&
          detail.isCardboardLayerPad == addressDetailsList[0].isCardboardLayerPad &&
          detail.isDoubleStacked == addressDetailsList[0].isDoubleStacked &&
          detail.isPlasticBagForBigBox == addressDetailsList[0].isPlasticBagForBigBox &&
          detail.is1By8PalletBag == addressDetailsList[0].is1By8PalletBag 

        );
    
        if (areAllDetailsSame) {
          console.log('All address details are the same.');
          this.showTransportAndPackingInfoMessage = false;
          this.showTransportAndPackingInfoMessage = false;
          this.selectedAddressIDToViewTPDetails = addressDetailsList[0].addressID;
          //this.selectedAddressIDToViewTPDetails = firstResponse[0].addressID;
          this.loadTransportAndPackingDetailsForAnAddress(this.selectedAddressIDToViewTPDetails);
        } else {
          console.log('Address details are different.');
          this.showTransportAndPackingInfoMessage = true;
            this.selectedAddressIDToViewTPDetails = '';
            this.clearAllFieldsInTransportAndPacking();
        }
      }).catch(error => {
        console.error('Error fetching address details while comparing:', error);
      });
    }
    }
    
    clearAllFieldsInTransportAndPacking(){
      // Reset the Transport and Packing form
            // this.form.get('transportInfo')?.reset();
            // this.form.get('packingInfo')?.reset();
            this.form.get('transportInfo.incoterm')?.patchValue([]);
            this.form.get('transportInfo.pricingType')?.patchValue([]);
            //this.form.get('transportInfo.price')?.patchValue(null);
            this.form.get('transportInfo.typeOfPallet')?.patchValue([]);
            this.form.get('transportInfo.maxPalletHeight')?.patchValue(null);
            this.form.get('transportInfo.noOfPallet')?.patchValue(null);
            this.form.get('transportInfo.transportationCost')?.patchValue(0);
            // markAsUntouched() and markAsPristine() are important to reset the form
            this.form.get('transportInfo.maxPalletHeight')?.markAsPristine();
            this.form.get('transportInfo.maxPalletHeight')?.markAsUntouched();
            this.form.get('transportInfo.noOfPallet')?.markAsPristine();
            this.form.get('transportInfo.noOfPallet')?.markAsUntouched();
            this.form.get('transportInfo.transportationCost')?.markAsPristine();
            this.form.get('transportInfo.transportationCost')?.markAsUntouched();
            this.form.get('packingInfo.packingType')?.patchValue([]);
            this.form.get('packingInfo.noOfBoxesPerPallet')?.patchValue(null);
            this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsPristine();
            this.form.get('packingInfo.noOfBoxesPerPallet')?.markAsUntouched();
            this.form.get('packingInfo.noOfPiecesPerRow')?.patchValue(null);
            this.form.get('packingInfo.noOfPiecesPerRow')?.markAsPristine();
            this.form.get('packingInfo.noOfPiecesPerRow')?.markAsUntouched();
            this.form.get('packingInfo.noOfRowsOnTop')?.patchValue(null);
            this.form.get('packingInfo.noOfRowsOnTop')?.markAsPristine();
            this.form.get('packingInfo.noOfRowsOnTop')?.markAsUntouched();
            this.form.get('packingInfo.isCardboardLayerPad')?.patchValue(false);
            this.form.get('packingInfo.isDoubleStacked')?.patchValue(false);
            this.form.get('packingInfo.isPlasticBagForBigBox')?.patchValue(false);
            this.form.get('packingInfo.is1By8PalletBag')?.patchValue(false);

            //
            this.form.get('transportInfo.firstLoadingTime')?.patchValue(null);
            this.form.get('transportInfo.lastLoadingTime')?.patchValue(null);
            //
            this.showNoOfBoxesPerPallet = false;
            this.showNoOfPiecesPerRow = false;
            this.showNoOfRowsOnTop = false;
            this.showNoOfPalletTextBox = false;
            this.showPriceTextBox = false;
            // Do not the checkbox options for packing
            this.showOrHidePackingCheckboxes('', '00000000-0000-0000-0000-000000000000')
            this.selectedIncotermName = '';
            this.selectedTypeOfPalletName = '';
    }
    formatBasedOnLocale(value: any) {

      // console.log('Value in formatBasedOnLocale method:', value);
      // console.log('Type of value in formatBasedOnLocale method:', typeof value);
      
       // check value type is string
      if (typeof value === 'string' && value != '') {
        // Parse the string to a number
        value = parseFloat(value.replace(/,/g, ''));
      }
      //const locale = navigator.language || 'en-US';
      const locale = 'en-US';
      const regionValue=new Intl.NumberFormat(locale).format(value);
      return regionValue;
    }
    
    disableTransportAndPackingTabOnCancel(){
      this.isEditing = false;
      this.isEditingMode = false;
      this.disableTransportAndPackingTab = true;
      this.setActiveTab(1);

      this.selectedAddressIDToViewTPDetails = '';
      this.firstSavedAddressID = '';
      this.selectedAddressIds = [];
      this.form.get('locationForm.selectedLocations')?.reset();
      this.addresseIDsFromAPIResponse = [];
      this.transportAndPackingDetailsForAnAddress = [];
      this.form.get('transportInfo')?.reset();
      this.form.get('packingInfo')?.reset();
      this.form.get('locationForm')?.reset();

      this.form.get('customerInfo')?.reset();
      this.form.get('pointOfContacts')?.reset();
      this.form.get('addressBook')?.reset();

      this.showNoOfBoxesPerPallet = false;
      this.showNoOfPiecesPerRow = false;
      this.showNoOfRowsOnTop = false;
      this.showPriceTextBox = false;
      this.showNoOfPalletTextBox = false;
      // this.form.get('transportInfo.price')?.clearValidators();
      // this.form.get('transportInfo.price')?.patchValue(null);
      // this.form.get('transportInfo.price')?.updateValueAndValidity(); // Important!
      this.form.get('transportInfo.noOfPallet')?.clearValidators();
      this.form.get('transportInfo.noOfPallet')?.patchValue(null);
      this.form.get('transportInfo.noOfPallet')?.updateValueAndValidity(); // Important!
      //this.form.get('transportInfo.price')?.markAsUntouched();
      this.form.get('transportInfo.noOfPallet')?.markAsUntouched();
      //this.form.get('transportInfo.price')?.markAsPristine();
      this.form.get('transportInfo.noOfPallet')?.markAsPristine();

      this.showDiscountMessage = false;
      this.customerTypesValidationFlag = false;
      this.paymentTermsValidationFlag = false;
      this.countryValidationFlag = false;
      this.showTextBox = false;

    }
    private populatePackingOptions(options: any[]): void {
      const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
      packingOptionsArray.clear(); // Clear existing form controls
  
      options.forEach(option => {
        const formControlName = this.getControlName(option.packingType);
        if (formControlName) {
          packingOptionsArray.push(
            this.fb.group({
              name: [option.packingType], // Store name for reference
              checked: [false], // Checkbox state
              cost: [{ value: option.cost, disabled: true }] // Cost field, disabled initially
            })
          );
        }
      });
    }
    // Helper function to map packing type to control names
    getControlName(packingType: string): string | null {
      const mapping: Record<string, string> = {
        "Cardboard layer pad (2 per pallet)": "isCardboardLayerPad",
        "Plastic big bag for big box": "isPlasticBagForBigBox",
        "1/8 pallet bag": "is1By8PalletBag",
        "Double Stacked": "isDoubleStacked"
      };
    
      return mapping[packingType] ?? null; // Use nullish coalescing operator
    }
    onCheckboxChange(event: any, index: number, ) {
      const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
      const control = packingOptionsArray.at(index);
  
      if (event.target.checked) {
        control.get('cost')?.enable(); // Enable cost field when checked
        // this.calculatePackingCost(); // Calculate total cost
      } else {
        control.get('cost')?.disable(); // Disable cost field when unchecked
        //control.get('cost')?.setValue(''); // Reset cost field
        // this.calculatePackingCost(); // Calculate total cost
      }
    }
    // populatePackingOptions2() {
    //   const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
    //   packingOptionsArray.clear();
    
    //   this.allPackingTypes.forEach(option => {
    //     packingOptionsArray.push(new FormControl(false));
    //   });
    // }
    populatePackingOptions2(packingData?: any) {
      const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
      packingOptionsArray.clear(); // Clear old values before binding new ones

      let selectedPackingIDs: string[] = []; // Array to store selected option IDs

      console.log('populatePackingOptions2 PackingData', packingData);
    
      this.allPackingTypes.forEach(option => {
        //let isChecked = false;
    
        // Match checkbox options with respective API boolean properties
        // switch (option.packingType) {
        //   case 'Cardboard layer pad (2 per pallet)':
        //     isChecked = packingData ? packingData.isCardboardLayerPad : false;
        //     break;
        //   case 'Plastic big bag for big box':
        //     isChecked = packingData ? packingData.isPlasticBagForBigBox : false;
        //     break;
        //   case 'Double Stacked':
        //     isChecked = packingData ? packingData.isDoubleStacked : false;
        //     break;
        //   case '1/8 pallet bag':
        //     isChecked = packingData ? packingData.is1By8PalletBag : false;
        //     break;
        // }
        let isChecked = true; // Set all checkboxes as checked by default
         // If packingData is present, override with API values
        if (packingData) {
          switch (option.packingType) {
            case 'Cardboard layer pad (2 per pallet)':
              isChecked = packingData.isCardboardLayerPad;
              break;
            case 'Plastic big bag for big box':
              isChecked = packingData.isPlasticBagForBigBox;
              break;
            case 'Double Stacked':
              isChecked = packingData.isDoubleStacked;
              break;
            case '1/8 pallet bag':
              isChecked = packingData.is1By8PalletBag;
              break;
          }
        }
        else {
          switch (option.packingType) {
            case 'Cardboard layer pad (2 per pallet)':
              this.form.get('packingInfo')?.patchValue({ isCardboardLayerPad: true }); // Set default value true for packing options
              break;
            case 'Plastic big bag for big box':
              this.form.get('packingInfo')?.patchValue({ isPlasticBagForBigBox: true }); // Set default value true for packing options
              break;
            case 'Double Stacked':
              this.form.get('packingInfo')?.patchValue({ isDoubleStacked: true }); // Set default value true for packing options
              break;
            case '1/8 pallet bag':
              this.form.get('packingInfo')?.patchValue({ is1By8PalletBag: true }); // Set default value true for packing options
              break;
          }
        }
    
        packingOptionsArray.push(new FormControl(isChecked));
       
        if (isChecked) {
          selectedPackingIDs.push(option.packingTypeID); // Assuming each option has an 'id' property
        }
        this.form.get('packingInfo.selectedPackingTypeIDs')?.patchValue(selectedPackingIDs.join(',') || null);
      });
    }
    checkAndPopulateDetails(){
      const selectedAddressIDs = this.getSelectedAddressIDsForTransportAndPacking();
      this.loadTransportAndPackingDetailsForAnAddress(selectedAddressIDs);
    }

    onCheckboxChange2(event: any, index: number) {
      const packingOptionsArray = this.form.get('packingInfo.packingOptions') as FormArray;
      const option = this.allPackingTypes[index];
    
      // Update the respective boolean property based on packingType
      switch (option.packingType) {
        case 'Cardboard layer pad (2 per pallet)':
          //this.packingForm.patchValue({ isCardboardLayerPad: event.target.checked });
          this.form.get('packingInfo')?.patchValue({ isCardboardLayerPad: event.target.checked });
          break;
        case 'Plastic big bag for big box':
          this.form.get('packingInfo')?.patchValue({ isPlasticBagForBigBox: event.target.checked });
          break;
        case 'Double Stacked':
          this.form.get('packingInfo')?.patchValue({ isDoubleStacked: event.target.checked });
          break;
        case '1/8 pallet bag':
          this.form.get('packingInfo')?.patchValue({ is1By8PalletBag: event.target.checked });
          break;
      }
    
      // Update selectedPackingTypeIDs
      const selectedIds = this.allPackingTypes
        .filter((_, i) => packingOptionsArray.at(i).value)
        .map(option => option.packingTypeID)
        .join(',');
    
        this.form.get('packingInfo')?.patchValue({ selectedPackingTypeIDs: selectedIds });
    }
}


