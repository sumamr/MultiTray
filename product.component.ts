import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonService } from '../../Core/Services/common.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../Core/Services/session.service';
import { ProductsService } from '../../Core/Services/products.service';
import { CustomerService } from '../../Services/customer.service';
import { Customer, CustomerDetails } from '../../Models/customer.model';
import { ProductDetail, Products } from '../../Models/product.model';
import { Colors } from '../../Models/colors.model';
import { RawMaterials } from '../../Models/rawmaterials.model';
import { ColorsService } from '../../Core/Services/colors.service';
import { RawMaterialsService } from '../../Core/Services/raw-materials.service';
import { AddproductoffcanvasService } from '../../Core/Services/addproductoffcanvas.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductQuestions } from '../../Models/productquestions.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AddProductComponent } from '../Shared/add-product/add-product.component';
import { Console } from 'console';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerRfqService } from '../../Core/Services/customer-rfq.service';
//import bootstrap from '../../../main.server';

declare var bootstrap: any;
@Component({
  selector: 'app-product',
  imports: [FormsModule,CommonModule,NgxPaginationModule,NgMultiSelectDropDownModule,AddProductComponent],
 
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
 
export class ProductComponent implements OnInit{
  searchQuery: string = ''; 
  @Input() productDataFromProductsPage: any; 
  isEditMode = false;  
  private previousSelectedCustomer: any = null;
  photo!: File | null; // Initialize photo as null
  imagePreview: SafeUrl | null = null;
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.photo = input.files[0]; 
      const reader = new FileReader();

      // Read the file as a Data URL to display the preview
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string; 
      };
      // this.newProduct.photoFile = this.photo; // Assign the file to the newProduct object
      reader.readAsDataURL(this.photo);
    }
  }
  removeImage(): void {
    this.photo = null!;
    this.imagePreview = null;
  }
  disableRightClick(event: MouseEvent): void {
    event.preventDefault(); 
  }
  ProductsService = inject(ProductsService);
  //products: any[] = [];
  allProducts: Products[] = [];
  products : ProductDetail[]=[];
  filteredProduts: ProductDetail[] = [];
  selectedProduct: any = null;
  selectedProductDetails: Products[]=[];
  customerDropdownList: any[] = [];
  
  allCustomers:[]=[];
  //  allCustomers:Customer[]=[];
  userID : any;
  allCustomerDetails:CustomerDetails[] = [];
  allColors:Colors[]=[];
  allRawMaterials:RawMaterials[]=[];
  currentPage: number = 1;
  itemsPerPage: number = 9;
  allProductQuestions:ProductQuestions[]=[];
  originalProductStatus: boolean | null = null; 
  isCancelClicked: boolean = false; 
  isPotentialProduct:boolean = false;

  isQuoteAssociated: boolean = false; // Flag to check if quote is associated with the Product
  
 
 
  productDetails:ProductDetail[]=[];

  selectedProductDetailss: ProductDetail = {
    productID :'',
    productName:'',
    articleNumber:'',
    productLength:0,
    clientArticle:'',
    rawMaterialID:'',
    width:0,
    height:0,
    thickness:'',
    piecesPerBox:0,
    rawMaterialName:'',
    colorName:'',
    colorID:'',
    customerID:'',
    customerName:'',
    netBoxWeight:0,
    boxDimensions:0,
    nettWeight:'',
    description:'',
    isEnabled:false,
    boxDimensionsHeight:0,
    boxDimensionsWidth:0,
    boxDimensionsLength:0,
    numberOfCavitiesPerTray:0,
    ProductQuestionID: '',
    productsQuestions:'',
    isPotentialProduct:false,
    isDeleted:false,
    stackingHeight: '',
    photo:null,
    updatedBy: '',
    density:1.33,
  
 }
  
  newProduct: Products = {
     productID :'',
     productName:'',
     articleNumber:'',
     productLength:null,
     clientArticle:'',
     rawMaterialID:'',
     width:null,
     height:null,
     thickness:'',
     piecesPerBox:null,
     colorID:'',
     customerID:'',
     netBoxWeight:null,
     boxDimensions:null,
     nettWeight:'',
     description:'',
     isPotentialProduct:false,
     isDeleted:false,
     isEnabled:false,
     photo:null,
     stackingHeight:'',
     boxDimensionsHeight:null,
     boxDimensionsWidth:null,
     boxDimensionsLength:null,
     numberOfCavitiesPerTray:null,
     ProductQuestionID: '',
     density: 1.33,
  }
 

  ProductDetail:ProductDetail={
    productID:'',
    productName:'',
    articleNumber:'',
    clientArticle:'',
    rawMaterialID:'',
    rawMaterialName:'',
    colorID:'',
    colorName:'',
    customerID:'',
    customerName:'',
    productLength:0,
    width:0,
    height:0,
    thickness:'',
    piecesPerBox:0,
    nettWeight:'',
    boxDimensions:0,
    netBoxWeight:0,
    description:'',
    isEnabled:false,
    boxDimensionsHeight:0,
    boxDimensionsWidth:0,
    boxDimensionsLength:0,
    numberOfCavitiesPerTray:0,
    ProductQuestionID: '',
    productsQuestions:'',
    isPotentialProduct:false,
    stackingHeight:'',
    isDeleted:false,
    photo:null,
    updatedBy: '',
    density:1.33,

  }


getFormattedDescription(description: string | null): string {
  return description ? description.replace(/\n/g, '<br>') : '';
}


  rawMaterialsDropdownSettings: IDropdownSettings = {};
  selectedRawMaterials: any[] = [];
  rawMaterialsValidationFlag: boolean = false;
 
  colorsDropdownSettings: IDropdownSettings = {};
  selectedColors: any[] = [];
  colorsValidationFlag: boolean = false;
 
  customerDropdownSettings: IDropdownSettings = {};
  selectedCustomers: any[] = [];
  customersValidationFlag: boolean = false;

  productQuestionsDropdownSettings: IDropdownSettings = {};
  selectedProuctQuestions: any[] = [];
  productQuestionsValidationFlag: boolean = false;
 
  colorService = inject(ColorsService);
  commonService = inject(CommonService);
  customerService = inject(CustomerService);
  productService = inject(ProductsService);
  rawMaterialsService = inject(RawMaterialsService);
  toastr = inject(ToastrService);
  sessionService = inject(SessionService);
  addProductOffcanvasService = inject(AddproductoffcanvasService);
  customerRFQService = inject(CustomerRfqService);
  console: any;

  selectedCustomersforAddProduct: { customerID: string; customerName: string }[] = [];
  additionalDetailsForAddProduct = { customerID: '', customerName: '', isPotentialProduct: false }; 

  //Multiple Space validation
  sanitizeInput(property: Exclude<keyof Products, 'rawMaterialID' | 'colorID' | 'customerID' | 'productLength' | 'width' | 'height' | 'thickness' | 'piecesPerBox' | 'nettWeight' | 'netBoxWeight' | 'photo' | 'boxDimensions' | 'isEnabled' | 'isDeleted' | 'isPotentialProduct' | 'stackingHeight' | 'boxDimensionsHeight' | 'boxDimensionsWidth' | 'boxDimensionsLength' | 'numberOfCavitiesPerTray' | 'ProductQuestionID' | 'density'>) {
    if (this.newProduct[property]) {
      // Remove multiple spaces & trim leading/trailing spaces
      this.newProduct[property] = this.newProduct[property].replace(/\s+/g, ' ').trim();
    }
  }
  handlePaste(event: ClipboardEvent, property: Exclude<keyof Products, 'rawMaterialID' | 'colorID' | 'customerID' | 'productLength' | 'width' | 'height' | 'thickness' | 'piecesPerBox' | 'nettWeight' | 'netBoxWeight' | 'photo' | 'boxDimensions' | 'isEnabled' | 'isDeleted' | 'isPotentialProduct' | 'stackingHeight' | 'boxDimensionsHeight' | 'boxDimensionsWidth' | 'boxDimensionsLength' | 'numberOfCavitiesPerTray' | 'ProductQuestionID' | 'density'>) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
        const sanitizedText = pastedText.replace(/\s+/g, ' ').trim();
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
       
        const currentValue = this.newProduct[property] || '';
        const beforeSelection = currentValue.substring(0, start);
        const afterSelection = currentValue.substring(end);
       
        this.newProduct[property] = `${beforeSelection}${sanitizedText}${afterSelection}`.replace(/\s+/g, ' ').trim();
    }
}
handlePasteForDesription(event: ClipboardEvent, property: Exclude<keyof Products, 'rawMaterialID' | 'colorID' | 'customerID' | 'productLength' | 'width' | 'height' | 'thickness' | 'piecesPerBox' | 'nettWeight' | 'netBoxWeight' | 'photo' | 'boxDimensions' | 'isEnabled' | 'isDeleted' | 'isPotentialProduct' | 'stackingHeight' | 'boxDimensionsHeight' | 'boxDimensionsWidth' | 'boxDimensionsLength' | 'numberOfCavitiesPerTray' | 'ProductQuestionID' | 'density'>) {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData('text');
  if (pastedText) {
    const sanitizedText = pastedText.replace(/\s+/g, ' ').trim();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const currentValue = this.newProduct[property] || '';
    const beforeSelection = currentValue.substring(0, start);
    const afterSelection = currentValue.substring(end);

    const newValue = `${beforeSelection}${sanitizedText}${afterSelection}`.replace(/\s+/g, ' ').trim();

    // Enforce max length of 50 characters
    this.newProduct[property] = newValue.substring(0, 800);
  }
}
preventMultipleSpaces(event: KeyboardEvent, property: keyof typeof this.newProduct) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const currentValue = input.value;
 
    // Prevent leading space
    if (event.key === ' ' && cursorPosition === 0) {
      event.preventDefault();
    }
 
    // Prevent multiple spaces anywhere
    if (event.key === ' ' && (currentValue[cursorPosition - 1] === ' ' || currentValue[cursorPosition] === ' ')) {
      event.preventDefault();
    }
  }
get totalRecords(): number {
  return this.products.length;
}
get recordsRange(): string {
  const startRecord = (this.currentPage - 1) * 9 + 1; 
  const endRecord = Math.min(startRecord + 9 - 1, this.totalRecords);
  return `Showing ${startRecord} to ${endRecord} of ${this.totalRecords} records`;
}
route: ActivatedRoute;
  constructor( private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef, route: ActivatedRoute, private router: Router) {
    this.route = route;
   }
  ngOnInit(): void {
    this.userID = this.sessionService.sessionStorageGetUserId();
    
    this.getAllCustomers();
    this.getAllColors();
    this.getAllRawMaterials();
    this.getAllProductQuestions();
    this.loadStackingHeight();

    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.filteredProduts = [...this.products];
    });

     this.route.queryParamMap.subscribe(params => { 
      const customerID = params.get('CustomerId'); // Correct way to get query param
      console.log('To get CustomerId:', customerID);
      if (customerID) {
     
       console.log('To get CustomerId:', customerID);
       this.GetAllCustomerProducts(customerID);
   
       
      }
    }); 


  
  
    this.route.queryParamMap.subscribe(params => { 
      const productID = params.get('productID'); // Correct way to get query param
      console.log('productID:', productID);
      if (productID) {
       // this.getUserDetailsByID(userId);
       console.log('productID:', productID);
        this.loadProductDetails(productID);

         // ✅ Immediately remove it from the URL after using
         this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { productID: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
       
      }
    });
 
    this.customerDropdownSettings = {
      idField: 'customerID',
      textField: 'customerName',
      allowSearchFilter: true,
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit:2,
      noDataAvailablePlaceholderText  : 'No Data Available',
      closeDropDownOnSelection: true,
      defaultOpen: false
    };
    this.colorsDropdownSettings = {
      idField: 'colorId',
      textField: 'colorName',
      allowSearchFilter: true,
      singleSelection: true,
      itemsShowLimit:2,
      noDataAvailablePlaceholderText  : 'No Data Available',
      closeDropDownOnSelection: true,
      defaultOpen: false
    };
    this.rawMaterialsDropdownSettings = {
      idField: 'rawMaterialID',
      textField: 'rawMaterialName',
      allowSearchFilter: true,
      singleSelection: true,
      itemsShowLimit:2,
      noDataAvailablePlaceholderText  : 'No Data Available',
      closeDropDownOnSelection: true,
      defaultOpen: false
    };
    this.productQuestionsDropdownSettings = {
      idField: 'productQuestionID',
      textField: 'productsQuestions',
      allowSearchFilter: true,
      singleSelection: true,
      itemsShowLimit:2,
      noDataAvailablePlaceholderText  : 'No Data Available',
      closeDropDownOnSelection: true,
      defaultOpen: false
    };
  }


  loadProductDetails(productID: string) {
    this.openProductDetailsModal();
    
    this.viewProductDetails(productID);
  
  
  }
  
  openProductDetailsModal() {
    const modalElement = document.getElementById('view-popup');
    if (modalElement) {
      console.log('Opening modal');
      const modal = new bootstrap.Offcanvas(modalElement);
      modal.show();
    }
  }
  
  ngOnDestroy() {
    const modalElement = document.getElementById('view-popup');
    if (modalElement) {
      const modal = bootstrap.Offcanvas.getInstance(modalElement);
      if (modal) modal.hide();
    }
  } 
  loadData() {
    this.resetData();
    this.GetAllCustomerProducts('00000000-0000-0000-0000-000000000000'); 
  }
  resetData(){
    this.isEditMode = false;
    this.selectedProduct = [];
    this.selectedColors = [];
    this.rawMaterialsValidationFlag = false;
    this.customersValidationFlag = false;
    this.productQuestionsValidationFlag = false;
    this.newProduct = {
      productID: '',
      productName: '',
      articleNumber: '',
      productLength: 0,
      clientArticle: '',
      rawMaterialID: '',
      width: 0,
      height: 0,
      thickness: '',
      piecesPerBox: 0,
      colorID: '',
      customerID: '',
      netBoxWeight: 0,
      boxDimensions: 0,
      nettWeight: '',
      description: '',
      isPotentialProduct: false,
      isDeleted: false,
      isEnabled: false,
      photo: null,
      stackingHeight:'',
      boxDimensionsHeight: 0,
      boxDimensionsWidth: 0,
      boxDimensionsLength: 0,
      numberOfCavitiesPerTray: 0,
      ProductQuestionID: '',
      density : 1.33,
    };  }
  

  //DropDown Configurations
  onQuestionsSelect(item: any) {
    if(this.selectedProuctQuestions.length > 0){
      this.productQuestionsValidationFlag = false;
    }
  }

  onQuestionsDeselect() {
    this.productQuestionsValidationFlag = true;
    this.selectedProuctQuestions = [];
  }



    onCustomerSelect(event: any) {
      if (event.customerID === 'ALL Customers') {
        if(this.selectedCustomers.length > 0){
          this.customersValidationFlag = false;
        }
        this.GetAllCustomerProducts('00000000-0000-0000-0000-000000000000'); // Fetch all products when "ALL" is selected
      } else {
        if(this.selectedCustomers.length > 0){
          this.customersValidationFlag = false;
        }
        this.GetAllCustomerProducts(event.customerID);
      }
    }

  onSelectAllCustomer(item: any) {
    if(this.onSelectAllCustomer.length > 0){
      this.customersValidationFlag = false;
    }
  }



    onCustomerDeselect(event: any) {
      if (event.customerID === 'ALL Customers') {
        this.selectedCustomers = [{ customerID: 'ALL Customers', customerName: 'ALL Customers' }]; // Keep "ALL" selected
        this.GetAllCustomerProducts('00000000-0000-0000-0000-000000000000'); // Fetch all products when "ALL" is selected
        this.customersValidationFlag = true;
       
      }
    }
  showDensity: boolean = false;  

  onRawMaterialSelect(item: any) {
    if (this.selectedRawMaterials.length > 0) {
      this.rawMaterialsValidationFlag = false;
    }
    this.checkForPET();  
  }
  onRawMaterialDeselect() {
    this.rawMaterialsValidationFlag = true;
    this.selectedRawMaterials = [];
    this.showDensity = false; 
  }
  checkForPET() {
    this.showDensity = this.selectedRawMaterials.some(material =>
      material.rawMaterialName.toLowerCase().includes("pet")
    );
    if (this.showDensity && this.newProduct.density == null) {
      this.newProduct.density = 1.33; // or any default you want
    }
  }
  onColorSelect(item: any) {
    if(this.selectedColors.length > 0){
      this.colorsValidationFlag = false;
    }
  }
 
  onColorDeselect() {
    this.colorsValidationFlag = true;
    this.selectedColors = [];
  }

  viewProductDetails(productID: string): void {
    if (productID) {
        this.productService.getProductDetails(productID).subscribe(
            (response) => {
                console.log('Product Details:', response);
                if (Array.isArray(response) && response.length > 0) {
                  this.selectedProductDetailss = response[0];
                }
               // this.selectedProduct = response;
                // Handle successful response
            },
            (error) => {
                console.error('Error fetching product details:', error);
            }
        );
    } else {
        console.error('ProductID is undefined');
    }
  }
 
/*   GetAllCustomerProducts(customerID: string) {
    this.ProductsService.GetAllCustomerProducts(customerID).subscribe({
      next: (response: any[]) => {

  
        this.products = response
        this.filteredProduts = [...this.products];
        },
        error: (error: { message: any; }) => {
          console.log(`Error: ${error.message || 'Something went wrong.'}`);
        }
        });
  } */
  GetAllCustomerProducts(customerID: string) {
    this.ProductsService.GetAllCustomerProducts(customerID).subscribe({
      next: (response: any[]) => {
        this.products = response.map(product => ({
          ...product,
          // Convert binary data to a base64 string if product.photo exists
          imageURL: product.photo ? this.sanitizeProfilePic(product.photo) : null
        }));

        this.filteredProduts = [...this.products];
           if (this.selectedCustomers.length > 0 && this.selectedCustomers[0].customerID !== 'ALL Customers') {
              this.selectedCustomers = this.allCustomerDetails.filter(customer => customer.customerName === this.selectedCustomers[0].customerName);
            }
      },
      error: (error: { message: any; }) => {
        console.log(`Error: ${error.message || 'Something went wrong.'}`);
      }
    });
 
  }

  // Convert binary data to base64 string
  sanitizeProfilePic(imageData: string): SafeUrl {
    // Assuming imageData is a base64-encoded string
    const imageUrl = 'data:image/jpeg;base64,' + imageData;
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  openAddProductOffCanvas() {
    this.isEditMode = false;
    const offcanvasElement = document.getElementById('addProduct');
    // this.additionalDetailsForAddProduct.customerID = '444B8C50-344C-4DF3-8F8A-D3B3B410F233';
    // this.additionalDetailsForAddProduct.customerName = 'Johnya';
    this.additionalDetailsForAddProduct.customerID = this.selectedCustomers[0].customerID;
    this.additionalDetailsForAddProduct.customerName = this.selectedCustomers[0].customerName;
    this.additionalDetailsForAddProduct.isPotentialProduct = true;
    if (offcanvasElement) {
      const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();
    } else {
      console.error('Add Product Offcanvas element not found!');
    }
  }

  filterProducts() {
    console.log('Search Query:', this.searchQuery); 
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredProduts = this.products.filter(product => {
        return (
          (product.productName?.toLowerCase().includes(query) ?? false) ||
          (product.articleNumber?.toLowerCase().includes(query) ?? false) ||
          (product.clientArticle?.toLowerCase().includes(query) ?? false) ||
          product.colorName.toLowerCase().includes(query) ||
          product.rawMaterialName.toLowerCase().includes(query)||
          product.customerName.toLowerCase().includes(query)
        );
      });
    } else {
      this.filteredProduts = [...this.products];
    }
  }
 
  isAllCustomerSelected(): boolean {
    return this.selectedCustomers?.some((customer: any) => customer.customerID === 'ALL Customers');
  }


 

  getAllCustomers() {
   // this.customerService.getAllCustomers().subscribe({
    this.customerRFQService.getAllCustomersForCustomerRFQ().subscribe({
      next: (response) => {
        this.allCustomerDetails = response;

        // Ensure "ALL" option is included in dropdown
        this.customerDropdownList = [{ customerID: 'ALL Customers', customerName: 'ALL Customers' }, ...this.allCustomerDetails];

        // Set default selection to "ALL"
        this.selectedCustomers = [{ customerID: 'ALL Customers', customerName: 'ALL Customers' }];

        // Fetch all products as default
        this.GetAllCustomerProducts('00000000-0000-0000-0000-000000000000');
      },
      error: (error) => {
        console.log(`Error: ${error.message || 'Something went wrong.'}`);
      }
    });
  }

  isFormDataModified(): boolean {
    if (this.selectedProduct) {
      const selectedProductData = JSON.parse(JSON.stringify(this.selectedProduct));
      console.log('New Product Data:', this.newProduct);
      
      console.log('Selected Product Data:', selectedProductData);
      
      const result =  (
        this.newProduct.productName !== selectedProductData.productName ||
        this.newProduct.articleNumber !== selectedProductData.articleNumber ||
        this.newProduct.clientArticle !== selectedProductData.clientArticle ||
        this.newProduct.productLength !== selectedProductData.productLength ||
        this.newProduct.width !== selectedProductData.width ||
        this.newProduct.height !== selectedProductData.height ||
        this.newProduct.thickness !== selectedProductData.thickness ||
        this.newProduct.nettWeight !== selectedProductData.nettWeight ||
        this.newProduct.description !== selectedProductData.description ||
        this.newProduct.stackingHeight !== selectedProductData.stackingHeight.toString() ||
        this.newProduct.numberOfCavitiesPerTray !== selectedProductData.numberOfCavitiesPerTray ||
        this.newProduct.density !== selectedProductData.density ||
        this.selectedColors[0]?.colorID !== selectedProductData.colorID ||
        this.selectedRawMaterials[0]?.rawMaterialID !== selectedProductData.rawMaterialID ||
        this.selectedProuctQuestions[0]?.productQuestionID !== selectedProductData.productQuestionID 
        || this.newProduct.photo !== selectedProductData.photo 
        || this.photo ? true : false
      );
      console.log('Form Data Modified:', result);
      
      return result;
    }
    return false;
  }


  getAllProductQuestions(){
    this.productService.getAllProductQuestions().subscribe({
      next: (response) => {
        this.allProductQuestions= response;
      },
      error: (error) => {
        console.log(`Error: ${error.message || 'Something went wrong.'}`);
      }
    });
  }
  getAllColors(){
    this.colorService.getAllColors().subscribe({
      next: (response) => {
        this.allColors= response;
      },
      error: (error) => {
        console.log(`Error: ${error.message || 'Something went wrong.'}`);
      }
    });
  }
  getAllRawMaterials(){
    this.rawMaterialsService.getAllRawMaterials().subscribe({
      next: (response) => {
        this.allRawMaterials= response;
      },
      error: (error) => {
        console.log(`Error: ${error.message || 'Something went wrong.'}`);
      }
    });
  }
  openOffcanvas(customerID: string, customerName: string, isPotentialProduct: boolean): void {
    console.log(`Opening offcanvas for Customer ID: ${customerID}, Customer Name: ${customerName}, isPotentialProduct: ${isPotentialProduct}`);
    this.addProductOffcanvasService.setCustomerParams(customerID, customerName, isPotentialProduct);
    this.addProductOffcanvasService.openOffcanvas();
    this.showDensity = false;
  }
  closeOffcanvas() {
    this.addProductOffcanvasService.closeOffcanvas();
  }
 
  toggleOffcanvas() {
    this.addProductOffcanvasService.toggleOffcanvas();
  }
  //OLD CODE
  // updateProduct(productData: Products) {
  //   if (this.selectedProduct&&this.selectedProduct.productID) {
  //     // Append the file to FormData
  //     const formData = new FormData();
  // if (this.photo) {
  //   formData.append('photoFile', this.photo, this.photo.name);
  // }
  //     this.productService.updateProduct(productData).subscribe({
  //       next: () => {
  //         this.toastr.success('Product updated successfully!', 'Success');
  //         //this.getAllProducts();
  //         this.GetAllCustomerProducts(this.selectedCustomers[0]?.customerID);
  //         this.resetForm();
  //         this.closeModal();
  //       },
  //       error: (error) => this.toastr.error('Failed to update product', 'Error')
  //     });
  //   }
  // }
  updateProduct(form: NgForm) {
    const formValues = form.value;
    let stackingHeightValue = this.newProduct.stackingHeight.toString().trim();

    
    const consecutiveDots = /\.\.+/; // Matches ".." or "...."
    const consecutiveCommas = /,,+/; // Matches ",," or ",,,"
    if (consecutiveDots.test(stackingHeightValue) || consecutiveCommas.test(stackingHeightValue)) {
      //console.error('Invalid max pallet height input:', this.form.get('transportInfo.maxPalletHeight')?.value);
      this.toastr.error(`Invalid . Please enter a valid value for StackingHeight.`, 'Error',{
        progressBar: true
      });
      //alert('Invalid stacking height. Please enter a valid number.');
      return;
    }


  // Check if the input contains only **one comma (`,`) before the last two digits**
  const isCommaAsDecimal = /^\d{1,}(,\d{2})$/.test(stackingHeightValue);

  if (isCommaAsDecimal) {
    // Convert single comma (e.g., "12346,78" → "12346.78")
    stackingHeightValue = stackingHeightValue.replace(',', '.');
  } else {
    // Otherwise, handle normal cases (remove thousands separator, fix decimal)
    const isEuropeanFormat = /^\d{1,3}(\.\d{3})*,\d{1,3}$/.test(stackingHeightValue);

    if (isEuropeanFormat) {
      // European format: Remove thousand separator (dots), replace decimal comma with dot
      stackingHeightValue = stackingHeightValue.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: Remove thousand separator (commas), keep decimal dot
      stackingHeightValue = stackingHeightValue.replace(/,/g, '');
    }
  }

  // Convert to float
  const parsedStackingHeight = parseFloat(stackingHeightValue);

  // Ensure it's a valid number before saving
  if (isNaN(parsedStackingHeight)) {
    console.error('Invalid stacking height input:', this.newProduct.stackingHeight);
    alert('Invalid stacking height. Please enter a valid number.');
    return;
  }
    
    
/*       // Custom logic for converting 1.2 → 12, but keeping 2,3 as 2.3
      let finalStackingHeight = parsedStackingHeight;
    
      if (stackingHeightValue.includes('.') || stackingHeightValue.includes(',')) {
        if (!isNaN(parseFloat(stackingHeightValue)) && stackingHeightValue.includes('.')) {
          stackingHeightValue = stackingHeightValue.replace('.', ''); // Remove dot
        }
      }
     */
      console.log('Final stackingHeight value:', parsedStackingHeight); // Debugging
    
      console.log('Form Values:', parsedStackingHeight);
    
    const productID = this.selectedProduct ? this.selectedProduct.productID : null;
    const productData = {
      ...formValues,
      UpdatedBy: this.userID,
      productID : productID,
      customerID: this.selectedCustomers.length > 0 ? this.selectedProduct.customerID : null,
      rawMaterialID: this.selectedRawMaterials.length > 0 ? this.selectedRawMaterials[0].rawMaterialID : null,
      stackingHeight:parsedStackingHeight,
      thickness: this.newProduct.thickness ? this.newProduct.thickness : 0,
      nettWeight: this.newProduct.nettWeight ? this.newProduct.nettWeight : 0,
      
        
    };
     // Extract IDs if available
    const colorID = this.selectedColors.length > 0 ? this.selectedColors[0].colorId : null;
    const productQuestionID = this.selectedProuctQuestions.length > 0 ? this.selectedProuctQuestions[0].productQuestionID : null;
    
    console.log('Product Data:', productData);
    console.log('CustomerId:', productData.customerID);

  
  
    const formData = new FormData();
  
    // Append object properties to FormData
    for (const key in productData) {
      if (productData.hasOwnProperty(key) && productData[key] !== null) {
        //formData.append(key, productData[key]);
        const value = productData[key];
      if (typeof value !== 'object') {
        formData.append(key, value.toString());
      }
      }
    }
    // Append extracted IDs separately
    if (colorID) {
      formData.append('colorID', colorID);
    }
    if (productQuestionID) {
      formData.append('productQuestionID', productQuestionID);
    }
    // Append the file to FormData if a new photo is provided
    if (this.photo) {
      formData.append('photoFile', this.photo, this.photo.name);
    }
  
    this.productService.updateProduct(formData).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.toastr.error(response.message || 'Update failed', 'Error', {
            progressBar: true
          });
          return;
        }
        this.toastr.success(response.message || 'Product updated successfully!', 'Success', {
          progressBar: true,
          timeOut: 1500,
          closeButton: true
        });
        //this.resetForm();
        form.reset();
        this.closeModal();
        // setTimeout(() => {
        // this.resetForm();
        // this.closeModal();
        // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        //   this.router.navigate(['/home/products']);
        //  });
        // }, 1600);

        if (this.previousSelectedCustomer?.customerID === 'ALL Customers') {
          console.log('Previous customer was "ALL"', this.previousSelectedCustomer);
          this.getAllCustomers();
        } else {
          this.selectedCustomers = this.customerDropdownList.filter(customer => customer.customerID === productData.customerID);
          this.GetAllCustomerProducts(productData.customerID);
        }
        // this.selectedCustomers=productData.customerID
        /*  console.log('CustomerId:', this.selectedCustomers[0]?.customerName);
        if (this.selectedCustomers[0]?.customerName ==('ALL Customers'))
        {
          this.GetAllCustomerProducts(productData.customerID);
          console.log('Hi', this.selectedProduct.customerID);
        }
        else{
          this.GetAllCustomerProducts(this.selectedCustomers[0]?.customerID);
        } */
         },
      error: (error) => {
        this.toastr.error('Failed to update product', 'Error');
        console.error('Error:', error);
      }
    });
  }

 

loadStackingHeight() {
  // Fetch stackingHeight from DB
 // this.newProduct.stackingHeight = this.getStackingHeightFromDB(); 
  console.log('Stacking Height:', this.newProduct.stackingHeight);
  // Convert based on system locale settings
  this.newProduct.stackingHeight = this.formatBasedOnLocale(this.newProduct.stackingHeight);
  this.newProduct.thickness = this.formatBasedOnLocale(this.newProduct.thickness);
  this.newProduct.nettWeight = this.formatBasedOnLocale(this.newProduct.nettWeight);


  console.log('Stacking :', this.newProduct.stackingHeight);
}

formatBasedOnLocale(value: any) {
 // const locale = navigator.language || 'en-US';
 const locale = 'en-US';
  const region=new Intl.NumberFormat(locale).format(value);
  return region;
}
  
  validateProductForm(form: any) {
    const productData = form.value;
    if (form.valid) {
      const productData = this.prepareProductData();
      //this.addProduct(form);
      //this.addProduct(productData);
      if (this.newProduct && this.newProduct.productID) {
        this.updateProduct(form);      
      }else{
        this.addProduct(form);
      }    
    } else {
      form.markAllAsTouched();
    }
  }



  //Extracting the dropdown values to send to requestbody
  prepareProductData() {
    const customerID = this.selectedCustomers.length > 0 ? this.selectedCustomers[0].customerID : null;
    const rawMaterialID = this.selectedRawMaterials.length > 0 ? this.selectedRawMaterials[0].rawMaterialID : null;
    const colorId = this.selectedColors.length > 0 ? this.selectedColors[0].colorId: null;
    const productQuestionID = this.selectedProuctQuestions.length > 0 ? this.selectedProuctQuestions[0].productQuestionID: null;
    return {
      ...this.newProduct,
      customerID: customerID,
      rawMaterialID : rawMaterialID,
      colorId : colorId,
      productQuestionID : productQuestionID
    };
  }
  //addProduct(productData: any) {
    addProduct(form:NgForm) {
      const formValues = form.value;
      const productData = {
        ...formValues,
        CreatedBy : this.userID,
        customerID: this.selectedCustomers[0].customerID,
        rawMaterialID: this.selectedRawMaterials.length > 0 ? this.selectedRawMaterials[0].rawMaterialID : null,
        colorId: this.selectedColors.length > 0 ? this.selectedColors[0].colorId : null,
        productQuestionID: this.selectedProuctQuestions.length > 0 ? this.selectedProuctQuestions[0].productQuestionID : null,
        
        // isEnabled: booleanToInt(this.newProduct.isEnabled), 
        // isDeleted: booleanToInt(this.newProduct.isDeleted), 
        //isPotentialProduct: booleanToInt(this.newProduct.isPotentialProduct),   
       // photoID : this.photoID 
      // photoID: this.photoID
      }
      console.log('Product Data:', productData);
       // Remove the array ProductQuestionID if it exists.
      if ('ProductQuestionID' in productData) {
        delete productData['ProductQuestionID'];
      }
      const formData = new FormData();

  // Append object properties to FormData
  for (const key in productData) {
    if (productData.hasOwnProperty(key) && productData[key] !== null) {
      formData.append(key, productData[key]);
    }
  }

  // Append the file to FormData
  if (this.photo) {
    formData.append('photoFile', this.photo, this.photo.name);
  }
      this.productService.addProduct(formData).subscribe({
      next: (response) => {
        console.log('Product Data:', productData);
        this.toastr.success('Product added successfully!','Success',{
          progressBar: true,
          timeOut:1500,
          closeButton:true
        });
        this.resetForm();
        this.closeModal();
        this.GetAllCustomerProducts(this.selectedCustomers[0]?.customerID);
        
      },    
      error: (error) => {
        this.toastr.error('Failed to add product','Error');
        console.error('Error:', error);
      }
    });
  }
  onCancel(form: NgForm) {
    form.reset();
    this.selectedProduct = null;
    const offcanvasElement = document.getElementById('editProduct');
    if (offcanvasElement) {
      const offcanvasInstance = (window as any).bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      } else {
        const newOffcanvasInstance = new (window as any).bootstrap.Offcanvas(offcanvasElement);
        newOffcanvasInstance.hide();
      }
    }
  }
  closeModal() {
    const modalElement = document.getElementById('editProduct');
    if (modalElement) {
      const offcanvasInstance = (window as any).bootstrap.Offcanvas.getInstance(modalElement);
      offcanvasInstance?.hide();
      offcanvasInstance.dispose();
     
    }
  }
  
  resetForm() {
   // this.selectedProduct = null;
    this.selectedProduct = null;
    this.selectedCustomers = [];
    this.selectedRawMaterials = [];
    this.selectedColors = [];
    this.selectedProuctQuestions = [];
    this.showDensity = false;
  }
  restrictToPiecesPerBox(event: KeyboardEvent) {
    const charCode = event.charCode ? event.charCode : event.keyCode;
    const inputElement = event.target as HTMLInputElement;
    if ((charCode < 48 || charCode > 57) && charCode !== 46) {
      event.preventDefault();
    } else if (charCode === 46 && inputElement.value.includes('.')) {
      event.preventDefault();
    }
   
  }
  restrictToDensity(event: KeyboardEvent) {
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
  restrictToNumbers(event: KeyboardEvent) {
    const charCode = event.charCode ? event.charCode : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Prevent non-numeric characters
    }
  }
  // restrictToStackingHeight(event: KeyboardEvent) {
  //   const charCode = event.charCode ? event.charCode : event.keyCode;
  //   if ((charCode < 48 || charCode > 57) && charCode !== 44) {
  //     event.preventDefault(); // Prevent non-numeric and non-comma characters
  //   }
  // }
  restrictToStackingHeight(event: KeyboardEvent) {
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
  //Biding the data for edit products
  editProduct(product: ProductDetail) {
    this.photo = null;
    this.previousSelectedCustomer = this.selectedCustomers.length > 0 ? this.selectedCustomers[0] : null;
    console.log('previous', this.previousSelectedCustomer);
    console.log('Product:', product);
    console.log('Edit product triggered:', product);
    this.selectedProduct = product;
    this.isEditMode = true;
    this.selectedProduct = product.productID;
    this.selectedProduct = product.boxDimensionsHeight;
    this.selectedProduct = product.numberOfCavitiesPerTray;
    this.selectedProduct = product.customerName;
    this.selectedProduct = product.customerID;
    
    this.imagePreview = product.photo ? this.sanitizeProfilePic(product.photo) : null;
   
    //this.selectedProduct = product.customerID;
    this.selectedProduct = { ...product };
    this.newProduct = { ...product };  
    this.newProduct.ProductQuestionID = this.selectedProduct.productQuestionID;
    this.newProduct.colorID = this.selectedProduct.colorID;
    this.selectedRawMaterials = this.allRawMaterials.filter(rawmaterials => rawmaterials.rawMaterialID === product.rawMaterialID);
    this.checkForPET();
    //this.selectedCustomers = this.allCustomerDetails.filter(customer => customer.customerID === product.customerID);
    this.selectedColors = [{ colorID : this.selectedProduct.colorID, colorName : this.selectedProduct.colorName }];
    this.selectedProuctQuestions = [{ productQuestionID : this.selectedProduct.productQuestionID, productsQuestions: this.selectedProduct.productsQuestions }];
    product.updatedBy = this.userID;
  
    this.cdr.detectChanges();

    this.loadStackingHeight();
  }
  // Delete method
      selectProductForDeletion(product : Products ): void {
        this.selectedProduct = product.productID;
        this.checkIfQuoteAssociated(product.productID);
      }
      confirmDelete(): void {
        if (this.selectedProduct) {
          const requestBody = {
            productID: this.selectedProduct,
            updatedBy: this.userID
          };
          this.productService.deleteProduct(requestBody).subscribe(
            () => {
              this.toastr.success('Product Deleted Successfully','Success',{
                progressBar: true,
                timeOut:1500,
                closeButton:true
              });

              this.products = this.products.filter(product => product.productID !== this.selectedProduct);
              this.filteredProduts = this.filteredProduts.filter(product => product.productID !== this.selectedProduct);

              // Check if current page is empty and adjust currentPage accordingly
              const currentPageProducts = this.filteredProduts.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
              if (currentPageProducts.length === 0 && this.currentPage > 1) {
              this.currentPage--;
            }



             // this.selectedProduct = null;
              //const deletePopup = document.getElementById('delete-popup');
              const modal = bootstrap.Modal.getInstance(document.getElementById('delete-popup'));
              modal.hide();
              this.selectedProduct = null;
              this.getAllCustomers();
             
             /*  if (deletePopup) {
                const modalInstance = (window as any).bootstrap.Modal.getInstance(deletePopup);
                if (modalInstance) {
  
                 modalInstance.hide();
                
                } */
               
              
       
            },
            (error) => {
              console.error('Error:', error);
              this.toastr.error('An error occurred while deleting the Product','Error');
            }
          );
        } else {
          console.error('No Product ID is set for deletion');
        }
      }
      cancelDeletion(){
        this.selectedProduct = ''; 
      }

    checkIfQuoteAssociated(productID: any): void {
      this.productService.checkIfQuoteAssociatedWithProduct(productID).subscribe({
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
  
  //Product Status
  openProductStatusUpdateConfirmationModal(product: any,  event: Event): void {
    event.preventDefault();
    this.checkIfQuoteAssociated(product.productID);
    console.log('Modal function triggered for product:', product);
    this.selectedProduct = product;
    this.originalProductStatus = product.isEnabled; 
    this.isCancelClicked = false;
    const modal = new bootstrap.Modal(document.getElementById('update-status-popup'));
    modal.show();
  }
  confirmUpdateStatus(): void {
    if (this.selectedProduct) {
      const updatedStatus = !this.originalProductStatus; 
      const requestBody = {
        ProductID: this.selectedProduct.productID,
        IsEnabled: updatedStatus,
        UpdatedBy:this.userID,
      };
      this.productService.updateProductStatus(requestBody).subscribe({
        next: (response) => {
          console.log('Product status updated successfully:', response);
          this.selectedProduct.isEnabled = updatedStatus; 
          this.selectedProduct = null;
          this.toastr.success('Product Status Updated Successfully','Success',{
            progressBar: true,
            timeOut:1500,
            closeButton:true
          });
          this.resetProductUpdateStausModalState();
        },
        // error: (error) => {
        //   console.error('Error updating Customer status:', error);
        //   this.toastr.error('Failed to Update the Product Status','Error');
        // }
        error: (error: HttpErrorResponse) => {
          if (error.status === 200) {
            this.toastr.success('Product Status Updated Successfully', 'Success',{
              progressBar: true,
              timeOut:1500,
              closeButton:true
            });
            this.selectedProduct.isEnabled = updatedStatus;
            this.selectedProduct = null;
            this.resetProductUpdateStausModalState();
          } else {
            console.error('Error updating Product status:', error);
            this.toastr.error('Failed to update Product status');
          }
        },
      });
    }
  }
  cancelUpdate(): void {
    this.isCancelClicked = true; 
    if (this.selectedProduct) {
      this.selectedProduct.isEnabled = this.originalProductStatus;
    }
    this.resetProductUpdateStausModalState();
  }
 
  resetProductUpdateStausModalState(): void {
    this.selectedProduct = null;
    this.originalProductStatus = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById('update-status-popup'));
      modal.hide(); 
  }
  //Calculations Part
  calculateNetBoxWeight() {
    const piecesPerBox = this.newProduct.piecesPerBox ?? 0; 
    //const nettWeight = this.newProduct.nettWeight ?? 0; 
    const nettWeight = this.parseLocalizedNumber(this.newProduct.nettWeight?.toString() ?? '') ?? 0;
    console.log("piecesPerBox:", piecesPerBox);
    console.log("nettWeight:", nettWeight);
  
    this.newProduct.netBoxWeight = (piecesPerBox * nettWeight);
  
    console.log("Calculated netBoxWeight:", this.newProduct.netBoxWeight);
  }



   onPiecesPerBoxChange() {
    this.calculateNetBoxWeight();
  }

  onNettWeightChange() {
    this.calculateNetBoxWeight();
    this.CalculateThickness();
  }

  CalculateThickness(){
    const productLength = (this.newProduct.productLength ?? 0);
    const width = (this.newProduct.width ?? 0);
    const density = this.newProduct.density ?? 0;
    const weight = this.parseLocalizedNumber(this.newProduct.nettWeight?.toString() ?? '') ?? 0;
    console.log("Length:", productLength);
    console.log("Widhth:", width);
    // Thickness (µm)=Weight (g) / (Length (cm)×Width (cm)×Density (g/cm3))×1000000
   // this.newProduct.thickness = ((productLength * width * density * weight ) * 0.1 );
   //this.newProduct.thickness =(weight * 1000000) / (productLength * width * density);
   if(productLength && width && density && weight){ 
    this.newProduct.thickness =(weight * 1000000) / (productLength * width * density);
    }
    console.log("Calculated thickness:", this.newProduct.thickness);
  }
 
  
  onProductLength(){
    this.CalculateThickness();
    this.CalculateNettWeight();
  }
  onWidth(){
    this.CalculateThickness();
    this.CalculateNettWeight();
  }
  onDensity(){
    this.CalculateThickness();
    this.CalculateNettWeight();
  }
  onWeight(){
    this.CalculateThickness();
  }
  onThickness(){
    this.CalculateNettWeight();
  }
  CalculateNettWeight() {
    const productLength = (this.newProduct.productLength ?? 0);
    const width = (this.newProduct.width ?? 0);
    const density = this.newProduct.density ?? 0;
    const thickness = this.parseLocalizedNumber(this.newProduct.thickness?.toString() ?? '') ?? 0;
   
   //Weight (g)=Length (mm)×Width (mm )×Thickness (µm)/ 10,00.000 x Density (g/cm3)
   // this.newProduct.nettWeight = productLength * width  * density * thickness/ 1000000;
   if(productLength && width && density && thickness){ 
    //Weight (g)=Length (mm)×Width (mm )×Thickness (µm)/ 10,00.000 x Density (g/cm3)
     this.newProduct.nettWeight = productLength * width  * density * thickness/ 1000000;
     }
  }


  parseLocalizedNumber(value: string): number | null {
    if (value === null || value === undefined || value === '0' || value.trim() === '') {
      return 0;
    }
  
    if (typeof value !== 'string') {
      value = String(value);
    }
  
    let formattedValue = value.trim();
  
    const hasDot = formattedValue.includes('.');
    const hasComma = formattedValue.includes(',');
  
    const consecutiveDots = /\.\.+/;
    const consecutiveCommas = /,,+/;
    if (consecutiveDots.test(formattedValue) || consecutiveCommas.test(formattedValue)) {
      return null;
    }
  
    // Case 1: European format e.g., "23.456,7"
    const isEuropeanFormat = hasDot && hasComma && /\d{1,3}(\.\d{3})+,\d+$/.test(formattedValue);
    if (isEuropeanFormat) {
      formattedValue = formattedValue.replace(/\./g, '').replace(',', '.');
    }
    // Case 2: Only comma → assume comma is decimal separator
    else if (!hasDot && hasComma) {
      formattedValue = formattedValue.replace(',', '.');
    }
    // Case 3: Only dot or comma as thousand separator (US/IN)
    else {
      // Remove commas (used as thousand separators)
      formattedValue = formattedValue.replace(/,/g, '');
    }
  
    const result = parseFloat(formattedValue);
    return isNaN(result) ? null : result;
  }

}
 
 