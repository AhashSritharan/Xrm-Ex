[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / Form

# Class: Form

[XrmEx](../modules/XrmEx.md).Form

Represents a form in Dynamics 365.

## Table of contents

### Constructors

- [constructor](XrmEx.Form.md#constructor)

### Properties

- [\_executionContext](XrmEx.Form.md#_executioncontext)
- [\_formContext](XrmEx.Form.md#_formcontext)

### Accessors

- [IsCreate](XrmEx.Form.md#iscreate)
- [IsNotCreate](XrmEx.Form.md#isnotcreate)
- [IsNotUpdate](XrmEx.Form.md#isnotupdate)
- [IsUpdate](XrmEx.Form.md#isupdate)
- [entityReference](XrmEx.Form.md#entityreference)
- [executionContext](XrmEx.Form.md#executioncontext)
- [formContext](XrmEx.Form.md#formcontext)

### Methods

- [addFormNotification](XrmEx.Form.md#addformnotification)
- [addOnChangeEventHandler](XrmEx.Form.md#addonchangeeventhandler)
- [addOnLoadEventHandler](XrmEx.Form.md#addonloadeventhandler)
- [addOnPostSaveEventHandler](XrmEx.Form.md#addonpostsaveeventhandler)
- [addOnSaveEventHandler](XrmEx.Form.md#addonsaveeventhandler)
- [removeFormNotification](XrmEx.Form.md#removeformnotification)

## Constructors

### constructor

• **new Form**()

#### Defined in

[XrmEx.ts:384](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L384)

## Properties

### \_executionContext

▪ `Static` `Protected` **\_executionContext**: `EventContext`

#### Defined in

[XrmEx.ts:383](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L383)

___

### \_formContext

▪ `Static` `Protected` **\_formContext**: `FormContext`

#### Defined in

[XrmEx.ts:382](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L382)

## Accessors

### IsCreate

• `Static` `get` **IsCreate**(): `boolean`

Returns true if form is from type create

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:422](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L422)

___

### IsNotCreate

• `Static` `get` **IsNotCreate**(): `boolean`

Returns true if form is not from type create

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:430](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L430)

___

### IsNotUpdate

• `Static` `get` **IsNotUpdate**(): `boolean`

Returns true if form is not from type update

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:434](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L434)

___

### IsUpdate

• `Static` `get` **IsUpdate**(): `boolean`

Returns true if form is from type update

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:426](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L426)

___

### entityReference

• `Static` `get` **entityReference**(): `LookupValue`

Gets a lookup value that references the record.

#### Returns

`LookupValue`

#### Defined in

[XrmEx.ts:394](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L394)

___

### executionContext

• `Static` `get` **executionContext**(): `EventContext`

Gets a reference to the current executio context

#### Returns

`EventContext`

#### Defined in

[XrmEx.ts:390](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L390)

• `Static` `set` **executionContext**(`context`): `void`

Sets a reference to the current execution context

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `FormContext` \| `EventContext` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:409](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L409)

___

### formContext

• `Static` `get` **formContext**(): `FormContext`

Gets a reference to the current form context

#### Returns

`FormContext`

#### Defined in

[XrmEx.ts:386](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L386)

• `Static` `set` **formContext**(`context`): `void`

Sets a reference to the current form context

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `FormContext` \| `EventContext` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:398](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L398)

## Methods

### addFormNotification

▸ `Static` **addFormNotification**(`message`, `level`, `uniqueId`): `boolean`

Displays a form level notification. Any number of notifications can be displayed and will remain until removed using clearFormNotification.
The height of the notification area is limited so each new message will be added to the top.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The text of the notification message. |
| `level` | `FormNotificationLevel` | The level of the notification which defines how the message will be displayed, such as the icon. ERROR: Notification will use the system error icon. WARNING: Notification will use the system warning icon. INFO: Notification will use the system info icon. |
| `uniqueId` | `string` | Unique identifier for the notification which is used with clearFormNotification to remove the notification. |

#### Returns

`boolean`

true if it succeeds, otherwise false.

#### Defined in

[XrmEx.ts:448](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L448)

___

### addOnChangeEventHandler

▸ `Static` **addOnChangeEventHandler**(`fields`, `handlers`, `execute?`): `void`

Adds a handler to be called when the attribute's value is changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`Field`](XrmEx.Field.md)[] |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] |
| `execute?` | `boolean` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:549](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L549)

___

### addOnLoadEventHandler

▸ `Static` **addOnLoadEventHandler**(`handlers`): `void`

Adds a function to be called when form data is loaded.

#### Parameters

| Name | Type |
| :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] |

#### Returns

`void`

#### Defined in

[XrmEx.ts:526](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L526)

___

### addOnPostSaveEventHandler

▸ `Static` **addOnPostSaveEventHandler**(`handlers`): `void`

Adds a function to be called after the OnSave is complete.

**`Remarks`**

Added in 9.2

**`See`**

[External Link: PostSave Event Documentation](https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/events/postsave)

#### Parameters

| Name | Type |
| :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] |

#### Returns

`void`

#### Defined in

[XrmEx.ts:503](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L503)

___

### addOnSaveEventHandler

▸ `Static` **addOnSaveEventHandler**(`handlers`): `void`

Adds a handler to be called when the record is saved.

#### Parameters

| Name | Type |
| :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] |

#### Returns

`void`

#### Defined in

[XrmEx.ts:478](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L478)

___

### removeFormNotification

▸ `Static` **removeFormNotification**(`uniqueId`): `boolean`

Clears the form notification described by uniqueId.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | Unique identifier. |

#### Returns

`boolean`

True if it succeeds, otherwise false.

#### Defined in

[XrmEx.ts:468](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L468)
