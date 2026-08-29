// Note: Supplier & Purchase Order tables are stubs for now (migrations needed for schema layout)
export class SupplierRepository {
  static async getSuppliers() {
    return [
      {
        id: "sup-1",
        name: "Global Tech Distributors",
        contact_name: "John Doe",
        email: "john@globaltech.com",
        phone: "+254711111111",
        address: "Mombasa Road, Nairobi",
        status: "active" as const,
        created_at: new Date().toISOString(),
      },
      {
        id: "sup-2",
        name: "Apparel Outfitters Ltd",
        contact_name: "Jane Smith",
        email: "jane@outfitters.com",
        phone: "+254722222222",
        address: "Industrial Area, Nairobi",
        status: "active" as const,
        created_at: new Date().toISOString(),
      },
    ];
  }

  static async getPurchaseOrders() {
    return [
      {
        id: "po-1",
        po_number: "PO-20260707-1001",
        supplier_id: "sup-1",
        status: "confirmed" as const,
        total_amount: 150000,
        expected_delivery: new Date().toISOString(),
        notes: "Restocking electronics",
        created_at: new Date().toISOString(),
      },
    ];
  }
}
