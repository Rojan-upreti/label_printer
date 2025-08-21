export interface LabelItem {
  itemNumber: string;
  itemName: string;
  upc: string;
  quantity: number;
  casePack: number;
  customerPO: string;
  fromLocation: string;
  toLocation: string;
  sku: string;
  mfgStyle: string;
  carton: string;
  countryOfOrigin: string;
}

export interface Label {
  id: string;
  itemNumber: string;
  itemName: string;
  upc: string;
  labelNumber: number;
  totalLabels: number;
  customerPO: string;
  fromLocation: string;
  toLocation: string;
  casePack: number;
  sku: string;
  mfgStyle: string;
  carton: string;
  countryOfOrigin: string;
}

export interface LabelSummary {
  totalLabels: number;
  itemNumber: string;
  itemName: string;
  quantity: number;
  casePack: number;
  customerPO: string;
  fromLocation: string;
  toLocation: string;
  sku: string;
  mfgStyle: string;
  carton: string;
  countryOfOrigin: string;
}

export interface POItem {
  itemNumber: string;
  itemName: string;
  upc: string;
  quantity: number;
  casePack: number;
  sku: string;
  mfgStyle: string;
  countryOfOrigin: string;
}

export interface PurchaseOrder {
  customerPO: string;
  fromLocation: string;
  toLocation: string;
  items: POItem[];
} 