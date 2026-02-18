import { faker } from "@faker-js/faker"
import type { Order, Shipment, ShipmentStatus, ShipmentStage } from "./types"

const CARRIER_HUBS: Record<string, string[]> = {
  UPS: ["Louisville, KY Hub", "Memphis, TN Hub", "Dallas, TX Hub"],
  FedEx: ["Memphis, TN Hub", "Indianapolis, IN Hub", "Oakland, CA Hub"],
  USPS: ["Memphis, TN Processing", "Atlanta, GA Processing", "Dallas, TX Processing"],
}

function generateTrackingNumber(carrier: string): string {
  switch (carrier) {
    case "UPS":
      return `1Z${faker.string.alphanumeric(16).toUpperCase()}`
    case "FedEx":
      return faker.string.numeric(15)
    case "USPS":
      return `9400${faker.string.numeric(18)}`
    default:
      return faker.string.alphanumeric(20).toUpperCase()
  }
}

function getProductWeight(productId: string): string {
  // Based on product category determined by ID
  const id = parseInt(productId.replace("PROD-", ""))
  if (id <= 4) {
    // Pants
    return `${faker.number.float({ min: 1.8, max: 2.5, fractionDigits: 1 })} lbs`
  }
  if (id <= 7) {
    // Jackets
    return `${faker.number.float({ min: 3.0, max: 4.5, fractionDigits: 1 })} lbs`
  }
  if (id === 8) {
    // Belt
    return `${faker.number.float({ min: 0.8, max: 1.2, fractionDigits: 1 })} lbs`
  }
  // Accessories
  return `${faker.number.float({ min: 0.3, max: 0.8, fractionDigits: 1 })} lbs`
}

export function generateShipments(orders: Order[]): Shipment[] {
  faker.seed(4204)

  const shippedOrders = orders.filter((o) => o.status === "Shipped")
  const shipments: Shipment[] = []

  for (let i = 0; i < shippedOrders.length; i++) {
    const order = shippedOrders[i]

    // Pick carrier
    const r = faker.number.float({ min: 0, max: 1 })
    const carrier = r < 0.5 ? "UPS" : r < 0.85 ? "FedEx" : "USPS"

    // Shipped date = order's completed date or derived
    const completedDate = order.completedDate
      ? new Date(order.completedDate)
      : new Date(order.orderDate)
    const shippedDate = new Date(completedDate)

    // Build shipment stages
    const stages: ShipmentStage[] = []
    let currentTime = new Date(shippedDate)

    // Label Created
    stages.push({
      status: "Label Created",
      timestamp: currentTime.toISOString(),
      location: "Tupelo, MS",
    })

    // Picked Up (same day or +1)
    currentTime = new Date(
      currentTime.getTime() +
        faker.number.int({ min: 0, max: 1 }) * 24 * 60 * 60 * 1000 +
        faker.number.int({ min: 2, max: 8 }) * 60 * 60 * 1000
    )
    stages.push({
      status: "Picked Up",
      timestamp: currentTime.toISOString(),
      location: "Tupelo, MS",
    })

    // In Transit (+1 day, carrier hub)
    currentTime = new Date(
      currentTime.getTime() + 1 * 24 * 60 * 60 * 1000
    )
    const hubs = CARRIER_HUBS[carrier] || ["Memphis, TN Hub"]
    stages.push({
      status: "In Transit",
      timestamp: currentTime.toISOString(),
      location: hubs[faker.number.int({ min: 0, max: hubs.length - 1 })],
    })

    // Determine if delivered or still in transit
    // Most should be delivered, ~15% still in transit
    const isDelivered = faker.number.float({ min: 0, max: 1 }) < 0.85

    let finalStatus: ShipmentStatus = "In Transit"
    let actualDelivery: string | null = null
    let estimatedDelivery: string

    if (isDelivered) {
      // Out for Delivery (+2-5 days)
      const transitDays = faker.number.int({ min: 2, max: 5 })
      currentTime = new Date(
        currentTime.getTime() + transitDays * 24 * 60 * 60 * 1000
      )
      stages.push({
        status: "Out for Delivery",
        timestamp: currentTime.toISOString(),
        location: order.giftRecipient
          ? "Destination City"
          : `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      })

      // Delivered (+1 day)
      currentTime = new Date(
        currentTime.getTime() +
          faker.number.int({ min: 4, max: 12 }) * 60 * 60 * 1000
      )
      stages.push({
        status: "Delivered",
        timestamp: currentTime.toISOString(),
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      })

      finalStatus = "Delivered"
      actualDelivery = currentTime.toISOString().split("T")[0]
      estimatedDelivery = actualDelivery
    } else {
      // Still in transit
      estimatedDelivery = new Date(
        currentTime.getTime() +
          faker.number.int({ min: 2, max: 5 }) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0]
    }

    const shipmentId = `SHIP-${String(i + 1).padStart(4, "0")}`

    // Link back to order
    order.shipmentId = shipmentId

    shipments.push({
      id: shipmentId,
      orderId: order.id,
      customerId: order.customerId,
      carrier,
      trackingNumber: generateTrackingNumber(carrier),
      status: finalStatus,
      shippedDate: shippedDate.toISOString().split("T")[0],
      estimatedDelivery,
      actualDelivery,
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode(),
        country: "US",
      },
      weight: getProductWeight(order.productId),
      cost: parseFloat(
        faker.number.float({ min: 12, max: 25, fractionDigits: 2 }).toFixed(2)
      ),
      stages,
    })
  }

  return shipments
}
