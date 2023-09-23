/// <reference path="XrmEx.d.ts" />
/// <reference types="xrm" />
declare namespace Theia {
    namespace TemplateFunctions {
        function Init(executionContext: Xrm.FormContext | Xrm.Events.EventContext): Promise<void>;
        function OnLoad(executionContext: Xrm.FormContext | Xrm.Events.EventContext): Promise<void>;
    }
}
