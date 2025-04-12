export class CategoriesConfig {
    static { this.BREAD_CRUMBS = [{ label: 'Plan & Packages', url: '' }, { label: 'Products', url: '/categories' }]; }
    static { this.COMP_NAME = 'Products'; }
    static { this.CATEGORY_EDIT = 'Product successfully edited'; }
    static { this.CATEGORY_HEADER = {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
    }; }
    static { this.CATEGORY_HEADER_POST_M = { ...CategoriesConfig.CATEGORY_HEADER, "Access-Control-Allow-Methods": "POST" }; }
    static { this.CATEGORY_DATE_FORMAT = 'dd-MM-yyyy'; }
    static { this.CATEGORY_TYPE = "one_time"; }
}
//# sourceMappingURL=categories.js.map