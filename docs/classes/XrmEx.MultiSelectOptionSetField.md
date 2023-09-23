[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / MultiSelectOptionSetField

# Class: MultiSelectOptionSetField<Options\>

[XrmEx](../modules/XrmEx.md).MultiSelectOptionSetField

Used to execute methods related to a single Attribute

## Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `OptionValues` |

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`MultiSelectOptionSetField`**

## Implements

- `MultiSelectOptionSetAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.MultiSelectOptionSetField.md#constructor)

### Properties

- [Name](XrmEx.MultiSelectOptionSetField.md#name)
- [Option](XrmEx.MultiSelectOptionSetField.md#option)
- [\_attribute](XrmEx.MultiSelectOptionSetField.md#_attribute)
- [allFields](XrmEx.MultiSelectOptionSetField.md#allfields)

### Accessors

- [Attribute](XrmEx.MultiSelectOptionSetField.md#attribute)
- [Value](XrmEx.MultiSelectOptionSetField.md#value)
- [controls](XrmEx.MultiSelectOptionSetField.md#controls)

### Methods

- [addNotification](XrmEx.MultiSelectOptionSetField.md#addnotification)
- [addOnChange](XrmEx.MultiSelectOptionSetField.md#addonchange)
- [fireOnChange](XrmEx.MultiSelectOptionSetField.md#fireonchange)
- [getAttributeType](XrmEx.MultiSelectOptionSetField.md#getattributetype)
- [getFormat](XrmEx.MultiSelectOptionSetField.md#getformat)
- [getInitialValue](XrmEx.MultiSelectOptionSetField.md#getinitialvalue)
- [getIsDirty](XrmEx.MultiSelectOptionSetField.md#getisdirty)
- [getName](XrmEx.MultiSelectOptionSetField.md#getname)
- [getOption](XrmEx.MultiSelectOptionSetField.md#getoption)
- [getOptions](XrmEx.MultiSelectOptionSetField.md#getoptions)
- [getParent](XrmEx.MultiSelectOptionSetField.md#getparent)
- [getRequiredLevel](XrmEx.MultiSelectOptionSetField.md#getrequiredlevel)
- [getSelectedOption](XrmEx.MultiSelectOptionSetField.md#getselectedoption)
- [getSubmitMode](XrmEx.MultiSelectOptionSetField.md#getsubmitmode)
- [getText](XrmEx.MultiSelectOptionSetField.md#gettext)
- [getUserPrivilege](XrmEx.MultiSelectOptionSetField.md#getuserprivilege)
- [getValue](XrmEx.MultiSelectOptionSetField.md#getvalue)
- [removeNotification](XrmEx.MultiSelectOptionSetField.md#removenotification)
- [removeOnChange](XrmEx.MultiSelectOptionSetField.md#removeonchange)
- [setDisabled](XrmEx.MultiSelectOptionSetField.md#setdisabled)
- [setIsValid](XrmEx.MultiSelectOptionSetField.md#setisvalid)
- [setNotification](XrmEx.MultiSelectOptionSetField.md#setnotification)
- [setRequired](XrmEx.MultiSelectOptionSetField.md#setrequired)
- [setRequiredLevel](XrmEx.MultiSelectOptionSetField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.MultiSelectOptionSetField.md#setsubmitmode)
- [setValue](XrmEx.MultiSelectOptionSetField.md#setvalue)
- [setVisible](XrmEx.MultiSelectOptionSetField.md#setvisible)

## Constructors

### constructor

• **new MultiSelectOptionSetField**<`Options`\>(`attributeName`, `option?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `OptionValues` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `string` |
| `option?` | `Options` |

#### Overrides

[Field](XrmEx.Field.md).[constructor](XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:945](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L945)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L584)

___

### Option

• **Option**: `Options`

#### Defined in

[XrmEx.ts:944](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L944)

___

### \_attribute

• `Protected` **\_attribute**: `MultiSelectOptionSetAttribute`

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:943](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L943)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `MultiSelectOptionSetAttribute`

#### Returns

`MultiSelectOptionSetAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:971](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L971)

___

### Value

• `get` **Value**(): `number`[]

Gets the value.

#### Returns

`number`[]

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:979](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L979)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number`[] \| keyof `Options`[] |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:982](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L982)

___

### controls

• `get` **controls**(): `ItemCollection`<`OptionSetControl`\>

#### Returns

`ItemCollection`<`OptionSetControl`\>

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:976](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L976)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L750)

___

### fireOnChange

▸ **fireOnChange**(): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Fire all "on change" event handlers.

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.fireOnChange

#### Inherited from

[Field](XrmEx.Field.md).[fireOnChange](XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:737](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L737)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getAttributeType

#### Inherited from

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `OptionSetAttributeFormat`

#### Returns

`OptionSetAttributeFormat`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getFormat

#### Overrides

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:949](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L949)

___

### getInitialValue

▸ **getInitialValue**(): `number`[]

#### Returns

`number`[]

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getInitialValue

#### Defined in

[XrmEx.ts:968](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L968)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L606)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getName

#### Inherited from

[Field](XrmEx.Field.md).[getName](XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:609](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L609)

___

### getOption

▸ **getOption**(`value`): `OptionSetValue`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` \| `number` |

#### Returns

`OptionSetValue`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getOption

#### Defined in

[XrmEx.ts:952](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L952)

___

### getOptions

▸ **getOptions**(): `OptionSetValue`[]

#### Returns

`OptionSetValue`[]

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getOptions

#### Defined in

[XrmEx.ts:959](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L959)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L612)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[getRequiredLevel](XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:615](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L615)

___

### getSelectedOption

▸ **getSelectedOption**(): `OptionSetValue`[]

#### Returns

`OptionSetValue`[]

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getSelectedOption

#### Defined in

[XrmEx.ts:962](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L962)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[getSubmitMode](XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:618](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L618)

___

### getText

▸ **getText**(): `string`[]

#### Returns

`string`[]

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getText

#### Defined in

[XrmEx.ts:965](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L965)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getUserPrivilege

#### Inherited from

[Field](XrmEx.Field.md).[getUserPrivilege](XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:621](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L621)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[removeNotification](XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:809](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L809)

___

### removeOnChange

▸ **removeOnChange**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `ChangeEventHandler` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.removeOnChange

#### Inherited from

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L624)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setDisabled](XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:699](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L699)

___

### setIsValid

▸ **setIsValid**(`isValid`, `message?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `isValid` | `boolean` |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.setIsValid

#### Inherited from

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L633)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Sets a control-local notification message.

**`Remarks`**

When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon
             appears next to the control. Tapping on the icon will display the message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The message. |
| `uniqueId` | `string` | Unique identifier. |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L669)

___

### setRequired

▸ **setRequired**(`required`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.setRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[setRequiredLevel](XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:712](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L712)

___

### setSubmitMode

▸ **setSubmitMode**(`submitMode`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `submitMode` | `SubmitMode` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.setSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[setSubmitMode](XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:627](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L627)

___

### setValue

▸ **setValue**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.MultiSelectOptionSetAttribute.setValue

#### Inherited from

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/Xrm-Ex/blob/68eea71/src/XrmEx.ts#L686)
