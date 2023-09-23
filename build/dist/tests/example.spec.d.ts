import { Page } from '@playwright/test';
type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
declare global {
    interface Window {
        model: PromiseType<ReturnType<typeof getModel>>;
    }
}
declare function getModel(page: Page): Promise<{
    fields: {
        Firstname: XrmEx.TextField;
        Lastname: XrmEx.TextField;
        JobTitle: XrmEx.TextField;
        PreferredContactMethod: XrmEx.OptionsetField<{
            Any: number;
            Email: number;
            Phone: number;
            Fax: number;
            Mail: number;
        }>;
        Customer: XrmEx.LookupField;
        BusinessPhone: XrmEx.TextField;
        Gender: XrmEx.OptionsetField<{
            [key: string]: number;
        }>;
        Email: XrmEx.TextField;
        MobilePhone: XrmEx.TextField;
        Owner: XrmEx.LookupField;
        DoNotEmail: XrmEx.BooleanField;
        MaritalStatus: XrmEx.OptionsetField<{
            [key: string]: number;
        }>;
        SpousePartnerName: XrmEx.TextField;
        Birthday: XrmEx.DateField;
    };
    tabs: {
        General: XrmEx.Tab<{
            Section1: XrmEx.Section;
            Section2: XrmEx.Section;
        }>;
        Details: XrmEx.Tab<{
            Section1: XrmEx.Section;
            Section2: XrmEx.Section;
        }>;
    };
    grids: {
        ContactSubgrid: XrmEx.GridControl;
    };
}>;
export {};
