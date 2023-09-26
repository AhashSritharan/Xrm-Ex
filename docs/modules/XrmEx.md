[xrm-ex](../README.md) / [Exports](../modules.md) / XrmEx

# Namespace: XrmEx

## Table of contents

### Classes

- [BooleanField](../classes/XrmEx.BooleanField.md)
- [DateField](../classes/XrmEx.DateField.md)
- [Field](../classes/XrmEx.Field.md)
- [Form](../classes/XrmEx.Form.md)
- [GridControl](../classes/XrmEx.GridControl.md)
- [LookupField](../classes/XrmEx.LookupField.md)
- [MultiSelectOptionSetField](../classes/XrmEx.MultiSelectOptionSetField.md)
- [NumberField](../classes/XrmEx.NumberField.md)
- [OptionsetField](../classes/XrmEx.OptionsetField.md)
- [Section](../classes/XrmEx.Section.md)
- [Tab](../classes/XrmEx.Tab.md)
- [TextField](../classes/XrmEx.TextField.md)

### Functions

- [addGlobalNotification](XrmEx.md#addglobalnotification)
- [checkRequestParameterType](XrmEx.md#checkrequestparametertype)
- [executeAction](XrmEx.md#executeaction)
- [executeFunction](XrmEx.md#executefunction)
- [getEnvironmentVariableValue](XrmEx.md#getenvironmentvariablevalue)
- [getMethodName](XrmEx.md#getmethodname)
- [normalizeGuid](XrmEx.md#normalizeguid)
- [openAlertDialog](XrmEx.md#openalertdialog)
- [removeGlobalNotification](XrmEx.md#removeglobalnotification)
- [throwError](XrmEx.md#throwerror)

## Functions

### addGlobalNotification

▸ **addGlobalNotification**(`message`, `level`, `showCloseButton?`): `Promise`<`string`\>

Displays a notification for an app with the given message and level, and lets you specify whether to show a close button.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `message` | `string` | `undefined` | The message to display in the notification. |
| `level` | ``"SUCCESS"`` \| ``"ERROR"`` \| ``"WARNING"`` \| ``"INFO"`` | `undefined` | The level of the notification. Can be 'SUCCESS', 'ERROR', 'WARNING', or 'INFO'. |
| `showCloseButton?` | `boolean` | `false` | Whether to show a close button on the notification. Defaults to false. |

#### Returns

`Promise`<`string`\>

- A promise that resolves with the ID of the created notification.

#### Defined in

[XrmEx.ts:70](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L70)

___

### checkRequestParameterType

▸ **checkRequestParameterType**(`requestParameter`): `void`

Checks if the given request parameter is of a supported type and has a valid value.

**`Throws`**

- Throws an error if the request parameter is not of a supported type or has an invalid value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requestParameter` | [`RequestParameter`](../modules.md#requestparameter) | The request parameter to check. |

#### Returns

`void`

#### Defined in

[XrmEx.ts:177](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L177)

___

### executeAction

▸ **executeAction**(`actionName`, `requestParameters`, `boundEntity?`): `Promise`<`any`\>

Executes an Action.

**`Throws`**

- Throws an error if the request parameter is not of a supported type or has an invalid value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionName` | `string` | The unique name of the action. |
| `requestParameters` | [`RequestParameter`](../modules.md#requestparameter)[] | An array of objects with the parameter name, type and value. |
| `boundEntity?` | [`EntityReference`](../modules.md#entityreference) | An optional EntityReference of the bound entity. |

#### Returns

`Promise`<`any`\>

- A Promise with the request response.

#### Defined in

[XrmEx.ts:232](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L232)

___

### executeFunction

▸ **executeFunction**(`functionName`, `requestParameters`, `boundEntity?`): `Promise`<`any`\>

Executes a Function.

**`Throws`**

- Throws an error if the request parameter is not of a supported type or has an invalid value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `functionName` | `string` | The unique name of the function. |
| `requestParameters` | [`RequestParameter`](../modules.md#requestparameter)[] | An array of objects with the parameter name, type and value. |
| `boundEntity?` | [`EntityReference`](../modules.md#entityreference) | An optional EntityReference of the bound entity. |

#### Returns

`Promise`<`any`\>

- A Promise with the request response.

#### Defined in

[XrmEx.ts:274](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L274)

___

### getEnvironmentVariableValue

▸ **getEnvironmentVariableValue**(`environmentVariableSchemaName`): `Promise`<`string`\>

Retrieves the value of an environment variable by using its schema name as key.
If the environment variable has both a default value and a current value, this function will retrieve the current value.

**`Async`**

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `environmentVariableSchemaName` | `string` | The schema name of the environment variable to retrieve. |

#### Returns

`Promise`<`string`\>

- A promise that resolves with the value of the environment variable.

#### Defined in

[XrmEx.ts:115](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L115)

___

### getMethodName

▸ **getMethodName**(): `string`

Returns the name of the calling function.

#### Returns

`string`

- The name of the calling function.

#### Defined in

[XrmEx.ts:48](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L48)

___

### normalizeGuid

▸ **normalizeGuid**(`guid`): `string`

Makes a GUID lowercase and removes brackets.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guid` | `string` | The GUID to normalize. |

#### Returns

`string`

- The normalized GUID.

#### Defined in

[XrmEx.ts:313](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L313)

___

### openAlertDialog

▸ **openAlertDialog**(`title`, `text`): `Promise`<`any`\>

Opens a dialog with dynamic height and width based on text content.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `title` | `string` | The title of the dialog. |
| `text` | `string` | The text content of the dialog. |

#### Returns

`Promise`<`any`\>

- A Promise with the dialog response.

#### Defined in

[XrmEx.ts:324](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L324)

___

### removeGlobalNotification

▸ **removeGlobalNotification**(`uniqueId`): `Promise`<`string`\>

Clears a notification in the app with the given unique ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | The unique ID of the notification to clear. |

#### Returns

`Promise`<`string`\>

- A promise that resolves when the notification has been cleared.

#### Defined in

[XrmEx.ts:99](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L99)

___

### throwError

▸ **throwError**(`errorMessage`): `never`

Throws an error with the given error message.

**`Throws`**

- Always throws an error with the given error message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `errorMessage` | `string` | The error message to throw. |

#### Returns

`never`

#### Defined in

[XrmEx.ts:41](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L41)
