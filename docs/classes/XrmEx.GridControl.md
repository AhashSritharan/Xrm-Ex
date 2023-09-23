[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / GridControl

# Class: GridControl

[XrmEx](../modules/XrmEx.md).GridControl

## Implements

- `GridControl`

## Table of contents

### Constructors

- [constructor](XrmEx.GridControl.md#constructor)

### Properties

- [Name](XrmEx.GridControl.md#name)
- [\_gridControl](XrmEx.GridControl.md#_gridcontrol)

### Accessors

- [Grid](XrmEx.GridControl.md#grid)
- [GridControl](XrmEx.GridControl.md#gridcontrol)

### Methods

- [addOnLoad](XrmEx.GridControl.md#addonload)
- [getContextType](XrmEx.GridControl.md#getcontexttype)
- [getControlType](XrmEx.GridControl.md#getcontroltype)
- [getEntityName](XrmEx.GridControl.md#getentityname)
- [getFetchXml](XrmEx.GridControl.md#getfetchxml)
- [getGrid](XrmEx.GridControl.md#getgrid)
- [getLabel](XrmEx.GridControl.md#getlabel)
- [getName](XrmEx.GridControl.md#getname)
- [getParent](XrmEx.GridControl.md#getparent)
- [getRelationship](XrmEx.GridControl.md#getrelationship)
- [getUrl](XrmEx.GridControl.md#geturl)
- [getViewSelector](XrmEx.GridControl.md#getviewselector)
- [getVisible](XrmEx.GridControl.md#getvisible)
- [openRelatedGrid](XrmEx.GridControl.md#openrelatedgrid)
- [refresh](XrmEx.GridControl.md#refresh)
- [refreshRibbon](XrmEx.GridControl.md#refreshribbon)
- [removeOnLoad](XrmEx.GridControl.md#removeonload)
- [setLabel](XrmEx.GridControl.md#setlabel)
- [setVisible](XrmEx.GridControl.md#setvisible)

## Constructors

### constructor

• **new GridControl**(`name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Defined in

[XrmEx.ts:1392](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1392)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:1390](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1390)

___

### \_gridControl

• `Protected` `Optional` **\_gridControl**: `GridControl`

#### Defined in

[XrmEx.ts:1391](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1391)

## Accessors

### Grid

• `get` **Grid**(): `Grid`

#### Returns

`Grid`

#### Defined in

[XrmEx.ts:1402](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1402)

___

### GridControl

• `get` **GridControl**(): `GridControl`

#### Returns

`GridControl`

#### Defined in

[XrmEx.ts:1395](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1395)

## Methods

### addOnLoad

▸ **addOnLoad**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `LoadEventHandler` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.addOnLoad

#### Defined in

[XrmEx.ts:1405](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1405)

___

### getContextType

▸ **getContextType**(): `GridControlContext`

#### Returns

`GridControlContext`

#### Implementation of

Xrm.Controls.GridControl.getContextType

#### Defined in

[XrmEx.ts:1408](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1408)

___

### getControlType

▸ **getControlType**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getControlType

#### Defined in

[XrmEx.ts:1441](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1441)

___

### getEntityName

▸ **getEntityName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getEntityName

#### Defined in

[XrmEx.ts:1411](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1411)

___

### getFetchXml

▸ **getFetchXml**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getFetchXml

#### Defined in

[XrmEx.ts:1414](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1414)

___

### getGrid

▸ **getGrid**(): `Grid`

#### Returns

`Grid`

#### Implementation of

Xrm.Controls.GridControl.getGrid

#### Defined in

[XrmEx.ts:1417](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1417)

___

### getLabel

▸ **getLabel**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getLabel

#### Defined in

[XrmEx.ts:1450](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1450)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getName

#### Defined in

[XrmEx.ts:1444](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1444)

___

### getParent

▸ **getParent**(): `Section`

#### Returns

`Section`

#### Implementation of

Xrm.Controls.GridControl.getParent

#### Defined in

[XrmEx.ts:1447](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1447)

___

### getRelationship

▸ **getRelationship**(): `GridRelationship`

#### Returns

`GridRelationship`

#### Implementation of

Xrm.Controls.GridControl.getRelationship

#### Defined in

[XrmEx.ts:1420](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1420)

___

### getUrl

▸ **getUrl**(`client?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `client?` | `GridClient` |

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getUrl

#### Defined in

[XrmEx.ts:1423](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1423)

___

### getViewSelector

▸ **getViewSelector**(): `ViewSelector`

#### Returns

`ViewSelector`

#### Implementation of

Xrm.Controls.GridControl.getViewSelector

#### Defined in

[XrmEx.ts:1426](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1426)

___

### getVisible

▸ **getVisible**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Controls.GridControl.getVisible

#### Defined in

[XrmEx.ts:1456](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1456)

___

### openRelatedGrid

▸ **openRelatedGrid**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.openRelatedGrid

#### Defined in

[XrmEx.ts:1429](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1429)

___

### refresh

▸ **refresh**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.refresh

#### Defined in

[XrmEx.ts:1432](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1432)

___

### refreshRibbon

▸ **refreshRibbon**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.refreshRibbon

#### Defined in

[XrmEx.ts:1435](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1435)

___

### removeOnLoad

▸ **removeOnLoad**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | () => `void` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.removeOnLoad

#### Defined in

[XrmEx.ts:1438](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1438)

___

### setLabel

▸ **setLabel**(`label`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `label` | `string` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.setLabel

#### Defined in

[XrmEx.ts:1453](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1453)

___

### setVisible

▸ **setVisible**(`visible`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.setVisible

#### Defined in

[XrmEx.ts:1459](https://github.com/AhashSritharan/Xrm-Ex/blob/2a657a6/src/XrmEx.ts#L1459)
