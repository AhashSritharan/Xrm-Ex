[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / OptionsetField

# Class: OptionsetField<Options\>

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).OptionsetField

Used to execute methods related to a single Attribute

## Type parameters

| Name | Type |
| :------ | :------ |
| `Options` | extends `OptionValues` |

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`OptionsetField`**

## Implements

- `OptionSetAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#name)
- [Option](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#option)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#_attribute)
- [\_control](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#_control)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#value)
- [control](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#control)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#addonchange)
- [addOption](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#addoption)
- [clearOptions](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#clearoptions)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getformat)
- [getInitialValue](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getinitialvalue)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getisdirty)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getname)
- [getOption](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getoption)
- [getOptions](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getoptions)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getrequiredlevel)
- [getSelectedOption](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getselectedoption)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getsubmitmode)
- [getText](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#gettext)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#removeonchange)
- [removeOption](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#removeoption)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md#setvisible)

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

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:1200](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1200)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### Option

• **Option**: `Options`

#### Defined in

[XrmEx.ts:1199](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1199)

___

### \_attribute

• `Protected` **\_attribute**: `OptionSetAttribute`<`number`\>

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:1197](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1197)

___

### \_control

• `Protected` **\_control**: `OptionSetControl`

#### Defined in

[XrmEx.ts:1198](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1198)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `OptionSetAttribute`<`number`\>

#### Returns

`OptionSetAttribute`<`number`\>

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:1226](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1226)

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

[XrmEx.ts:1239](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1239)

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

[XrmEx.ts:1242](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1242)

___

### control

• `get` **control**(): `OptionSetControl`

#### Returns

`OptionSetControl`

#### Defined in

[XrmEx.ts:1234](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1234)

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

[XrmEx.ts:1231](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1231)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### addOption

▸ **addOption**(`values`, `index?`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

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

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1255](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1255)

___

### clearOptions

▸ **clearOptions**(): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Clears all options.

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1293](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1293)

___

### fireOnChange

▸ **fireOnChange**(): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Fire all "on change" event handlers.

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.fireOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:739](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L739)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getAttributeType

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `OptionSetAttributeFormat`

#### Returns

`OptionSetAttributeFormat`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getFormat

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:1204](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1204)

___

### getInitialValue

▸ **getInitialValue**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getInitialValue

#### Defined in

[XrmEx.ts:1223](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1223)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getIsDirty

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getName

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getName](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:611](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L611)

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

[XrmEx.ts:1207](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1207)

___

### getOptions

▸ **getOptions**(): `OptionSetValue`[]

#### Returns

`OptionSetValue`[]

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getOptions

#### Defined in

[XrmEx.ts:1214](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1214)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getParent

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getParent](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:614](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L614)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getRequiredLevel

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:617](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L617)

___

### getSelectedOption

▸ **getSelectedOption**(): `OptionSetValue`

#### Returns

`OptionSetValue`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getSelectedOption

#### Defined in

[XrmEx.ts:1217](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1217)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getSubmitMode

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:620](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L620)

___

### getText

▸ **getText**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getText

#### Defined in

[XrmEx.ts:1220](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1220)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getUserPrivilege

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:623](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L623)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.OptionSetAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:811](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L811)

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

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### removeOption

▸ **removeOption**(`values`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Removes the option matching the value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `number`[] |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Defined in

[XrmEx.ts:1275](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1275)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setDisabled](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:701](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L701)

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

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

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

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Implementation of

Xrm.Attributes.OptionSetAttribute.setRequiredLevel

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:714](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L714)

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

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:629](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L629)

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

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)<`Options`\>

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
