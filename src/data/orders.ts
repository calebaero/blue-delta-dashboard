import { faker } from "@faker-js/faker"
import type {
  Order,
  OrderStatus,
  OrderChannel,
  PipelineStage,
  Customer,
  MeasurementProfile,
  FabricRoll,
  Product,
  Partner,
  PartnerRep,
} from "./types"

const PIPELINE_ORDER: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

const ARTISANS = [
  "Mary Catherine Wells",
  "James Patterson",
  "Dorothy Mae Harris",
  "Robert Lee Thompson",
  "Helen Grace Tucker",
  "Willie James Brown",
  "Betty Jo Mitchell",
  "Charles Ray Stevens",
  "Martha Ann Collier",
  "Thomas Earl Boyd",
  "Sarah Jane Cooper",
  "David Wayne Phillips",
  "Linda Sue Carpenter",
  "Johnny Ray Dixon",
  "Patricia Lynn Foster",
  "Michael Dean Gregory",
  "Nancy Carol Henderson",
  "William Joe Ingram",
  "Barbara Jean Knight",
  "Richard Dale Lambert",
  "Donna Kay Mason",
  "Jerry Don Nelson",
  "Sandra Faye Oliver",
  "Kenneth Wayne Price",
  "Debra Ann Quinn",
  "Ronald Lee Russell",
  "Carolyn Mae Sanders",
  "Bobby Gene Turner",
  "Sharon Kay Underwood",
  "Larry Don Vincent",
  "Brenda Joyce Washington",
  "Terry Wayne Young",
  "Peggy Sue Adams",
  "Roy Dean Baker",
  "Wanda Jean Clark",
  "Gary Don Edwards",
  "Shirley Ann Farmer",
  "Harold Dean Gibson",
  "Norma Jean Harper",
  "Eddie Ray Jackson",
  "Kathy Lynn King",
  "Roger Dale Lewis",
  "Judy Ann Morgan",
  "Paul Wayne Nash",
  "Diane Marie O'Brien",
  "Ralph Dean Parker",
  "Connie Sue Reed",
  "Steve Earl Stone",
  "Tammy Lynn Watkins",
  "Howard Dean York",
]

const ORDER_NOTES = [
  "Rush order — customer has event on the 15th",
  "Please double-stitch all bar-tack positions",
  "Customer prefers heavier starch on finishing",
  "Match thread color exactly to sample swatch provided",
  "Ship with care — previous order had crease damage",
  "Customer requested hand-written thank you note",
  "Remake — original had measurement error on inseam",
  "Second pair for same customer — use identical specs",
  "Gift wrap requested",
  "Corporate branding pack included — see B2B notes",
]

const GIFT_NOTES = [
  "Happy Birthday! Love, [sender]",
  "Congratulations on the promotion! — [sender]",
  "Welcome to the team! — [sender]",
  "Happy Holidays! — [sender]",
  "Thank you for everything! — [sender]",
]

function pickStatus(): OrderStatus {
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.08) return "Order Received"
  if (r < 0.18) return "Pattern Drafting"
  if (r < 0.3) return "Cutting"
  if (r < 0.55) return "Sewing"
  if (r < 0.7) return "Finishing"
  if (r < 0.8) return "QC"
  return "Shipped"
}

function pickThreadColor(): string {
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.5) return "Tonal"
  if (r < 0.65) return "Gold"
  if (r < 0.75) return "White"
  if (r < 0.85) return "Navy"
  if (r < 0.9) return "Red"
  return "Custom"
}

function pickHardware(): string {
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.6) return "Brass"
  if (r < 0.9) return "Nickel"
  return "Antique Brass"
}

function pickPocketStyle(): string {
  return faker.number.float({ min: 0, max: 1 }) < 0.7 ? "Slant" : "Straight"
}

function pickProductWeighted(products: Product[]): Product {
  const r = faker.number.float({ min: 0, max: 1 })
  const pants = products.filter((p) => p.category === "Pants")
  const jackets = products.filter((p) => p.category === "Jacket")
  const belts = products.filter((p) => p.category === "Belt")
  const accessories = products.filter((p) => p.category === "Accessory")

  if (r < 0.75 && pants.length > 0) {
    return pants[faker.number.int({ min: 0, max: pants.length - 1 })]
  }
  if (r < 0.9 && jackets.length > 0) {
    return jackets[faker.number.int({ min: 0, max: jackets.length - 1 })]
  }
  if (r < 0.95 && belts.length > 0) {
    return belts[faker.number.int({ min: 0, max: belts.length - 1 })]
  }
  if (accessories.length > 0) {
    return accessories[faker.number.int({ min: 0, max: accessories.length - 1 })]
  }
  return products[0]
}

function generatePipelineStages(
  status: OrderStatus,
  orderDate: Date
): PipelineStage[] {
  const stages: PipelineStage[] = []
  const statusIndex = PIPELINE_ORDER.indexOf(status)
  let currentDate = new Date(orderDate)

  for (let i = 0; i <= statusIndex; i++) {
    const enteredAt = new Date(currentDate)
    const gapDays = faker.number.int({ min: 2, max: 7 })
    const isCurrentStage = i === statusIndex
    const exitedAt =
      isCurrentStage && status !== "Shipped"
        ? null
        : new Date(currentDate.getTime() + gapDays * 24 * 60 * 60 * 1000)

    stages.push({
      stage: PIPELINE_ORDER[i],
      enteredAt: enteredAt.toISOString(),
      exitedAt: exitedAt ? exitedAt.toISOString() : null,
      artisan:
        i >= 1
          ? ARTISANS[faker.number.int({ min: 0, max: ARTISANS.length - 1 })]
          : null,
      notes: null,
    })

    if (exitedAt) {
      currentDate = exitedAt
    }
  }

  return stages
}

function pickChannel(isB2b: boolean): OrderChannel {
  if (isB2b) {
    return faker.number.float({ min: 0, max: 1 }) < 0.6
      ? "B2B Tom James"
      : "B2B Other"
  }
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.55) return "DTC Web"
  if (r < 0.75) return "DTC Store"
  return "Trunk Show"
}

export function generateOrders(
  customers: Customer[],
  measurements: MeasurementProfile[],
  fabricRolls: FabricRoll[],
  products: Product[],
  partners: Partner[],
  partnerReps: PartnerRep[]
): Order[] {
  faker.seed(4203)

  const orders: Order[] = []

  // Build lookup: customerId → active measurement
  const activeMeasurements = new Map<string, MeasurementProfile>()
  for (const m of measurements) {
    if (m.isActive) {
      activeMeasurements.set(m.customerId, m)
    }
  }

  // Active fabric rolls for assignment
  const activeRolls = fabricRolls.filter(
    (r) => r.status === "Active" || r.status === "Low"
  )

  // Tom James partner and reps
  const tomJames = partners.find((p) => p.id === "PART-0001")
  const tomJamesReps = partnerReps.filter((r) => r.partnerId === "PART-0001")
  const otherPartners = partners.filter((p) => p.id !== "PART-0001")
  const otherReps = partnerReps.filter((r) => r.partnerId !== "PART-0001")

  for (let i = 0; i < 500; i++) {
    const isB2b = faker.number.float({ min: 0, max: 1 }) < 0.25
    const channel = pickChannel(isB2b)

    // Pick a customer
    const customer =
      customers[faker.number.int({ min: 0, max: customers.length - 1 })]
    const measurement = activeMeasurements.get(customer.id)
    if (!measurement) continue

    const product = pickProductWeighted(products)
    const status = pickStatus()

    // Price
    let unitPrice = product.basePrice
    if (product.category === "Jacket") {
      unitPrice =
        product.basePrice +
        faker.number.int({ min: 0, max: 75 })
    } else if (product.category === "Accessory" && product.basePrice === 75) {
      unitPrice = 75
    }

    // Order date — weighted toward recent
    const dateWeight = faker.number.float({ min: 0, max: 1 })
    let fromDate: string
    let toDate: string
    if (dateWeight < 0.15) {
      fromDate = "2023-01-01"
      toDate = "2023-12-31"
    } else if (dateWeight < 0.35) {
      fromDate = "2024-01-01"
      toDate = "2024-12-31"
    } else if (dateWeight < 0.7) {
      fromDate = "2025-01-01"
      toDate = "2025-12-31"
    } else {
      fromDate = "2026-01-01"
      toDate = "2026-02-15"
    }
    const orderDate = faker.date.between({ from: fromDate, to: toDate })

    // Pipeline stages
    const pipelineStages = generatePipelineStages(status, orderDate)

    // Artisan assignment (after Pattern Drafting)
    const statusIndex = PIPELINE_ORDER.indexOf(status)
    const assignedArtisan =
      statusIndex >= 1
        ? ARTISANS[faker.number.int({ min: 0, max: ARTISANS.length - 1 })]
        : null

    // Fabric roll assignment (after Cutting)
    let fabricRollId: string | null = null
    let yardageUsed: number | null = null
    if (statusIndex >= 2 && activeRolls.length > 0) {
      const roll =
        activeRolls[faker.number.int({ min: 0, max: activeRolls.length - 1 })]
      fabricRollId = roll.id

      if (product.category === "Pants") {
        yardageUsed = parseFloat(
          faker.number.float({ min: 1.4, max: 1.8, fractionDigits: 1 }).toFixed(1)
        )
      } else if (product.category === "Jacket") {
        yardageUsed = parseFloat(
          faker.number.float({ min: 2.0, max: 2.8, fractionDigits: 1 }).toFixed(1)
        )
      } else if (product.category === "Belt") {
        yardageUsed = parseFloat(
          faker.number.float({ min: 0.5, max: 0.8, fractionDigits: 1 }).toFixed(1)
        )
      }
    }

    // B2B fields
    let partnerId: string | null = null
    let partnerRepId: string | null = null
    let partnerOrderRef: string | null = null
    if (isB2b) {
      if (channel === "B2B Tom James" && tomJames && tomJamesReps.length > 0) {
        partnerId = tomJames.id
        const rep =
          tomJamesReps[
            faker.number.int({ min: 0, max: tomJamesReps.length - 1 })
          ]
        partnerRepId = rep.id
      } else if (otherPartners.length > 0 && otherReps.length > 0) {
        const partner =
          otherPartners[
            faker.number.int({ min: 0, max: otherPartners.length - 1 })
          ]
        partnerId = partner.id
        const repsForPartner = otherReps.filter(
          (r) => r.partnerId === partner.id
        )
        if (repsForPartner.length > 0) {
          partnerRepId =
            repsForPartner[
              faker.number.int({ min: 0, max: repsForPartner.length - 1 })
            ].id
        }
      }
      partnerOrderRef = `PO-${faker.string.alphanumeric(8).toUpperCase()}`
    }

    // Promised and completed dates
    const promisedDate = new Date(
      orderDate.getTime() + 35 * 24 * 60 * 60 * 1000
    )
    let completedDate: string | null = null
    if (status === "Shipped" && pipelineStages.length > 0) {
      const lastStage = pipelineStages[pipelineStages.length - 1]
      completedDate = lastStage.exitedAt
    }

    // Gift orders
    const isGift = faker.number.float({ min: 0, max: 1 }) < 0.05
    const giftNote = isGift
      ? GIFT_NOTES[faker.number.int({ min: 0, max: GIFT_NOTES.length - 1 })]
          .replace("[sender]", faker.person.firstName())
      : null
    const giftRecipient = isGift ? faker.person.fullName() : null
    const giftSender = isGift ? faker.person.fullName() : null

    // Monogram
    const hasMonogram = faker.number.float({ min: 0, max: 1 }) < 0.2
    const monogramInitials =
      customer.firstName[0] +
      customer.lastName[0] +
      (customer.lastName.length > 1
        ? customer.lastName[customer.lastName.length - 1]
        : "")

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, "0")}`,
      customerId: customer.id,
      measurementProfileId: measurement.id,
      channel,
      status,
      productId: product.id,
      fabricRollId,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      yardageUsed,
      threadColor: pickThreadColor(),
      monogram: hasMonogram ? monogramInitials.toUpperCase() : null,
      monogramStyle: hasMonogram
        ? faker.number.float({ min: 0, max: 1 }) < 0.6
          ? "Block"
          : "Script"
        : null,
      pocketStyle: pickPocketStyle(),
      hardware: pickHardware(),
      assignedArtisan,
      pipelineStages,
      partnerId,
      partnerRepId,
      partnerOrderRef,
      brandingPackId: isB2b && faker.number.float({ min: 0, max: 1 }) < 0.3
        ? `BP-${faker.string.alphanumeric(6).toUpperCase()}`
        : null,
      orderDate: orderDate.toISOString().split("T")[0],
      promisedDate: promisedDate.toISOString().split("T")[0],
      completedDate: completedDate
        ? completedDate.split("T")[0]
        : null,
      shipmentId: null, // Will be linked by shipping generator
      orderNote:
        faker.number.float({ min: 0, max: 1 }) < 0.1
          ? ORDER_NOTES[
              faker.number.int({ min: 0, max: ORDER_NOTES.length - 1 })
            ]
          : null,
      giftNote,
      giftRecipient,
      giftSender,
    })
  }

  return orders
}
