import { faker } from "@faker-js/faker"
import type { Customer, MeasurementProfile, MeasurementSource } from "./types"

const MEASUREMENT_NOTES = [
  "Left leg slightly shorter — adjust inseam by 0.25 inches",
  "Prefers break over shoe — add 0.5 inches to inseam",
  "Extra room in thigh requested — athletic build",
  "Narrow waist relative to hips — consider dart placement",
  "Significant drop from chest to waist — jacket fit critical",
  "One hip slightly higher — check rise balance",
  "Prefers low rise — keep front rise at minimum",
  "Calf muscles larger than average — check knee and calf relationship",
  "Sits at desk all day — needs comfortable seat measurement",
  "Weight fluctuates seasonally — remeasure in spring",
]

const FIT_NOTES = [
  "Prefers break over shoe",
  "No break — clean hem at ankle",
  "Slight taper from knee to ankle",
  "Relaxed through the thigh, tapered below knee",
  "Slim throughout — modern fit",
  "Classic straight leg, no taper",
  "Higher rise preferred — sits at natural waist",
  "Low rise, sits below navel",
  "Extra room in seat for comfort",
  "Snug through the thigh, relaxed below",
]

const ALTERATION_NOTES = [
  "Hemmed 1 inch on ORD-0023",
  "Waist taken in 0.5 inches on previous order",
  "Seat let out 0.25 inches — recurring issue",
  "Tapering below knee added on last jacket order",
  null,
]

const FITTERS = [
  "Sarah Wells",
  "Marcus Johnson",
  "Amy Chen",
  "Robert Davis",
  "Jennifer Kim",
]

function getSource(channel: string): MeasurementSource {
  switch (channel) {
    case "DTC Web":
      return faker.number.float({ min: 0, max: 1 }) < 0.75
        ? "Bold Metrics AI"
        : "Self-Measured"
    case "DTC Store":
      return faker.number.float({ min: 0, max: 1 }) < 0.8
        ? "In-Store"
        : "Bold Metrics AI"
    case "B2B Tom James":
      return "Tom James Rep"
    case "Trunk Show":
      return "Trunk Show"
    default:
      return faker.number.float({ min: 0, max: 1 }) < 0.5
        ? "Bold Metrics AI"
        : "In-Store"
  }
}

export function generateMeasurements(
  customers: Customer[]
): MeasurementProfile[] {
  faker.seed(4202)

  const profiles: MeasurementProfile[] = []
  let measIndex = 1

  for (const customer of customers) {
    // 1-3 profiles per customer, weighted toward 1-2
    const r = faker.number.float({ min: 0, max: 1 })
    const profileCount = r < 0.5 ? 1 : r < 0.85 ? 2 : 3

    // Body size factor for this customer (consistent across profiles)
    const sizeFactor =
      0.7 + faker.number.float({ min: 0, max: 0.6 })

    const baseValues = {
      waist: 34,
      seat: 42,
      thigh: 24,
      knee: 18,
      inseam: 32,
      outseam: 42,
      riseFront: 11,
      riseBack: 15,
      hip: 40,
      legOpening: 16,
    }

    for (let p = 0; p < profileCount; p++) {
      const isActive = p === profileCount - 1 // Most recent is active
      const source = getSource(customer.channel)

      // Generate measurements with slight variance between profiles
      const variance = () =>
        faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 1 })
      const profileVariance = p > 0 ? 0.02 * (p - 1) : 0 // Slight drift over time

      const scaledSizeFactor = sizeFactor + profileVariance

      const waist = parseFloat(
        (baseValues.waist * scaledSizeFactor + variance()).toFixed(1)
      )
      const seat = parseFloat(
        (baseValues.seat * scaledSizeFactor + variance()).toFixed(1)
      )
      const thigh = parseFloat(
        (baseValues.thigh * scaledSizeFactor + variance()).toFixed(1)
      )
      const knee = parseFloat(
        (baseValues.knee * scaledSizeFactor + variance()).toFixed(1)
      )
      const inseam = parseFloat(
        (baseValues.inseam * scaledSizeFactor + variance()).toFixed(1)
      )
      const outseam = parseFloat(
        (baseValues.outseam * scaledSizeFactor + variance()).toFixed(1)
      )
      const riseFront = parseFloat(
        (baseValues.riseFront * scaledSizeFactor + variance()).toFixed(1)
      )
      const riseBack = parseFloat(
        (baseValues.riseBack * scaledSizeFactor + variance()).toFixed(1)
      )
      const hip = parseFloat(
        (baseValues.hip * scaledSizeFactor + variance()).toFixed(1)
      )
      const legOpening = parseFloat(
        (baseValues.legOpening * scaledSizeFactor + variance()).toFixed(1)
      )

      const dateTaken = faker.date
        .between({
          from: customer.createdAt,
          to: "2026-02-15",
        })
        .toISOString()
        .split("T")[0]

      const hasFit = faker.number.float({ min: 0, max: 1 }) < 0.4
      const hasMonogram = faker.number.float({ min: 0, max: 1 }) < 0.2
      const hasNotes = faker.number.float({ min: 0, max: 1 }) < 0.3
      const hasJacketSize = faker.number.float({ min: 0, max: 1 }) < 0.35
      const hasShoeSize = faker.number.float({ min: 0, max: 1 }) < 0.45
      const hasBeltSize = faker.number.float({ min: 0, max: 1 }) < 0.3

      const fits = ["Slim", "Regular", "Relaxed"]
      const heelHeights = [
        "Standard boot heel",
        "Flat / sneaker",
        "Dress shoe heel",
        "Cowboy boot",
      ]
      const pocketStyles = ["Slant", "Straight"]
      const pocketDepths = ["Standard", "Deep"]
      const backPocketPlacements = ["Standard", "Higher", "Lower"]
      const monogramStyles = ["Block", "Script"]
      const threadColors = ["Tonal", "Gold", "White", "Navy", "Red"]
      const beltMethods = ["Try-On", "Virtual Tailor", "Tape Measured"]

      const initials =
        customer.firstName[0] +
        (customer.lastName[0] || "") +
        (customer.lastName.length > 1 ? customer.lastName[customer.lastName.length - 1] : "")

      profiles.push({
        id: `MEAS-${String(measIndex).padStart(4, "0")}`,
        customerId: customer.id,
        dateTaken,
        source,
        isActive,
        fittedBy:
          source === "In-Store" || source === "Tom James Rep" || source === "Trunk Show"
            ? FITTERS[faker.number.int({ min: 0, max: FITTERS.length - 1 })]
            : null,
        waist,
        seat,
        thigh,
        knee,
        inseam,
        outseam,
        riseFront,
        riseBack,
        hip,
        legOpening,
        calf:
          faker.number.float({ min: 0, max: 1 }) < 0.3
            ? parseFloat((14 * scaledSizeFactor + variance()).toFixed(1))
            : null,
        ankle:
          faker.number.float({ min: 0, max: 1 }) < 0.2
            ? parseFloat((9 * scaledSizeFactor + variance()).toFixed(1))
            : null,
        jacketSize: hasJacketSize
          ? `${faker.number.int({ min: 38, max: 48 })}${faker.helpers.arrayElement(["S", "R", "L"])}`
          : null,
        shoeSize: hasShoeSize
          ? `${faker.number.int({ min: 8, max: 13 })}${faker.number.float({ min: 0, max: 1 }) < 0.5 ? ".5" : ""}`
          : null,
        beltSize: hasBeltSize
          ? `${faker.number.int({ min: 30, max: 44 })}`
          : null,
        beltMeasureMethod: hasBeltSize
          ? beltMethods[faker.number.int({ min: 0, max: beltMethods.length - 1 })]
          : null,
        fit: hasFit
          ? fits[faker.number.int({ min: 0, max: fits.length - 1 })]
          : null,
        heelHeight: hasFit
          ? heelHeights[faker.number.int({ min: 0, max: heelHeights.length - 1 })]
          : null,
        splitBeltLoops: faker.number.float({ min: 0, max: 1 }) < 0.1,
        backPocketPlacement: hasFit
          ? backPocketPlacements[
              faker.number.int({ min: 0, max: backPocketPlacements.length - 1 })
            ]
          : null,
        frontPocketStyle: hasFit
          ? pocketStyles[faker.number.int({ min: 0, max: pocketStyles.length - 1 })]
          : null,
        pocketBagDepth: hasFit
          ? pocketDepths[faker.number.int({ min: 0, max: pocketDepths.length - 1 })]
          : null,
        lastMonogram: hasMonogram ? initials.toUpperCase() : null,
        monogramStyle: hasMonogram
          ? monogramStyles[
              faker.number.int({ min: 0, max: monogramStyles.length - 1 })
            ]
          : null,
        lastThreadColor:
          faker.number.float({ min: 0, max: 1 }) < 0.5
            ? threadColors[
                faker.number.int({ min: 0, max: threadColors.length - 1 })
              ]
            : null,
        measurementNote: hasNotes
          ? MEASUREMENT_NOTES[
              faker.number.int({ min: 0, max: MEASUREMENT_NOTES.length - 1 })
            ]
          : null,
        fitNote: hasNotes
          ? FIT_NOTES[faker.number.int({ min: 0, max: FIT_NOTES.length - 1 })]
          : null,
        alterationNotes:
          faker.number.float({ min: 0, max: 1 }) < 0.15
            ? ALTERATION_NOTES[
                faker.number.int({ min: 0, max: ALTERATION_NOTES.length - 2 })
              ]
            : null,
      })

      measIndex++
    }
  }

  return profiles
}
