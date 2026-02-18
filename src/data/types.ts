// ============ ENUMS ============

export type LoyaltyTier = "New" | "Returning" | "VIP" | "Ambassador"

export type OrderStatus =
  | "Order Received"
  | "Pattern Drafting"
  | "Cutting"
  | "Sewing"
  | "Finishing"
  | "QC"
  | "Shipped"

export type OrderChannel =
  | "DTC Web"
  | "DTC Store"
  | "B2B Tom James"
  | "B2B Other"
  | "Trunk Show"

export type MeasurementSource =
  | "Bold Metrics AI"
  | "In-Store"
  | "Tom James Rep"
  | "Trunk Show"
  | "Self-Measured"

export type ProductCategory = "Pants" | "Jacket" | "Belt" | "Accessory"

export type FabricFamily =
  | "Raw Denim"
  | "Cotton Chino"
  | "Performance"
  | "Cashiers Collection"

export type RollStatus = "Active" | "Low" | "Depleted" | "Quarantine"

export type HardwareType = "Zipper" | "Main Button" | "Rivet" | "Snap" | "Buckle"

export type ShipmentStatus =
  | "Label Created"
  | "Picked Up"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"

export type ContactMethod = "Phone" | "Email" | "SMS" | "In-Person"

export type PurchasePreference = "Online" | "In-Store" | "Phone"

// ============ CUSTOMER DOMAIN ============

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  nickname: string | null
  email: string
  phone: string
  landLine: string | null
  dateOfBirth: string | null
  age: number | null
  height: string | null
  weight: string | null
  shippingAddress: Address
  billingAddress: Address | null
  otherAddresses: Address[]
  company: string | null
  spouseName: string | null
  spouseAccountId: string | null
  socialMediaHandles: string | null
  mexicoShippingTaxId: string | null
  howHeardAboutUs: string
  referralSource: string | null
  preferredPurchase: PurchasePreference
  preferredContact: ContactMethod
  lastContactMethod: string
  lastContactDate: string
  favoriteColor: string | null
  climate: string | null
  normalPantsType: string | null
  loyaltyTier: LoyaltyTier
  rewardPoints: number
  totalSpent: number
  totalOrders: number
  averageOrderSpent: number
  averageProductSpent: number
  lastOrderDate: string
  channel: OrderChannel
  isWhiteGlove: boolean
  hasFitConfirmation: boolean
  hasEmptyMeasurements: boolean
  profileNote: string | null
  callNotes: string | null
  ordersReturned: number
  itemsAltered: number
  activeAlterations: number
  createdAt: string
}

export interface MeasurementProfile {
  id: string
  customerId: string
  dateTaken: string
  source: MeasurementSource
  isActive: boolean
  fittedBy: string | null
  waist: number
  seat: number
  thigh: number
  knee: number
  inseam: number
  outseam: number
  riseFront: number
  riseBack: number
  hip: number
  legOpening: number
  calf: number | null
  ankle: number | null
  jacketSize: string | null
  shoeSize: string | null
  beltSize: string | null
  beltMeasureMethod: string | null
  fit: string | null
  heelHeight: string | null
  splitBeltLoops: boolean
  backPocketPlacement: string | null
  frontPocketStyle: string | null
  pocketBagDepth: string | null
  lastMonogram: string | null
  monogramStyle: string | null
  lastThreadColor: string | null
  measurementNote: string | null
  fitNote: string | null
  alterationNotes: string | null
}

// ============ PRODUCT & INVENTORY DOMAIN ============

export interface Product {
  id: string
  name: string
  category: ProductCategory
  basePrice: number
  description: string
  fabricFamily: FabricFamily
  isActive: boolean
  customizationOptions: string[]
}

export interface FabricRoll {
  id: string
  materialName: string
  fabricFamily: FabricFamily
  color: string
  weightOz: number
  composition: string
  supplier: string
  batchDyeLot: string
  widthInches: number
  shrinkageWarpPct: number
  shrinkageWeftPct: number
  initialYards: number
  currentYards: number
  reorderPointYards: number
  costPerYard: number
  location: string
  status: RollStatus
  receivedDate: string
  notes: string | null
}

export interface HardwareItem {
  id: string
  name: string
  type: HardwareType
  variant: string
  supplier: string
  currentStock: number
  reorderPoint: number
  costPerUnit: number
  bomQuantityPerJean: number
  location: string
  status: "In Stock" | "Low" | "Out of Stock"
}

// ============ ORDER & PRODUCTION DOMAIN ============

export interface PipelineStage {
  stage: OrderStatus
  enteredAt: string
  exitedAt: string | null
  artisan: string | null
  notes: string | null
}

export interface Order {
  id: string
  customerId: string
  measurementProfileId: string
  channel: OrderChannel
  status: OrderStatus
  productId: string
  fabricRollId: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  yardageUsed: number | null
  threadColor: string
  monogram: string | null
  monogramStyle: string | null
  pocketStyle: string
  hardware: string
  assignedArtisan: string | null
  pipelineStages: PipelineStage[]
  partnerId: string | null
  partnerRepId: string | null
  partnerOrderRef: string | null
  brandingPackId: string | null
  orderDate: string
  promisedDate: string
  completedDate: string | null
  shipmentId: string | null
  orderNote: string | null
  giftNote: string | null
  giftRecipient: string | null
  giftSender: string | null
}

// ============ SHIPPING DOMAIN ============

export interface ShipmentStage {
  status: ShipmentStatus
  timestamp: string
  location: string
}

export interface Shipment {
  id: string
  orderId: string
  customerId: string
  carrier: string
  trackingNumber: string
  status: ShipmentStatus
  shippedDate: string
  estimatedDelivery: string
  actualDelivery: string | null
  shippingAddress: Address
  weight: string
  cost: number
  stages: ShipmentStage[]
}

// ============ B2B PARTNER DOMAIN ============

export interface Partner {
  id: string
  name: string
  type: "Clothier" | "Corporate" | "Retailer"
  contactEmail: string
  contactPhone: string
  address: Address
  totalOrders: number
  totalRevenue: number
  activeOrders: number
  accountSince: string
  paymentTerms: string
  notes: string | null
}

export interface PartnerRep {
  id: string
  partnerId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  territory: string
  totalOrders: number
  totalRevenue: number
  averageReturnRate: number
}

// ============ ANALYTICS / TIME SERIES ============

export interface MonthlyMetrics {
  month: string
  revenue: number
  orderCount: number
  newCustomers: number
  dtcWebOrders: number
  dtcStoreOrders: number
  b2bOrders: number
  trunkShowOrders: number
  averageLeadTimeDays: number
  onTimeDeliveryRate: number
  fabricYardsConsumed: number
  fabricYardsReceived: number
}
