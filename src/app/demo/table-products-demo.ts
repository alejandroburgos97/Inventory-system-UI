import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Product } from '../../domain/product';
import { ProductService } from '../services/productservice';
import { UserService } from '../services/user.service';

@Component({
    selector: 'table-products-demo',
    templateUrl: 'table-products-demo.html',
    styleUrls: ['table-products-demo.scss'],
    providers: [MessageService, ConfirmationService]
})
export class TableProductsDemo implements OnInit{
    filterByDate: Date;
    filterByUser: string;
    filterByName: string;
    filterError: boolean = false;
    productDialog: boolean = false;
    productAddNew: boolean = false;
    products!: Product[];
    product!: Product;
    selectedProducts!: Product[] | null;
    submitted: boolean = false;
    users: SelectItem[] = [];
    selectedUser: string;
    userMap: { [key: number]: string } = {};    

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.productService.getProducts().subscribe(data => {
            this.products = data;
        })
        this.userService.getUsers().subscribe(data => {
            this.users = data.map(user => ({ label: user.name, value: user.id }));
            data.forEach(user => {
                this.userMap[user.id] = user.name;
            });

            if (this.users.length > 0) {
                this.selectedUser = this.users[0].value;
            }
        });
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.productDialog = true;
        this.productAddNew = true;
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products = this.products.filter((val) => !this.selectedProducts?.includes(val));
                this.selectedProducts = null;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
            }
        });
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
        this.productAddNew = false;
    }
    
    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + product.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productService.deleteProduct(product.id, this.selectedUser).subscribe({
                    next: () => {
                        this.products = this.products.filter((val) => val.id !== product.id);
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
                    },
                    error: (error: any) => {
                        console.error('Error deleting product:', error);
                    }
                });
            }
        });
    }
     
    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;
    
        this.product.registeredUserId = this.productAddNew ? +this.selectedUser : this.product.registeredUserId;
        this.product.modifiedUserId = +this.selectedUser;
    
        if (this.product.name?.trim()) {
            if (this.product.id) {
                this.updateProduct();
            } else {
                this.createProduct();
            }
    
            this.productDialog = false;
            this.product = {};
        }
    }
    
    updateProduct() {
        this.productService.updateProduct(this.product).subscribe(
            updatedProduct => {
                this.products[this.findIndexById(updatedProduct.id)] = updatedProduct;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
            },
            error => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product.', life: 3000 });
            }
        );
    }
    
    createProduct() {
        this.productService.addProduct(this.product).subscribe(
            newProduct => {
                this.products.push(newProduct);
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
            },
            error => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product.', life: 3000 });
            }
        );
    }

    applyFilters() {
        if (!this.filterByName && !this.filterByUser && !this.filterByDate) {
            this.filterError = true;
            return;
        }
        this.filterError = false;
    
        this.productService.getProductsFiltered(
            this.filterByName,
            this.userMap[this.filterByUser],
            this.filterByDate
        ).subscribe(products => {
            this.products = products;
        });
    }

    findIndexById(id: number): number {
        return this.products.findIndex(product => product.id === id);
    }
}