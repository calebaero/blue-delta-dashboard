import type { Tables } from "./database.types"
import type {
  Customer,
  MeasurementProfile,
  Product,
  FabricRoll,
  HardwareItem,
  Order,
  PipelineStage,
  Shipment,
  ShipmentStage,
  Partner,
  PartnerRep,
  MonthlyMetrics,
  Address,
  OrderStatus,
  OrderChannel,
  LoyaltyTier,
  MeasurementSource,
  ProductCategory,
  FabricFamily,
  RollStatus,
  HardwareType,
  ShipmentStatus,
  ContactMethod,
  PurchasePreference,
} from "@/data/types"
import type { Json } from "./database.types"

function toAddress(json: Json): Address {
  const obj = json as Record<string, string>
  return {
    street: obj.street ?? "",
    city: obj.city ?? "",
    state: obj.state ?? "",
    zip: obj.zip ?? "",
    country: obj.country ?? "US",
  }
}

function toAddressArray(json: Json | null): Address[] {
  if (!json || !Array.isArray(json)) return []
  return (json as Record<string, string>[]).map(toAddress)
}

function calcAge(dob: string | null): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function mapCustomer(row: Tables<"customers">): Customer {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    landLine: row.land_line,
    dateOfBirth: row.date_of_birth,
    age: calcAge(row.date_of_birth),
    height: row.height,
    weight: row.weight,
    shippingAddress: toAddress(row.shipping_address),
    billingAddress: row.billing_address ? toAddress(row.billing_address) : null,
    otherAddresses: toAddressArray(row.other_addresses),
    company: row.company,
    spouseName: row.spouse_name,
    spouseAccountId: row.spouse_account_id,
    socialMediaHandles: row.social_media_handles ?? null,
    mexicoShippingTaxId: row.mexico_shipping_tax_id ?? null,
    howHeardAboutUs: row.how_heard_about_us,
    referralSource: row.referral_source,
    preferredPurchase: row.preferred_purchase as PurchasePreference,
    preferredContact: row.preferred_contact as ContactMethod,
    lastContactMethod: row.last_contact_method ?? "",
    lastContactDate: row.last_contact_date ?? "",
    favoriteColor: row.favorite_color,
    climate: row.climate,
    normalPantsType: row.normal_pants_type,
    loyaltyTier: row.loyalty_tier as LoyaltyTier,
    rewardPoints: row.reward_points,
    totalSpent: row.total_spent,
    totalOrders: row.total_orders,
    averageOrderSpent: row.average_order_spent,
    averageProductSpent: row.average_product_spent,
    lastOrderDate: row.last_order_date ?? "",
    channel: row.channel as OrderChannel,
    isWhiteGlove: row.is_white_glove,
    hasFitConfirmation: row.has_fit_confirmation,
    hasEmptyMeasurements: row.has_empty_measurements,
    profileNote: row.profile_note,
    callNotes: row.call_notes,
    ordersReturned: row.orders_returned,
    itemsAltered: row.items_altered,
    activeAlterations: row.active_alterations,
    createdAt: row.created_at,
  }
}

export function mapMeasurementProfile(
  row: Tables<"measurement_profiles">
): MeasurementProfile {
  return {
    id: row.id,
    customerId: row.customer_id,
    dateTaken: row.date_taken,
    source: row.source as MeasurementSource,
    isActive: row.is_active,
    fittedBy: row.fitted_by,
    waist: row.waist,
    seat: row.seat,
    thigh: row.thigh,
    knee: row.knee,
    inseam: row.inseam,
    outseam: row.outseam,
    riseFront: row.rise_front,
    riseBack: row.rise_back,
    hip: row.hip,
    legOpening: row.leg_opening,
    calf: row.calf,
    ankle: row.ankle,
    jacketSize: row.jacket_size,
    shoeSize: row.shoe_size,
    beltSize: row.belt_size,
    beltMeasureMethod: row.belt_measure_method,
    fit: row.fit,
    heelHeight: row.heel_height,
    splitBeltLoops: row.split_belt_loops,
    backPocketPlacement: row.back_pocket_placement,
    frontPocketStyle: row.front_pocket_style,
    pocketBagDepth: row.pocket_bag_depth,
    lastMonogram: row.last_monogram,
    monogramStyle: row.monogram_style,
    lastThreadColor: row.last_thread_color,
    measurementNote: row.measurement_note,
    fitNote: row.fit_note,
    alterationNotes: row.alteration_notes,
  }
}

export function mapProduct(row: Tables<"products">): Product {
  const opts = row.customization_options
  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    basePrice: row.base_price,
    description: row.description,
    fabricFamily: (row.fabric_family ?? "Raw Denim") as FabricFamily,
    isActive: row.is_active,
    customizationOptions: Array.isArray(opts)
      ? (opts as string[])
      : [],
  }
}

export function mapFabricRoll(row: Tables<"fabric_rolls">): FabricRoll {
  return {
    id: row.id,
    materialName: row.material_name,
    fabricFamily: row.fabric_family as FabricFamily,
    color: row.color,
    weightOz: row.weight_oz,
    composition: row.composition,
    supplier: row.supplier,
    batchDyeLot: row.batch_dye_lot,
    widthInches: row.width_inches,
    shrinkageWarpPct: row.shrinkage_warp_pct,
    shrinkageWeftPct: row.shrinkage_weft_pct,
    initialYards: row.initial_yards,
    currentYards: row.current_yards,
    reorderPointYards: row.reorder_point_yards,
    costPerYard: row.cost_per_yard,
    location: row.location,
    status: row.status as RollStatus,
    receivedDate: row.received_date,
    notes: row.notes,
  }
}

export function mapHardwareItem(row: Tables<"hardware_items">): HardwareItem {
  return {
    id: row.id,
    name: row.name,
    type: row.type as HardwareType,
    variant: row.variant,
    supplier: row.supplier,
    currentStock: row.current_stock,
    reorderPoint: row.reorder_point,
    costPerUnit: row.cost_per_unit,
    bomQuantityPerJean: row.bom_quantity_per_jean,
    location: row.location,
    status: row.status as "In Stock" | "Low" | "Out of Stock",
  }
}

export function mapPipelineStage(row: Tables<"pipeline_stages">): PipelineStage {
  return {
    stage: row.stage as OrderStatus,
    enteredAt: row.entered_at,
    exitedAt: row.exited_at,
    artisan: row.artisan,
    notes: row.notes,
  }
}

export function mapOrder(
  row: Tables<"orders">,
  pipelineStages?: Tables<"pipeline_stages">[]
): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    measurementProfileId: row.measurement_profile_id,
    channel: row.channel as OrderChannel,
    status: row.status as OrderStatus,
    productId: row.product_id,
    fabricRollId: row.fabric_roll_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalPrice: row.total_price,
    yardageUsed: row.yardage_used,
    threadColor: row.thread_color,
    monogram: row.monogram,
    monogramStyle: row.monogram_style,
    pocketStyle: row.pocket_style,
    hardware: row.hardware,
    assignedArtisan: row.assigned_artisan,
    pipelineStages: pipelineStages
      ? pipelineStages.map(mapPipelineStage)
      : [],
    partnerId: row.partner_id,
    partnerRepId: row.partner_rep_id,
    partnerOrderRef: row.partner_order_ref,
    brandingPackId: row.branding_pack_id,
    orderDate: row.order_date,
    promisedDate: row.promised_date,
    completedDate: row.completed_date,
    shipmentId: null,
    orderNote: row.order_note,
    giftNote: row.gift_note,
    giftRecipient: row.gift_recipient,
    giftSender: row.gift_sender,
  }
}

export function mapShipmentStage(
  row: Tables<"shipment_stages">
): ShipmentStage {
  return {
    status: row.status as ShipmentStatus,
    timestamp: row.timestamp,
    location: row.location,
  }
}

export function mapShipment(
  row: Tables<"shipments">,
  stages?: Tables<"shipment_stages">[]
): Shipment {
  return {
    id: row.id,
    orderId: row.order_id,
    customerId: row.customer_id,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    status: row.status as ShipmentStatus,
    shippedDate: row.shipped_date,
    estimatedDelivery: row.estimated_delivery,
    actualDelivery: row.actual_delivery,
    shippingAddress: toAddress(row.shipping_address),
    weight: row.weight,
    cost: row.cost,
    stages: stages ? stages.map(mapShipmentStage) : [],
  }
}

export function mapPartner(row: Tables<"partners">): Partner {
  return {
    id: row.id,
    name: row.name,
    type: row.type as "Clothier" | "Corporate" | "Retailer",
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    address: toAddress(row.address),
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    activeOrders: row.active_orders,
    accountSince: row.account_since,
    paymentTerms: row.payment_terms,
    notes: row.notes,
  }
}

export function mapPartnerRep(row: Tables<"partner_reps">): PartnerRep {
  return {
    id: row.id,
    partnerId: row.partner_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    territory: row.territory,
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    averageReturnRate: row.average_return_rate,
  }
}

export function mapMonthlyMetrics(
  row: Tables<"monthly_metrics">
): MonthlyMetrics {
  return {
    month: row.month,
    revenue: row.revenue,
    orderCount: row.order_count,
    newCustomers: row.new_customers,
    dtcWebOrders: row.dtc_web_orders,
    dtcStoreOrders: row.dtc_store_orders,
    b2bOrders: row.b2b_orders,
    trunkShowOrders: row.trunk_show_orders,
    averageLeadTimeDays: row.average_lead_time_days,
    onTimeDeliveryRate: row.on_time_delivery_rate,
    fabricYardsConsumed: row.fabric_yards_consumed,
    fabricYardsReceived: row.fabric_yards_received,
  }
}
