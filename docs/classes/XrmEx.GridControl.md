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

[XrmEx.ts:1394](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1394)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:1392](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1392)

___

### \_gridControl

• `Protected` `Optional` **\_gridControl**: `GridControl`

#### Defined in

[XrmEx.ts:1393](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1393)

## Accessors

### Grid

• `get` **Grid**(): `Grid`

#### Returns

`Grid`

#### Defined in

[XrmEx.ts:1404](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1404)

___

### GridControl

• `get` **GridControl**(): `GridControl`

#### Returns

`GridControl`

#### Defined in

[XrmEx.ts:1397](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1397)

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

[XrmEx.ts:1407](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1407)

___

### getContextType

▸ **getContextType**(): `GridControlContext`

#### Returns

`GridControlContext`

#### Implementation of

Xrm.Controls.GridControl.getContextType

#### Defined in

[XrmEx.ts:1410](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1410)

___

### getControlType

▸ **getControlType**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getControlType

#### Defined in

[XrmEx.ts:1443](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1443)

___

### getEntityName

▸ **getEntityName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getEntityName

#### Defined in

[XrmEx.ts:1413](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1413)

___

### getFetchXml

▸ **getFetchXml**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getFetchXml

#### Defined in

[XrmEx.ts:1416](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1416)

___

### getGrid

▸ **getGrid**(): `Grid`

#### Returns

`Grid`

#### Implementation of

Xrm.Controls.GridControl.getGrid

#### Defined in

[XrmEx.ts:1419](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1419)

___

### getLabel

▸ **getLabel**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getLabel

#### Defined in

[XrmEx.ts:1452](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1452)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.GridControl.getName

#### Defined in

[XrmEx.ts:1446](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1446)

___

### getParent

▸ **getParent**(): `Section`

#### Returns

`Section`

#### Implementation of

Xrm.Controls.GridControl.getParent

#### Defined in

[XrmEx.ts:1449](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1449)

___

### getRelationship

▸ **getRelationship**(): `GridRelationship`

#### Returns

`GridRelationship`

#### Implementation of

Xrm.Controls.GridControl.getRelationship

#### Defined in

[XrmEx.ts:1422](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1422)

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

[XrmEx.ts:1425](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1425)

___

### getViewSelector

▸ **getViewSelector**(): `ViewSelector`

#### Returns

`ViewSelector`

#### Implementation of

Xrm.Controls.GridControl.getViewSelector

#### Defined in

[XrmEx.ts:1428](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1428)

___

### getVisible

▸ **getVisible**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Controls.GridControl.getVisible

#### Defined in

[XrmEx.ts:1458](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1458)

___

### openRelatedGrid

▸ **openRelatedGrid**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.openRelatedGrid

#### Defined in

[XrmEx.ts:1431](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1431)

___

### refresh

▸ **refresh**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.refresh

#### Defined in

[XrmEx.ts:1434](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1434)

___

### refreshRibbon

▸ **refreshRibbon**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.GridControl.refreshRibbon

#### Defined in

[XrmEx.ts:1437](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1437)

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

[XrmEx.ts:1440](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1440)

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

[XrmEx.ts:1455](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1455)

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

[XrmEx.ts:1461](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L1461)
