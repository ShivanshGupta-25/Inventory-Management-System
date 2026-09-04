export const salesData = [
  {
    id: 1,
    saleId: "SO-2084",
    customer: "ABC Technologies",
    customerEmail: "orders@abctech.com",
    customerPhone: "+91 98765 43210",
    date: "Today, 09:30 AM",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "Completed",
    items: [
      {
        productId: 1,
        product: "Wireless Mouse",
        sku: "WM-4102",
        quantity: 4,
        price: 1299,
      },
      {
        productId: 2,
        product: "Mechanical Keyboard",
        sku: "MK-2084",
        quantity: 2,
        price: 3499,
      },
    ],
  },

  {
    id: 2,
    saleId: "SO-2083",
    customer: "Vertex Solutions",
    customerEmail: "purchase@vertex.com",
    customerPhone: "+91 98220 11445",
    date: "Today, 08:15 AM",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    status: "Completed",
    items: [
      {
        productId: 3,
        product: "USB-C Hub",
        sku: "USB-2081",
        quantity: 2,
        price: 1899,
      },
      {
        productId: 7,
        product: "Webcam HD",
        sku: "WC-7021",
        quantity: 1,
        price: 2999,
      },
    ],
  },

  {
    id: 3,
    saleId: "SO-2082",
    customer: "Nova Retail",
    customerEmail: "accounts@novaretail.com",
    customerPhone: "+91 97654 23110",
    date: "Yesterday, 04:30 PM",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    status: "Pending",
    items: [
      {
        productId: 4,
        product: "Laptop Stand",
        sku: "LS-3014",
        quantity: 3,
        price: 2299,
      },
    ],
  },

  {
    id: 4,
    saleId: "SO-2081",
    customer: "Digital Edge",
    customerEmail: "sales@digitaledge.com",
    customerPhone: "+91 99887 66554",
    date: "Yesterday, 01:20 PM",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Paid",
    status: "Completed",
    items: [
      {
        productId: 6,
        product: "Laptop Backpack",
        sku: "LB-6018",
        quantity: 5,
        price: 2599,
      },
      {
        productId: 8,
        product: "Wireless Headset",
        sku: "WH-8044",
        quantity: 2,
        price: 4499,
      },
    ],
  },

  {
    id: 5,
    saleId: "SO-2080",
    customer: "TechNova Pvt Ltd",
    customerEmail: "procurement@technova.com",
    customerPhone: "+91 98111 22445",
    date: "Aug 31, 03:45 PM",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    status: "Completed",
    items: [
      {
        productId: 7,
        product: "Webcam HD",
        sku: "WC-7021",
        quantity: 4,
        price: 2999,
      },
    ],
  },

  {
    id: 6,
    saleId: "SO-2079",
    customer: "Smart Office",
    customerEmail: "orders@smartoffice.com",
    customerPhone: "+91 98989 11223",
    date: "Aug 30, 11:40 AM",
    paymentMethod: "UPI",
    paymentStatus: "Refunded",
    status: "Cancelled",
    items: [
      {
        productId: 5,
        product: "HDMI Cable",
        sku: "HD-5102",
        quantity: 6,
        price: 799,
      },
    ],
  },
];

export const saleStatuses = [
  "All Status",
  "Completed",
  "Pending",
  "Cancelled",
];

export const paymentStatuses = [
  "All Payments",
  "Paid",
  "Pending",
  "Refunded",
];

export const calculateSaleTotal = (sale) => {
  return sale.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
};