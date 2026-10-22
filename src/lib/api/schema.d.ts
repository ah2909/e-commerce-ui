export interface paths {
    "/api/v1/admin/catalog/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listCatalogCategories"];
        put?: never;
        post: operations["createCatalogCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/categories/{category_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["replaceCatalogCategory"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/categories/{category_id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["archiveCatalogCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listCatalogProducts"];
        put?: never;
        post: operations["createCatalogProduct"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/products/{product_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCatalogProduct"];
        put: operations["replaceCatalogProduct"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/products/{product_id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["archiveCatalogProduct"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/catalog/products/{product_id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["publishCatalogProduct"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/inventory/stock-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listInventoryStockItems"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/inventory/stock-items/{variant_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getInventoryStockItem"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/inventory/stock-items/{variant_id}/adjustments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["adjustInventoryStock"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listFulfillmentOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/orders/{order_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getFulfillmentOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/orders/{order_id}/cancellations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelOrderAsWorkforce"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/orders/{order_id}/shipments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createShipment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/payment-providers/momo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getMoMoConfig"];
        put: operations["replaceMoMoConfig"];
        post?: never;
        delete?: never;
        options?: never;
        head: operations["headMoMoConfig"];
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/payment-providers/vietqr": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getVietQRConfig"];
        put: operations["replaceVietQRConfig"];
        post?: never;
        delete?: never;
        options?: never;
        head: operations["headVietQRConfig"];
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/payment-reconciliation-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listPaymentReconciliationItems"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/payments/{payment_id}/vietqr-confirmations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["confirmVietQRPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/pricing/price-lists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listPriceLists"];
        put?: never;
        post: operations["createPriceList"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/pricing/price-lists/{price_list_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getPriceList"];
        put: operations["replacePriceList"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/pricing/price-lists/{price_list_id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["archivePriceList"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/refunds/{refund_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRefund"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/refunds/{refund_id}/momo-executions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["executeMoMoRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/refunds/{refund_id}/vietqr-settlements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["settleVietQRRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/shipments/{shipment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateShipment"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/shipments/{shipment_id}/completions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["completeShipment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/shipments/{shipment_id}/dispatches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["dispatchShipment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/shipping/rule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getShippingRule"];
        put: operations["replaceShippingRule"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["currentUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["logoutUserSession"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refreshUserSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/social/continue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["continueSocialLogin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/social/exchanges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["exchangeSocialCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/social/{provider}/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["socialCallback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/social/{provider}/links": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startSocialLink"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/social/{provider}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startSocialLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCart"];
        put?: never;
        post: operations["createOrGetCart"];
        delete: operations["abandonCart"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cart/lines/{variant_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["setCartLine"];
        post?: never;
        delete: operations["removeCartLine"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listStorefrontProducts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/products/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getStorefrontProduct"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkoutCart"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customer/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listCustomerAddresses"];
        put?: never;
        post: operations["createCustomerAddress"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customer/addresses/{address_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCustomerAddress"];
        put: operations["replaceCustomerAddress"];
        post?: never;
        delete: operations["archiveCustomerAddress"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customer/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCustomerProfile"];
        put: operations["putCustomerProfile"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guest-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createGuestSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guest-sessions/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["currentGuestSession"];
        put?: never;
        post?: never;
        delete: operations["logoutGuestSession"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guest-sessions/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refreshGuestSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listMemberships"];
        put?: never;
        post: operations["addMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/memberships/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateMembership"];
        trace?: never;
    };
    "/api/v1/memberships/{user_id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["replaceMembershipPaymentPermissions"];
        trace?: never;
    };
    "/api/v1/onboarding/stores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["onboardStore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{order_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{order_id}/cancellations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelOwnedOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{order_id}/payments/momo/attempts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startMoMoPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{order_id}/payments/vietqr/instructions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createVietQRInstruction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payment-webhooks/momo/{callback_token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["receiveMoMoIPN"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/store": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getStore"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["liveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["readiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/storefront": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getPublicStorefront"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/storefront": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getStorefrontAppearance"];
        put: operations["replaceStorefrontAppearance"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AddMembership: {
            role: components["schemas"]["Role"];
            /** Format: uuid */
            user_id: string;
        };
        CancellationRequest: {
            reason: string;
        };
        CancellationResult: {
            created: boolean;
            /** Format: uuid */
            order_id: string;
            /** Format: uuid */
            refund_id?: string;
            /** @enum {string} */
            state: "refund_pending" | "cancelled";
        };
        Cart: {
            /** Format: uuid */
            cart_id: string;
            checkout_ready: boolean;
            /** Format: date-time */
            created_at: string;
            /** @constant */
            currency: "VND";
            estimated_subtotal: components["schemas"]["PricingMoney"] | null;
            /** Format: date-time */
            expires_at: string;
            lines: components["schemas"]["CartLine"][];
            /** @enum {string} */
            status: "active" | "converted" | "expired" | "abandoned";
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        CartLine: {
            in_stock: boolean;
            line_estimate?: components["schemas"]["PricingMoney"];
            option_values?: {
                [key: string]: string;
            };
            product_name?: string;
            quantity: number;
            sellable: boolean;
            sku?: string;
            unit_price?: components["schemas"]["PricingMoney"];
            /** Format: uuid */
            variant_id: string;
        };
        CartLineWrite: {
            expected_version: number;
            quantity: number;
        };
        CatalogCategory: {
            /** Format: date-time */
            archived_at: string | null;
            /** Format: uuid */
            category_id: string;
            /** Format: date-time */
            created_at: string;
            name: string;
            /** Format: uuid */
            parent_id: string | null;
            slug: string;
            /** @enum {string} */
            status: "active" | "archived";
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        CatalogCategoryWrite: {
            expected_version?: number;
            name: string;
            /** Format: uuid */
            parent_id?: string | null;
            slug: string;
        };
        CatalogDimensions: {
            height_mm?: number | null;
            length_mm?: number | null;
            width_mm?: number | null;
        };
        CatalogMedia: {
            alt_text: string;
            /** Format: date-time */
            archived_at: string | null;
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            media_id: string;
            object_key: string;
            position: number;
            /** Format: uuid */
            product_id: string;
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
        };
        CatalogMediaWrite: {
            alt_text: string;
            /** Format: uuid */
            media_id?: string;
            object_key: string;
            position: number;
        };
        CatalogProduct: {
            /** Format: date-time */
            archived_at: string | null;
            category_ids: string[];
            /** Format: date-time */
            created_at: string;
            description: string;
            media: components["schemas"]["CatalogMedia"][];
            name: string;
            /** Format: uuid */
            product_id: string;
            /** Format: date-time */
            published_at: string | null;
            slug: string;
            /** @enum {string} */
            status: "draft" | "published" | "archived";
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            variants: components["schemas"]["CatalogVariant"][];
            version: number;
        };
        CatalogProductWrite: {
            category_ids: string[];
            description: string;
            expected_version?: number;
            media: components["schemas"]["CatalogMediaWrite"][];
            name: string;
            slug: string;
            variants: components["schemas"]["CatalogVariantWrite"][];
        };
        CatalogVariant: {
            /** Format: date-time */
            archived_at: string | null;
            barcode: string | null;
            /** Format: date-time */
            created_at: string;
            dimensions: components["schemas"]["CatalogDimensions"];
            option_values: {
                [key: string]: string;
            };
            /** Format: uuid */
            product_id: string;
            sku: string;
            /** @enum {string} */
            status: "active" | "archived";
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: uuid */
            variant_id: string;
            version: number;
            weight_grams: number;
        };
        CatalogVariantWrite: {
            barcode?: string | null;
            dimensions: components["schemas"]["CatalogDimensions"];
            option_values: {
                [key: string]: string;
            };
            sku: string;
            /** Format: uuid */
            variant_id?: string;
            weight_grams: number;
        };
        CheckoutResult: {
            order: components["schemas"]["Order"];
            order_access_token?: string;
        };
        CheckoutWrite: {
            /** Format: uuid */
            address_id?: string;
            cart_version: number;
            contact?: components["schemas"]["OrderContact"];
            delivery_address?: components["schemas"]["OrderAddress"];
            /** @enum {string} */
            payment_provider: "vietqr" | "momo";
        };
        CurrentGuestSession: {
            /** Format: date-time */
            access_expires_at: string;
            /** Format: uuid */
            guest_id: string;
            /** Format: date-time */
            session_expires_at: string;
            /** Format: uuid */
            session_id: string;
            /** Format: uuid */
            store_id: string;
        };
        CustomerAddress: {
            /** Format: uuid */
            address_id: string;
            /** @constant */
            country_code: "VN";
            /** Format: date-time */
            created_at: string;
            /** @description Optional legacy district; empty for current two-level Vietnamese addresses. */
            district: string;
            label: string;
            line1: string;
            line2: string;
            phone: string;
            postal_code: string;
            province: string;
            recipient_name: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
            ward: string;
        };
        CustomerAddressWrite: {
            /** @constant */
            country_code: "VN";
            /** @description Optional legacy district; empty for current two-level Vietnamese addresses. */
            district: string;
            label: string;
            line1: string;
            line2?: string;
            phone: string;
            postal_code?: string;
            province: string;
            recipient_name: string;
            ward: string;
        };
        CustomerProfile: {
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            customer_id: string;
            /** Format: email */
            email: string;
            full_name: string;
            phone: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        CustomerProfileWrite: {
            /** Format: email */
            email: string;
            expected_version: number;
            full_name: string;
            phone: string;
        };
        InventoryAdjustment: {
            expected_version: number;
            quantity_delta: number;
            reason: string;
        };
        InventoryStockItem: {
            available: number;
            /** Format: date-time */
            created_at?: string;
            on_hand: number;
            reserved: number;
            /** Format: date-time */
            updated_at?: string;
            /** Format: uuid */
            variant_id: string;
            version: number;
        };
        Membership: {
            /** Format: date-time */
            created_at: string;
            role: components["schemas"]["Role"];
            status: components["schemas"]["MembershipStatus"];
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: uuid */
            user_id: string;
        };
        MembershipPaymentPermissions: {
            permissions: components["schemas"]["PaymentPermission"][];
            /** Format: uuid */
            user_id: string;
            version: number;
        };
        MembershipPaymentPermissionsWrite: {
            expected_membership_version: number;
            permissions: components["schemas"]["PaymentPermission"][];
        };
        /** @enum {string} */
        MembershipStatus: "active" | "inactive";
        MoMoAttempt: {
            /** Format: uuid */
            attempt_id: string;
            created: boolean;
            deeplink?: string;
            /** Format: date-time */
            expires_at: string;
            /** Format: uuid */
            order_id: string;
            /** Format: uri */
            pay_url?: string;
            /** Format: uuid */
            payment_id: string;
            qr_code_url?: string;
            /** @enum {string} */
            state: "creating" | "retryable" | "action_required" | "failed" | "succeeded" | "reconciliation_required";
        };
        MoMoConfig: {
            /** Format: date-time */
            created_at: string;
            enabled: boolean;
            masked_partner_code: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        MoMoConfigWrite: {
            access_key: string;
            enabled: boolean;
            expected_version: number;
            partner_code: string;
            secret_key: string;
        };
        OnboardStore: {
            /** @default VND */
            default_currency: string;
            /** Format: email */
            email: string;
            /** @default vi-VN */
            locale: string;
            password: string;
            store_name: string;
            subdomain: components["schemas"]["Subdomain"];
            /** @default Asia/Ho_Chi_Minh */
            timezone: string;
        };
        Order: {
            /** Format: uuid */
            cart_id: string;
            /** Format: date-time */
            closed_at: string | null;
            contact: components["schemas"]["OrderContact"];
            /** Format: date-time */
            created_at: string;
            /** @constant */
            currency: "VND";
            delivery_address: components["schemas"]["OrderAddress"];
            grand_total: components["schemas"]["OrderMoney"];
            lines: components["schemas"]["OrderLine"][];
            /** Format: uuid */
            order_id: string;
            order_number: string;
            payment: components["schemas"]["OrderPayment"];
            /** Format: date-time */
            reservation_expires_at: string;
            shipment: components["schemas"]["Shipment"] | null;
            shipping: components["schemas"]["OrderShipping"];
            shipping_total: components["schemas"]["OrderMoney"];
            /** @enum {string} */
            state: "pending_payment" | "paid" | "processing" | "shipped" | "completed" | "expired" | "cancellation_requested" | "refund_pending" | "cancelled";
            subtotal: components["schemas"]["OrderMoney"];
            /** @constant */
            tax_presentation: "vat_inclusive";
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        OrderAddress: {
            /** @constant */
            country_code: "VN";
            /** @description Optional legacy district; empty for current two-level Vietnamese addresses. */
            district: string;
            line1: string;
            line2: string;
            phone: string;
            postal_code: string;
            province: string;
            recipient_name: string;
            ward: string;
        };
        OrderContact: {
            /** Format: email */
            email: string;
            name: string;
            phone: string;
        };
        OrderLine: {
            /** Format: uuid */
            line_id: string;
            line_total: components["schemas"]["OrderMoney"];
            option_values: {
                [key: string]: string;
            };
            product_name: string;
            quantity: number;
            sku: string;
            /** @constant */
            tax_presentation: "vat_inclusive";
            unit_price: components["schemas"]["OrderMoney"];
            /** Format: uuid */
            variant_id: string;
        };
        OrderMoney: {
            amount_minor: number;
            /** @constant */
            currency: "VND";
        };
        OrderPayment: {
            amount: components["schemas"]["OrderMoney"];
            /** Format: uuid */
            payment_id: string;
            /** @enum {string} */
            provider: "vietqr" | "momo";
            /** @enum {string} */
            state: "pending" | "succeeded" | "failed" | "expired" | "reconciliation_required" | "refund_pending" | "refunded";
            version: number;
        };
        OrderShipping: {
            /** @enum {string} */
            mode: "free" | "flat";
            price: components["schemas"]["OrderMoney"];
            /** Format: uuid */
            rule_id: string;
            rule_version: number;
        };
        PasswordLogin: {
            /** Format: email */
            email: string;
            password: string;
        };
        /** @enum {string} */
        PaymentPermission: "payment.confirm" | "payment.reconcile.view" | "order.cancel" | "payment.refund" | "order.fulfill";
        PaymentReconciliationItem: {
            /** Format: uuid */
            attempt_id?: string;
            /** Format: date-time */
            created_at: string;
            /** @constant */
            currency: "VND";
            expected_amount_minor: number;
            observed_amount_minor: number;
            /** Format: uuid */
            payment_id: string;
            /** @enum {string} */
            reason: "wrong_reference" | "wrong_amount" | "payment_closed" | "late";
            /** Format: date-time */
            received_at: string;
            /** Format: uuid */
            reconciliation_id: string;
            transfer_reference: string;
        };
        PaymentReconciliationList: {
            items: components["schemas"]["PaymentReconciliationItem"][];
        };
        PricingMoney: {
            amount_minor: number;
            /** @constant */
            currency: "VND";
        };
        PricingPrice: {
            /** Format: date-time */
            created_at: string;
            money: components["schemas"]["PricingMoney"];
            /** Format: uuid */
            price_list_id: string;
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: uuid */
            variant_id: string;
            version: number;
        };
        PricingPriceList: {
            /** Format: date-time */
            archived_at: string | null;
            /** @constant */
            channel: "storefront";
            /** Format: date-time */
            created_at: string;
            /** @constant */
            currency: "VND";
            name: string;
            /** Format: uuid */
            price_list_id: string;
            prices: components["schemas"]["PricingPrice"][];
            priority: number;
            /** @enum {string} */
            status: "active" | "archived";
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: date-time */
            valid_from: string | null;
            /** Format: date-time */
            valid_until: string | null;
            version: number;
        };
        PricingPriceListWrite: {
            /** @constant */
            channel: "storefront";
            /** @constant */
            currency: "VND";
            expected_version?: number;
            name: string;
            prices: components["schemas"]["PricingPriceWrite"][];
            priority: number;
            /** Format: date-time */
            valid_from?: string | null;
            /** Format: date-time */
            valid_until?: string | null;
        };
        PricingPriceWrite: {
            amount_minor: number;
            /** Format: uuid */
            variant_id: string;
        };
        Problem: {
            code: string;
            details: Record<string, never>;
            message: string;
            request_id: string;
        };
        PublicCatalogMedia: {
            alt_text: string;
            object_key: string;
            position: number;
        };
        PublicCatalogPrice: {
            amount_minor: number;
            /** @constant */
            currency: "VND";
            /** @constant */
            vat_inclusive: true;
        };
        PublicCatalogProduct: {
            description: string;
            media: components["schemas"]["PublicCatalogMedia"][];
            name: string;
            /** Format: uuid */
            product_id: string;
            /** Format: date-time */
            published_at: string;
            slug: string;
            variants: components["schemas"]["PublicCatalogVariant"][];
            categories: components["schemas"]["PublicCatalogCategory"][];
        };
        PublicCatalogVariant: {
            dimensions: components["schemas"]["CatalogDimensions"];
            in_stock: boolean;
            option_values: {
                [key: string]: string;
            };
            price: components["schemas"]["PublicCatalogPrice"];
            sku: string;
            /** Format: uuid */
            variant_id: string;
            weight_grams: number;
        };
        Refund: {
            amount_minor: number;
            created?: boolean;
            /** Format: date-time */
            created_at: string;
            currency: string;
            external_reference?: string;
            /** Format: uuid */
            order_id: string;
            /** Format: uuid */
            payment_id: string;
            /** @enum {string} */
            provider: "vietqr" | "momo";
            provider_result_code?: number;
            reason: string;
            /** Format: uuid */
            refund_id: string;
            /** Format: date-time */
            settled_at?: string;
            /** @enum {string} */
            state: "pending" | "processing" | "succeeded" | "failed" | "reconciliation_required";
            /** Format: date-time */
            updated_at: string;
        };
        /** @enum {string} */
        Role: "owner" | "admin" | "staff";
        Shipment: {
            carrier: string;
            /** Format: date-time */
            completed_at: string | null;
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            order_id: string;
            /** Format: uuid */
            shipment_id: string;
            /** Format: date-time */
            shipped_at: string | null;
            /** @enum {string} */
            state: "processing" | "shipped" | "completed";
            tracking_number: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        ShipmentCreate: {
            carrier: string;
            tracking_number: string;
        };
        ShipmentTransition: {
            expected_version: number;
        };
        ShipmentUpdate: {
            carrier: string;
            expected_version: number;
            tracking_number: string;
        };
        ShippingRule: {
            /** Format: date-time */
            created_at: string;
            /** @enum {string} */
            mode: "free" | "flat";
            price: components["schemas"]["OrderMoney"];
            /** Format: uuid */
            shipping_rule_id: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        ShippingRuleWrite: {
            expected_version: number;
            flat_amount_minor: number;
            /** @enum {string} */
            mode: "free" | "flat";
        };
        Store: {
            /** Format: date-time */
            created_at: string;
            default_currency: string;
            locale: string;
            name: string;
            settings_version: number;
            /** @enum {string} */
            status: "active" | "suspended";
            /** Format: uuid */
            store_id: string;
            subdomain: components["schemas"]["Subdomain"];
            timezone: string;
            /** Format: date-time */
            updated_at: string;
        };
        StoreContext: {
            default_currency: string;
            locale: string;
            name: string;
            role: components["schemas"]["Role"];
            settings_version: number;
            /** @enum {string} */
            status: "active" | "suspended";
            /** Format: uuid */
            store_id: string;
            subdomain: components["schemas"]["Subdomain"];
            timezone: string;
        };
        Subdomain: string;
        TokenPair: {
            /** Format: date-time */
            access_expires_at: string;
            access_token: string;
            refresh_token: string;
            /** Format: date-time */
            session_expires_at: string;
            /** Format: uuid */
            session_id: string;
            /** @constant */
            token_type: "Bearer";
        };
        UpdateMembership: {
            role: components["schemas"]["Role"];
            status: components["schemas"]["MembershipStatus"];
        };
        User: {
            /** Format: date-time */
            created_at: string;
            /** Format: email */
            email: string | null;
            /** @enum {string} */
            status: "active" | "disabled";
            /** Format: uuid */
            store_id: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: uuid */
            user_id: string;
        };
        VietQRConfig: {
            account_name: string;
            bank_bin: string;
            /** Format: date-time */
            created_at: string;
            enabled: boolean;
            masked_account_number: string;
            /** Format: date-time */
            updated_at: string;
            version: number;
        };
        VietQRConfigWrite: {
            account_name: string;
            account_number: string;
            bank_bin: string;
            enabled: boolean;
            expected_version: number;
        };
        VietQRConfirmation: {
            /** Format: uuid */
            attempt_id?: string;
            created: boolean;
            /** @enum {string} */
            outcome: "paid" | "reconciliation_required";
            /** Format: uuid */
            payment_id: string;
            /** Format: uuid */
            reconciliation_id?: string;
        };
        VietQRConfirmationWrite: {
            amount_minor: number;
            /** Format: date-time */
            received_at: string;
            transfer_reference: string;
        };
        VietQRInstruction: {
            amount: components["schemas"]["OrderMoney"];
            /** Format: uuid */
            attempt_id: string;
            created: boolean;
            /** Format: date-time */
            expires_at: string;
            /** Format: uuid */
            order_id: string;
            /** Format: uuid */
            payment_id: string;
            qr_payload: string;
            qr_png_base64: string;
            transfer_reference: string;
        };
        VietQRRefundSettlement: {
            external_reference: string;
            /** Format: date-time */
            settled_at: string;
        };
        StorefrontAppearance: {
            display_name: string;
            tagline: string;
            logo_url: string;
            hero_url: string;
            hero_title: string;
            hero_text: string;
            announcement: string;
            /** @enum {string} */
            preset: "home" | "fashion" | "sport";
            /** Format: int64 */
            version: number;
        };
        StorefrontAppearanceWrite: {
            display_name: string;
            tagline: string;
            logo_url: string;
            hero_url: string;
            hero_title: string;
            hero_text: string;
            announcement: string;
            /** @enum {string} */
            preset: "home" | "fashion" | "sport";
            /** Format: int64 */
            expected_version: number;
        };
        PublicCatalogCategory: {
            /** Format: uuid */
            category_id: string;
            name: string;
            slug: string;
        };
    };
    responses: {
        /** @description Current guest session */
        CurrentGuestSession: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["CurrentGuestSession"];
            };
        };
        /** @description Guest and opaque token pair */
        GuestSession: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["TokenPair"] & {
                    /** Format: uuid */
                    guest_id: string;
                    /** Format: uuid */
                    store_id: string;
                };
            };
        };
        /** @description Store membership */
        Membership: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Membership"];
            };
        };
        /** @description Store memberships */
        MembershipList: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    memberships: components["schemas"]["Membership"][];
                };
            };
        };
        /** @description New store and owner identifiers; the owner signs in on the store host */
        OnboardingResult: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** Format: uuid */
                    owner_user_id: string;
                    /** Format: uuid */
                    store_id: string;
                    subdomain: components["schemas"]["Subdomain"];
                };
            };
        };
        /** @description Problem response */
        Problem: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
        /** @description Rate limited */
        RateLimited: {
            headers: {
                "Retry-After"?: number;
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
        /** @description Provider authorization URL */
        SocialAuthorization: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** Format: uri */
                    authorization_url: string;
                };
            };
        };
        /** @description Store */
        Store: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Store"];
            };
        };
        /** @description Authorized store context */
        StoreContext: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["StoreContext"];
            };
        };
        /** @description Opaque token pair */
        TokenPair: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["TokenPair"];
            };
        };
        /** @description Store-bound user and opaque token pair */
        UserSession: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["TokenPair"] & {
                    /** Format: uuid */
                    store_id: string;
                    /** Format: uuid */
                    user_id: string;
                };
            };
        };
    };
    parameters: {
        AddressID: string;
        Provider: "google" | "facebook";
        StoreID: string;
        UserID: string;
        VariantID: string;
    };
    requestBodies: {
        ExpectedVersion: {
            content: {
                "application/json": {
                    expected_version: number;
                };
            };
        };
        Refresh: {
            content: {
                "application/json": {
                    refresh_token: string;
                };
            };
        };
        SocialStart: {
            content: {
                "application/json": {
                    return_path: string;
                };
            };
        };
    };
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listCatalogCategories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Store catalog categories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        categories: components["schemas"]["CatalogCategory"][];
                    };
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createCatalogCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogCategoryWrite"];
            };
        };
        responses: {
            /** @description Created category */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogCategory"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceCatalogCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogCategoryWrite"] & {
                    expected_version: number;
                };
            };
        };
        responses: {
            /** @description Updated category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogCategory"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    archiveCatalogCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Archived category */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogCategory"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listCatalogProducts: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Keyset page of authoring products */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        next_cursor: string | null;
                        products: components["schemas"]["CatalogProduct"][];
                    };
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createCatalogProduct: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogProductWrite"];
            };
        };
        responses: {
            /** @description Created draft product */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProduct"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getCatalogProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                product_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Authoring product aggregate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProduct"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceCatalogProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                product_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogProductWrite"] & {
                    expected_version: number;
                };
            };
        };
        responses: {
            /** @description Updated product */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProduct"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    archiveCatalogProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                product_id: string;
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Archived product */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProduct"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    publishCatalogProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                product_id: string;
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Published priced product */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProduct"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listInventoryStockItems: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Keyset page of materialized stock items */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        next_cursor: string | null;
                        stock_items: components["schemas"]["InventoryStockItem"][];
                    };
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getInventoryStockItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Exact stock state; an unmaterialized active variant has zero quantities and version zero */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryStockItem"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    adjustInventoryStock: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                variant_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InventoryAdjustment"];
            };
        };
        responses: {
            /** @description Adjusted stock state or the exact replay result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryStockItem"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listFulfillmentOrders: {
        parameters: {
            query?: {
                state?: "paid" | "processing" | "shipped";
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tenant fulfillment queue */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        next_cursor: string | null;
                        orders: components["schemas"]["Order"][];
                    };
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getFulfillmentOrder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tenant fulfillment order */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    cancelOrderAsWorkforce: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancellationRequest"];
            };
        };
        responses: {
            /** @description Recorded cancellation replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CancellationResult"];
                };
            };
            /** @description Cancellation or full refund requested */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CancellationResult"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createShipment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShipmentCreate"];
            };
        };
        responses: {
            /** @description Recorded shipment replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Shipment"];
                };
            };
            /** @description Shipment created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Shipment"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getMoMoConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current redacted MoMo configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoMoConfig"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceMoMoConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MoMoConfigWrite"];
            };
        };
        responses: {
            /** @description Updated redacted MoMo configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoMoConfig"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    headMoMoConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description MoMo configuration exists */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getVietQRConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current redacted VietQR configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRConfig"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceVietQRConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VietQRConfigWrite"];
            };
        };
        responses: {
            /** @description Updated redacted VietQR configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRConfig"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    headVietQRConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description VietQR configuration exists */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listPaymentReconciliationItems: {
        parameters: {
            query?: {
                limit?: number;
                before_created_at?: string;
                before_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tenant-scoped unresolved reconciliation items */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentReconciliationList"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    confirmVietQRPayment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                payment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VietQRConfirmationWrite"];
            };
        };
        responses: {
            /** @description Existing idempotent confirmation */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRConfirmation"];
                };
            };
            /** @description Confirmation recorded */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRConfirmation"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listPriceLists: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Keyset page of price lists */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        next_cursor: string | null;
                        price_lists: components["schemas"]["PricingPriceList"][];
                    };
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createPriceList: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PricingPriceListWrite"];
            };
        };
        responses: {
            /** @description Created price list */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PricingPriceList"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getPriceList: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                price_list_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Price-list aggregate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PricingPriceList"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replacePriceList: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                price_list_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PricingPriceListWrite"] & {
                    expected_version: number;
                };
            };
        };
        responses: {
            /** @description Updated price list */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PricingPriceList"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    archivePriceList: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                price_list_id: string;
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Archived price list */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PricingPriceList"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getRefund: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                refund_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Refund */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    executeMoMoRefund: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                refund_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current refund result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    settleVietQRRefund: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                refund_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VietQRRefundSettlement"];
            };
        };
        responses: {
            /** @description Settled refund */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    updateShipment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                shipment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShipmentUpdate"];
            };
        };
        responses: {
            /** @description Shipment updated or replayed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Shipment"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    completeShipment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                shipment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShipmentTransition"];
            };
        };
        responses: {
            /** @description Shipment completed or replayed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Shipment"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    dispatchShipment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                shipment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShipmentTransition"];
            };
        };
        responses: {
            /** @description Shipment dispatched or replayed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Shipment"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getShippingRule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current shipping rule */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShippingRule"];
                };
            };
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceShippingRule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShippingRuleWrite"];
            };
        };
        responses: {
            /** @description Current shipping rule */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShippingRule"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    currentUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordLogin"];
            };
        };
        responses: {
            201: components["responses"]["UserSession"];
            400: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordLogin"];
            };
        };
        responses: {
            200: components["responses"]["UserSession"];
            401: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    logoutUserSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Session revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    refreshUserSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["Refresh"];
        responses: {
            200: components["responses"]["TokenPair"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    continueSocialLogin: {
        parameters: {
            query: {
                code: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect to the configured provider */
            303: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    exchangeSocialCode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    exchange_code: string;
                };
            };
        };
        responses: {
            200: components["responses"]["UserSession"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    socialCallback: {
        parameters: {
            query: {
                state: string;
                code?: string;
                error?: string;
            };
            header?: never;
            path: {
                provider: components["parameters"]["Provider"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect with one-time exchange code */
            303: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    startSocialLink: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                provider: components["parameters"]["Provider"];
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["SocialStart"];
        responses: {
            200: components["responses"]["SocialAuthorization"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    startSocialLogin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                provider: components["parameters"]["Provider"];
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["SocialStart"];
        responses: {
            200: components["responses"]["SocialAuthorization"];
            400: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    getCart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current active cart */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cart"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createOrGetCart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Existing active cart */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cart"];
                };
            };
            /** @description Created active cart */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cart"];
                };
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    abandonCart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Cart abandoned */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    setCartLine: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant_id: components["parameters"]["VariantID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CartLineWrite"];
            };
        };
        responses: {
            /** @description Updated cart */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cart"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    removeCartLine: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant_id: components["parameters"]["VariantID"];
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Updated cart */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cart"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listStorefrontProducts: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Priced published products */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        next_cursor: string | null;
                        products: components["schemas"]["PublicCatalogProduct"][];
                    };
                };
            };
            400: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getStorefrontProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Priced published product */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicCatalogProduct"];
                };
            };
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    checkoutCart: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutWrite"];
            };
        };
        responses: {
            /** @description Existing checkout result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutResult"];
                };
            };
            /** @description Created checkout result */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutResult"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    listCustomerAddresses: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current customer addresses */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        addresses: components["schemas"]["CustomerAddress"][];
                        next_cursor: string | null;
                    };
                };
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createCustomerAddress: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerAddressWrite"];
            };
        };
        responses: {
            /** @description Created address */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerAddress"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getCustomerAddress: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: components["parameters"]["AddressID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Owned address */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerAddress"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceCustomerAddress: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: components["parameters"]["AddressID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerAddressWrite"] & {
                    expected_version: number;
                };
            };
        };
        responses: {
            /** @description Replaced address */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerAddress"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    archiveCustomerAddress: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: components["parameters"]["AddressID"];
            };
            cookie?: never;
        };
        requestBody: components["requestBodies"]["ExpectedVersion"];
        responses: {
            /** @description Address archived */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getCustomerProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current customer profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerProfile"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    putCustomerProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerProfileWrite"];
            };
        };
        responses: {
            /** @description Created or replaced customer profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerProfile"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createGuestSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: components["responses"]["GuestSession"];
            404: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
        };
    };
    currentGuestSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["CurrentGuestSession"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    logoutGuestSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Guest session revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    refreshGuestSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: components["requestBodies"]["Refresh"];
        responses: {
            200: components["responses"]["TokenPair"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    listMemberships: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["MembershipList"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    addMembership: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddMembership"];
            };
        };
        responses: {
            201: components["responses"]["Membership"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    updateMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: components["parameters"]["UserID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMembership"];
            };
        };
        responses: {
            200: components["responses"]["Membership"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceMembershipPaymentPermissions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: components["parameters"]["UserID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipPaymentPermissionsWrite"];
            };
        };
        responses: {
            /** @description Updated staff payment permissions */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipPaymentPermissions"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    onboardStore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OnboardStore"];
            };
        };
        responses: {
            201: components["responses"]["OnboardingResult"];
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            429: components["responses"]["RateLimited"];
            503: components["responses"]["Problem"];
        };
    };
    getOrder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Owned order */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    cancelOwnedOrder: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancellationRequest"];
            };
        };
        responses: {
            /** @description Recorded cancellation replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CancellationResult"];
                };
            };
            /** @description Order cancelled */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CancellationResult"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    startMoMoPayment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Existing idempotent attempt */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoMoAttempt"];
                };
            };
            /** @description MoMo attempt created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoMoAttempt"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    createVietQRInstruction: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Existing idempotent instruction */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRInstruction"];
                };
            };
            /** @description VietQR instruction created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VietQRInstruction"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    receiveMoMoIPN: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                callback_token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Notification durably processed or replay acknowledged */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getStore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["StoreContext"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    liveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Process is live */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dependencies are ready */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: components["responses"]["Problem"];
        };
    };
    getPublicStorefront: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Store appearance */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StorefrontAppearance"];
                };
            };
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    getStorefrontAppearance: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Store appearance */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StorefrontAppearance"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    replaceStorefrontAppearance: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StorefrontAppearanceWrite"];
            };
        };
        responses: {
            /** @description Store appearance */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StorefrontAppearance"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
}
