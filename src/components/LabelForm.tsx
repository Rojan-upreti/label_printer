import React, { useState } from 'react';
import { POItem, PurchaseOrder } from '../types';
import productData from '../../product.json';
import {
  parseBulkText,
  validateBulkItem,
  type ProductRecord,
} from '../utils/bulkItems';

const products = productData as ProductRecord[];

const emptyItem = (): POItem => ({
  itemNumber: '',
  itemName: '',
  upc: '',
  quantity: 0,
  casePack: 0,
  sku: '',
  mfgStyle: '',
  countryOfOrigin: 'India',
});

const itemFromProduct = (
  product: ProductRecord,
  quantity: number,
  countryOfOrigin: string
): POItem => ({
  itemNumber: product['Item Code'],
  itemName: product['Item Name'],
  upc: product.UPC,
  quantity,
  casePack: product['Case Pack'],
  sku: product['Item Code'],
  mfgStyle: product['TJX Style #'],
  countryOfOrigin,
});

interface LabelFormProps {
  onSubmit: (po: PurchaseOrder) => void;
}

const LabelForm: React.FC<LabelFormProps> = ({ onSubmit }) => {
  const [poData, setPOData] = useState<PurchaseOrder>({
    customerPO: '',
    fromLocation: 'Jodhpuri USA, Edison NJ, USA',
    toLocation: '',
    items: []
  });

  // Available locations for dropdown
  const availableLocations = [
    '#881 – 401 Westmont Dr, San Pedro, CA 90731',
    '#882 – 6803 South Palo Verde Rd, Tucson, AZ 85756',
    '#883 – 50 Bryla Street, Carteret, NJ 07008',
    '#884 – 125 Logistics Center Pkwy, Jefferson, GA 30549',
    '#885 – 1415 Blue Hill Ave, Bloomfield, CT 06002',
    '#886 – 2900 Ellsworth Bailey Rd, Lordstown, OH 44481',
    '#887 – 850 Northfield Dr, Brownsburg, IN 46112',
    '#890 – 8201 Oak Grove Road, Fort Worth, TX 76140'
  ];

  const [itemAddMode, setItemAddMode] = useState<'single' | 'bulk'>('single');
  const [bulkText, setBulkText] = useState('');
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<POItem>(emptyItem());

  // Handle item selection from dropdown
  const handleItemSelection = (itemCode: string) => {
    if (!itemCode) {
      // Reset form if no item is selected
      setCurrentItem(prev => ({
        ...prev,
        itemNumber: '',
        sku: '',
        upc: '',
        mfgStyle: '',
        casePack: 0,
        itemName: ''
      }));
      return;
    }
    
    const selectedProduct = products.find((product) => product['Item Code'] === itemCode);
    
    if (selectedProduct) {
      setCurrentItem(prev => ({
        ...prev,
        itemNumber: selectedProduct["Item Code"],
        sku: selectedProduct["Item Code"], // Item Code is the SKU
        upc: selectedProduct["UPC"],
        mfgStyle: selectedProduct["TJX Style #"],
        casePack: selectedProduct["Case Pack"],
        itemName: selectedProduct["Item Name"] // Use the actual item name from the product data
      }));
    }
  };

  const handlePOChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPOData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'casePack' ? parseInt(value) || 0 : value
    }));
  };

  const addItem = () => {
    if (!currentItem.itemNumber || !currentItem.upc || 
        currentItem.quantity <= 0 || currentItem.casePack <= 0 || 
        !currentItem.sku || !currentItem.mfgStyle) {
      alert('Please select an item and enter a valid quantity');
      return;
    }

    if (currentItem.quantity < currentItem.casePack) {
      alert('Quantity must be greater than or equal to case pack');
      return;
    }

    setPOData(prev => ({
      ...prev,
      items: [...prev.items, currentItem]
    }));

    setCurrentItem(emptyItem());
  };

  const addBulkItems = () => {
    const { parsed, errors: parseErrors } = parseBulkText(bulkText);
    const validationErrors: string[] = [...parseErrors];
    const newItems: POItem[] = [];

    parsed.forEach((row) => {
      const err = validateBulkItem(row.itemCode, row.quantity, products);
      if (err) {
        validationErrors.push(err);
        return;
      }
      const product = products.find((p) => p['Item Code'] === row.itemCode)!;
      newItems.push(
        itemFromProduct(product, row.quantity, currentItem.countryOfOrigin)
      );
    });

    if (validationErrors.length > 0) {
      setBulkErrors(validationErrors);
      return;
    }

    if (newItems.length === 0) {
      setBulkErrors(['Enter at least one line (item number and quantity).']);
      return;
    }

    setPOData((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
    setBulkText('');
    setBulkErrors([]);
  };

  const removeItem = (index: number) => {
    setPOData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    
    if (!poData.customerPO || !poData.fromLocation || !poData.toLocation) {
      alert('Please fill in all PO fields');
      return;
    }

    if (poData.items.length === 0) {
      alert('Please add at least one item to the list before generating labels');
      return;
    }

    onSubmit(poData);
    
    // Reset form
    setPOData({
      customerPO: '',
      fromLocation: 'Jodhpuri USA, Edison NJ, USA',
      toLocation: '',
      items: []
    });
  };

  const totalLabels = poData.items.reduce((total, item) => {
    return total + Math.ceil(item.quantity / item.casePack);
  }, 0);

  return (
    <div className="form-container">
      <h2>Purchase Order Label Generator</h2>
      <form onSubmit={handleSubmit}>
        {/* PO Information */}
        <div className="po-section">
          <h3>Purchase Order Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerPO">Customer PO Number *</label>
              <input
                type="text"
                id="customerPO"
                name="customerPO"
                value={poData.customerPO}
                onChange={handlePOChange}
                placeholder="Enter PO number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fromLocation">From Location *</label>
              <input
                type="text"
                id="fromLocation"
                name="fromLocation"
                value={poData.fromLocation}
                onChange={handlePOChange}
                placeholder="e.g., Warehouse A"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="toLocation">To Location *</label>
              <select
                id="toLocation"
                name="toLocation"
                value={poData.toLocation}
                onChange={handlePOChange}
                required
              >
                <option value="">Select a location...</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add Item Section */}
        <div className="item-section">
          <h3>Add New Item to List</h3>
          <div className="add-mode-toggle">
            <button
              type="button"
              className={`btn-mode ${itemAddMode === 'single' ? 'active' : ''}`}
              onClick={() => {
                setItemAddMode('single');
                setBulkErrors([]);
              }}
            >
              Single item
            </button>
            <button
              type="button"
              className={`btn-mode ${itemAddMode === 'bulk' ? 'active' : ''}`}
              onClick={() => {
                setItemAddMode('bulk');
                setBulkErrors([]);
              }}
            >
              Bulk add
            </button>
          </div>

          {itemAddMode === 'single' ? (
            <>
          <p className="section-description">Select an item, enter quantity, and click Add Item.</p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="itemNumber">Item Number *</label>
              <select
                id="itemNumber"
                name="itemNumber"
                value={currentItem.itemNumber}
                onChange={(e) => handleItemSelection(e.target.value)}
              >
                <option value="">Select an item...</option>
                {products.map((product) => (
                  <option key={product['Item Code']} value={product['Item Code']}>
                    {product['Item Code']}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="itemName">Item Name *</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={currentItem.itemName}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="upc">UPC *</label>
              <input
                type="text"
                id="upc"
                name="upc"
                value={currentItem.upc}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={currentItem.sku}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mfgStyle">TJX Style *</label>
              <input
                type="text"
                id="mfgStyle"
                name="mfgStyle"
                value={currentItem.mfgStyle}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Total Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleItemChange}
                placeholder="e.g., 100"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="casePack">Case Pack *</label>
              <input
                type="number"
                id="casePack"
                name="casePack"
                value={currentItem.casePack}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="countryOfOrigin">Country of Origin</label>
              <input
                type="text"
                id="countryOfOrigin"
                name="countryOfOrigin"
                value={currentItem.countryOfOrigin}
                onChange={handleItemChange}
                placeholder="e.g., India"
              />
            </div>
          </div>

          <button type="button" onClick={addItem} className="btn btn-secondary">
            Add Item
          </button>
            </>
          ) : (
            <>
              <p className="section-description">
                Paste one item per line. Any item in the product list (same as the dropdown) works —
                use <code>item quantity</code> (e.g. <code>73218 120</code>) or paste full shipment rows.
              </p>
              <div className="form-group bulk-input-group">
                <label htmlFor="bulkItems">Items (one per line)</label>
                <textarea
                  id="bulkItems"
                  className="bulk-textarea"
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setBulkErrors([]);
                  }}
                  placeholder={`73218 120\n50001 72\n73218 EA Coaster Grey Marble Square 4 piece 168 12 14`}
                  rows={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bulkCountryOfOrigin">Country of Origin (all bulk items)</label>
                <input
                  type="text"
                  id="bulkCountryOfOrigin"
                  name="countryOfOrigin"
                  value={currentItem.countryOfOrigin}
                  onChange={handleItemChange}
                  placeholder="e.g., India"
                />
              </div>
              {bulkErrors.length > 0 && (
                <ul className="bulk-errors">
                  {bulkErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={addBulkItems} className="btn btn-secondary">
                Add All Items
              </button>
            </>
          )}
        </div>

        {/* Items List */}
        {poData.items.length > 0 && (
          <div className="items-list">
            <h3>Added Items ({poData.items.length})</h3>
            <div className="items-grid">
              {poData.items.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <strong>{item.itemName}</strong>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="btn-remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="item-details">
                    <div><strong>SKU:</strong> {item.sku}</div>
                    <div><strong>Quantity:</strong> {item.quantity}</div>
                    <div><strong>Case Pack:</strong> {item.casePack}</div>
                    <div><strong>Labels:</strong> {Math.ceil(item.quantity / item.casePack)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {totalLabels > 0 && (
          <div className="summary">
            <h3>PO Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Total Items:</strong>
                <span>{poData.items.length}</span>
              </div>
              <div className="summary-item">
                <strong>Total Labels:</strong>
                <span>{totalLabels}</span>
              </div>
              <div className="summary-item">
                <strong>PO Number:</strong>
                <span>{poData.customerPO}</span>
              </div>
              <div className="summary-item">
                <strong>From:</strong>
                <span>{poData.fromLocation}</span>
              </div>
              <div className="summary-item">
                <strong>To:</strong>
                <span>{poData.toLocation}</span>
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={poData.items.length === 0}>
          Generate All Labels
        </button>
      </form>
    </div>
  );
};

export default LabelForm;