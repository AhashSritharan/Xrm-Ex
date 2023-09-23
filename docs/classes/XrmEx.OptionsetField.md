[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / OptionsetField

# Class: OptionsetField<Options\>

[XrmEx](../modules/XrmEx.md).OptionsetField

Used to execute methods related to a single Attribute

## Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `OptionValues` |

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`OptionsetField`**

## Implements

- `OptionSetAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.OptionsetField.md#constructor)

### Properties

- [Name](XrmEx.OptionsetField.md#name)
- [Option](XrmEx.OptionsetField.md#option)
- [\_attribute](XrmEx.OptionsetField.md#_attribute)
- [\_control](XrmEx.OptionsetField.md#_control)
- [allFields](XrmEx.OptionsetField.md#allfields)

### Accessors

- [Attribute](XrmEx.OptionsetField.md#attribute)
- [Value](XrmEx.OptionsetField.md#value)
- [control](XrmEx.OptionsetField.md#control)
- [controls](XrmEx.OptionsetField.md#controls)

### Methods

- [addNotification](XrmEx.OptionsetField.md#addnotification)
- [addOnChange](XrmEx.OptionsetField.md#addonchange)
- [addOption](XrmEx.OptionsetField.md#addoption)
- [clearOptions](XrmEx.OptionsetField.md#clearoptions)
- [fireOnChange](XrmEx.OptionsetField.md#fireonchange)
- [getAttributeType](XrmEx.OptionsetField.md#getattributetype)
- [getFormat](XrmEx.OptionsetField.md#getformat)
- [getInitialValue](XrmEx.OptionsetField.md#getinitialvalue)
- [getIsDirty](XrmEx.OptionsetField.md#getisdirty)
- [getName](XrmEx.OptionsetField.md#getname)
- [getOption](XrmEx.OptionsetField.md#getoption)
- [getOptions](XrmEx.OptionsetField.md#getoptions)
- [getParent](XrmEx.OptionsetField.md#getparent)
- [getRequiredLevel](XrmEx.OptionsetField.md#getrequiredlevel)
- [getSelectedOption](XrmEx.OptionsetField.md#getselectedoption)
- [getSubmitMode](XrmEx.OptionsetField.md#getsubmitmode)
- [getText](XrmEx.OptionsetField.md#gettext)
- [getUserPrivilege](XrmEx.OptionsetField.md#getuserprivilege)
- [getValue](XrmEx.OptionsetField.md#getvalue)
- [removeNotification](XrmEx.OptionsetField.md#removenotification)
- [removeOnChange](XrmEx.OptionsetField.md#removeonchange)
- [removeOption](XrmEx.OptionsetField.md#removeoption)
- [setDisabled](XrmEx.OptionsetField.md#setdisabled)
- [setIsValid](XrmEx.OptionsetField.md#setisvalid)
- [setNotification](XrmEx.OptionsetField.md#setnotification)
- [setRequired](XrmEx.OptionsetField.md#setrequired)
- [setRequiredLevel](XrmEx.OptionsetField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.OptionsetField.md#setsubmitmode)
- [setValue](XrmEx.OptionsetField.md#setvalue)
- [setVisible](XrmEx.OptionsetField.md#setvisible)

## Constructors

### constructor

• **new OptionsetField**<`Options`\>(`attributeName`, `option?`)

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

[XrmEx.ts:1198](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1198)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L584)

___

### Option

• **Option**: `Options`

#### Defined in

[XrmEx.ts:1197](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1197)

___

### \_attribute

• `Protected` **\_attribute**: `OptionSetAttribute`<`number`\>

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:1195](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1195)

___

### \_control

• `Protected` **\_control**: `OptionSetControl`

#### Defined in

[XrmEx.ts:1196](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1196)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `OptionSetAttribute`<`number`\>

#### Returns

`OptionSetAttribute`<`number`\>

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:1224](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1224)

___

### Value

• `get` **Value**(): `number`

Gets the value.

#### Returns

`number`

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:1237](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1237)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` \| keyof `Options` |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:1240](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1240)

___

### control

• `get` **control**(): `OptionSetControl`

#### Returns

`OptionSetControl`

#### Defined in

[XrmEx.ts:1232](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1232)

___

### controls

• `get` **controls**(): `ItemCollection`<`OptionSetControl`\>

#### Returns

`ItemCollection`<`OptionSetControl`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:1229](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1229)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L750)

___

### addOption

▸ **addOption**(`values`, `index?`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Adds an option.

**`Remarks`**

This method does not check that the values within the options you add are valid.
         If index is not provided, the new option will be added to the end of the list.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | `number`[] | an array with the option values to add |
| `index?` | `number` | (Optional) zero-based index of the option. |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1253](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1253)

___

### clearOptions

▸ **clearOptions**(): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Clears all options.

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1291](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1291)

___

### fireOnChange

▸ **fireOnChange**(): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Fire all "on change" event handlers.

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.fireOnChange

#### Inherited from

[Field](XrmEx.Field.md).[fireOnChange](XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:737](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L737)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getAttributeType

#### Inherited from

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `OptionSetAttributeFormat`

#### Returns

`OptionSetAttributeFormat`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getFormat

#### Overrides

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:1202](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1202)

___

### getInitialValue

▸ **getInitialValue**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getInitialValue

#### Defined in

[XrmEx.ts:1221](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1221)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L606)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getName

#### Inherited from

[Field](XrmEx.Field.md).[getName](XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:609](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L609)

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

Xrm.Attributes.OptionSetAttribute.getOption

#### Defined in

[XrmEx.ts:1205](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1205)

___

### getOptions

▸ **getOptions**(): `OptionSetValue`[]

#### Returns

`OptionSetValue`[]

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getOptions

#### Defined in

[XrmEx.ts:1212](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1212)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L612)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[getRequiredLevel](XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:615](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L615)

___

### getSelectedOption

▸ **getSelectedOption**(): `OptionSetValue`

#### Returns

`OptionSetValue`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getSelectedOption

#### Defined in

[XrmEx.ts:1215](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1215)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[getSubmitMode](XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:618](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L618)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getText

#### Defined in

[XrmEx.ts:1218](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1218)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getUserPrivilege

#### Inherited from

[Field](XrmEx.Field.md).[getUserPrivilege](XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:621](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L621)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[removeNotification](XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:809](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L809)

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

Xrm.Attributes.OptionSetAttribute.removeOnChange

#### Inherited from

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L624)

___

### removeOption

▸ **removeOption**(`values`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Removes the option matching the value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `number`[] |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1273](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L1273)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setDisabled](XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:699](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L699)

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

Xrm.Attributes.OptionSetAttribute.setIsValid

#### Inherited from

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L633)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

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

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L669)

___

### setRequired

▸ **setRequired**(`required`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.setRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[setRequiredLevel](XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:712](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L712)

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

Xrm.Attributes.OptionSetAttribute.setSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[setSubmitMode](XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:627](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L627)

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

Xrm.Attributes.OptionSetAttribute.setValue

#### Inherited from

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`OptionsetField`](XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/XrmEx/blob/4fe2b76/src/XrmEx.ts#L686)
