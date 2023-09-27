[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / Form

# Class: Form

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).Form

Represents a form in Dynamics 365.

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.Form.md#constructor)

### Properties

- [\_executionContext](https://github.com/AhashSritharan/classes/XrmEx.Form.md#_executioncontext)
- [\_formContext](https://github.com/AhashSritharan/classes/XrmEx.Form.md#_formcontext)

### Accessors

- [IsCreate](https://github.com/AhashSritharan/classes/XrmEx.Form.md#iscreate)
- [IsNotCreate](https://github.com/AhashSritharan/classes/XrmEx.Form.md#isnotcreate)
- [IsNotUpdate](https://github.com/AhashSritharan/classes/XrmEx.Form.md#isnotupdate)
- [IsUpdate](https://github.com/AhashSritharan/classes/XrmEx.Form.md#isupdate)
- [entityReference](https://github.com/AhashSritharan/classes/XrmEx.Form.md#entityreference)
- [executionContext](https://github.com/AhashSritharan/classes/XrmEx.Form.md#executioncontext)
- [formContext](https://github.com/AhashSritharan/classes/XrmEx.Form.md#formcontext)

### Methods

- [addFormNotification](https://github.com/AhashSritharan/classes/XrmEx.Form.md#addformnotification)
- [addOnChangeEventHandler](https://github.com/AhashSritharan/classes/XrmEx.Form.md#addonchangeeventhandler)
- [addOnLoadEventHandler](https://github.com/AhashSritharan/classes/XrmEx.Form.md#addonloadeventhandler)
- [addOnPostSaveEventHandler](https://github.com/AhashSritharan/classes/XrmEx.Form.md#addonpostsaveeventhandler)
- [addOnSaveEventHandler](https://github.com/AhashSritharan/classes/XrmEx.Form.md#addonsaveeventhandler)
- [removeFormNotification](https://github.com/AhashSritharan/classes/XrmEx.Form.md#removeformnotification)

## Constructors

### constructor

• **new Form**()

#### Defined in

[XrmEx.ts:386](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L386)

## Properties

### \_executionContext

▪ `Static` `Protected` **\_executionContext**: `EventContext`

#### Defined in

[XrmEx.ts:385](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L385)

___

### \_formContext

▪ `Static` `Protected` **\_formContext**: `FormContext`

#### Defined in

[XrmEx.ts:384](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L384)

## Accessors

### IsCreate

• `Static` `get` **IsCreate**(): `boolean`

Returns true if form is from type create

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:424](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L424)

___

### IsNotCreate

• `Static` `get` **IsNotCreate**(): `boolean`

Returns true if form is not from type create

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:432](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L432)

___

### IsNotUpdate

• `Static` `get` **IsNotUpdate**(): `boolean`

Returns true if form is not from type update

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:436](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L436)

___

### IsUpdate

• `Static` `get` **IsUpdate**(): `boolean`

Returns true if form is from type update

#### Returns

`boolean`

#### Defined in

[XrmEx.ts:428](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L428)

___

### entityReference

• `Static` `get` **entityReference**(): `LookupValue`

Gets a lookup value that references the record.

#### Returns

`LookupValue`

#### Defined in

[XrmEx.ts:396](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L396)

___

### executionContext

• `Static` `get` **executionContext**(): `EventContext`

Gets a reference to the current executio context

#### Returns

`EventContext`

#### Defined in

[XrmEx.ts:392](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L392)

• `Static` `set` **executionContext**(`context`): `void`

Sets a reference to the current execution context

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `FormContext` \| `EventContext` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:411](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L411)

___

### formContext

• `Static` `get` **formContext**(): `FormContext`

Gets a reference to the current form context

#### Returns

`FormContext`

#### Defined in

[XrmEx.ts:388](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L388)

• `Static` `set` **formContext**(`context`): `void`

Sets a reference to the current form context

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `FormContext` \| `EventContext` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:400](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L400)

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

[XrmEx.ts:450](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L450)

___

### addOnChangeEventHandler

▸ `Static` **addOnChangeEventHandler**(`fields`, `handlers`, `execute?`): `void`

Adds a handler to be called when the attribute's value is changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] |
| `execute?` | `boolean` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:551](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L551)

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

[XrmEx.ts:528](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L528)

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

[XrmEx.ts:505](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L505)

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

[XrmEx.ts:480](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L480)

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

[XrmEx.ts:470](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L470)
