# Trapo Admin Panel

A complete admin dashboard for managing orders and products integrated with your Express.js backend.

## Features

- **Admin Authentication**: Secure login with hardcoded credentials
- **Dashboard**: Real-time metrics including revenue, orders, customers, and pending orders
- **Order Management**: View all orders, filter by status, and update order status (Pending → Shipped → Completed)
- **Product Management**: Add, edit, and remove products from inventory
- **Real-time Updates**: Dashboard auto-refreshes every 20-60 seconds
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- Node.js 16+
- Express.js backend running on `http://localhost:5000`
- MongoDB database connected to your backend

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env.local` file with:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000/login](http://localhost:3000/login)

## Admin Credentials

- **Username**: `akilhan13`
- **Password**: `Oqillion1305`

## API Integration

The admin panel connects to your Express backend with these endpoints:

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Order Status Management

1. Go to **Orders** page
2. Click **Update Status** button on any order
3. Select new status:
   - **Pending**: New order received
   - **Shipped**: Order has been shipped
   - **Completed**: Order delivered to customer

## Product Management

1. Go to **Products** page
2. Click **Add Product** button
3. Fill in product details (name, category, price, stock)
4. Click **Create Product**

To delete a product, click the trash icon in the products table.

## Dashboard Metrics

- **Total Revenue**: Sum of all order amounts
- **Total Orders**: Count of all orders
- **Customers**: Unique customer count
- **Pending Orders**: Orders awaiting shipment

## Auto-Refresh Intervals

- Dashboard Overview: 30 seconds
- Recent Orders: 20 seconds
- Sales Chart: 60 seconds

## Troubleshooting

### "Failed to load orders" error
- Ensure your Express backend is running on `http://localhost:5000`
- Check that MongoDB is connected
- Verify API endpoints are working with Postman

### Orders not appearing
- Make sure orders exist in your MongoDB database
- Check browser console for API errors
- Verify `NEXT_PUBLIC_API_URL` is correct

### Status update not working
- Ensure backend has the `PUT /api/orders/:id` endpoint
- Check that the order ID is valid
- Verify authentication token is being sent

## File Structure

\`\`\`
app/
├── login/page.tsx              # Admin login page
├── admin/
│   ├── layout.tsx              # Admin layout with protection
│   ├── page.tsx                # Dashboard
│   ├── orders/page.tsx         # Orders management
│   ├── products/page.tsx       # Products management
│   └── settings/page.tsx       # Settings page
components/admin/
├── sidebar.tsx                 # Navigation sidebar
├── header.tsx                  # Admin header
├── protected-route.tsx         # Route protection wrapper
├── dashboard-overview.tsx      # Metrics cards
├── recent-orders.tsx           # Recent orders widget
├── sales-chart.tsx             # Sales chart
├── orders-table.tsx            # Orders table
├── order-status-dropdown.tsx   # Status update dropdown
├── products-table.tsx          # Products table
└── product-form.tsx            # Product creation form
lib/
├── admin-auth.ts               # Authentication utilities
└── api-client.ts               # API client for backend
\`\`\`

## Next Steps

1. Deploy your Express backend to production
2. Update `NEXT_PUBLIC_API_URL` in production environment
3. Set up SSL/HTTPS for secure communication
4. Consider adding more admin features like user management, analytics, etc.
