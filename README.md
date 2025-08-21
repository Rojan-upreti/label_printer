# Label Printer Webapp

A modern web application for generating and printing labels for inventory items. The app allows users to add items with their details, calculate the required number of labels based on quantity and case pack, and generate formatted labels for printing or downloading as PDF.

## Features

- **Product Data Integration**: Auto-fill item details from product database (UPC, TJX Style #, Case Pack)
- **Item Management**: Add items with item number, name, UPC, quantity, case pack, customer PO, and shipping details
- **Automatic Label Calculation**: System calculates required labels (quantity ÷ case pack)
- **Label Formatting**: Labels display "{number} out of {total}; label{label_number}" format
- **Print & Download**: Print labels directly or download as PDF
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Preview**: See label summary before generating

## Example Usage

For an item with:
- Item Number: 10001
- Quantity: 100
- Case Pack: 10

The system will generate 10 labels (100 ÷ 10 = 10) with the format:
- "1 out of 10; label1"
- "2 out of 10; label2"
- ...
- "10 out of 10; label10"

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **Add Item Details**: 
   - **Select Item Number**: Choose from the dropdown menu to auto-fill UPC, TJX Style #, and Case Pack
   - **Enter Quantity**: Specify the total quantity needed
   - **Fill PO Information**: Enter Customer PO Number, From Location, and To Location

2. **Generate Labels**: Click "Generate Labels" to create the required number of labels

3. **Print or Download**: Use the "Print Labels" or "Download PDF" buttons

## Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **CSS Grid & Flexbox** - Modern responsive layout

## File Structure

```
src/
├── components/
│   ├── LabelForm.tsx      # Form for adding items
│   └── LabelDisplay.tsx   # Display generated labels
├── utils/
│   └── labelGenerator.ts  # Label generation and PDF utilities
├── types.ts               # TypeScript type definitions
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
product.json              # Product database with Item Code, UPC, TJX Style #, Case Pack
```

## Features in Detail

### Label Generation
- Automatically calculates total labels needed
- Validates input data (quantity ≥ case pack)
- Generates unique IDs for each label
- Formats labels with proper numbering

### PDF Export
- Creates professional PDF layout
- Multiple labels per page
- Proper page breaks
- Timestamped filenames

### Print Support
- Browser print functionality
- Print-specific CSS styling
- Clean layout for physical printing

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Development

The application uses Vite for fast development with hot module replacement. The TypeScript configuration ensures type safety throughout the codebase.

## License

MIT License - feel free to use and modify as needed. 