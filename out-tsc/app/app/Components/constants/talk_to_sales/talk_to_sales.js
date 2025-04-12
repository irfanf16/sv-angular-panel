export class TalkToSalesConfig {
    static { this.BREAD_CRUMBS = [{ label: 'Talk to Sales', url: '' }]; }
    static { this.COMP_NAME = 'Talk to Sales'; }
    static { this.CATEGORY_EDIT = 'Product successfully edited'; }
    static { this.TALK_TO_SALES_HEADER = {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
    }; }
    static { this.CATEGORY_HEADER_POST_M = { ...TalkToSalesConfig.TALK_TO_SALES_HEADER, "Access-Control-Allow-Methods": "POST" }; }
}
//# sourceMappingURL=talk_to_sales.js.map