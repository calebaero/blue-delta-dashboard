import { faker } from "@faker-js/faker"
import type {
  Customer,
  OrderChannel,
  LoyaltyTier,
  ContactMethod,
  PurchasePreference,
} from "./types"

const CITIES: { city: string; state: string; zip: string; weight: number }[] = [
  { city: "New York", state: "NY", zip: "10001", weight: 15 },
  { city: "Los Angeles", state: "CA", zip: "90001", weight: 12 },
  { city: "Chicago", state: "IL", zip: "60601", weight: 8 },
  { city: "Houston", state: "TX", zip: "77001", weight: 8 },
  { city: "Dallas", state: "TX", zip: "75201", weight: 8 },
  { city: "Nashville", state: "TN", zip: "37201", weight: 7 },
  { city: "Atlanta", state: "GA", zip: "30301", weight: 7 },
  { city: "Miami", state: "FL", zip: "33101", weight: 6 },
  { city: "Denver", state: "CO", zip: "80201", weight: 5 },
  { city: "San Francisco", state: "CA", zip: "94101", weight: 5 },
  { city: "Austin", state: "TX", zip: "73301", weight: 4 },
  { city: "Charlotte", state: "NC", zip: "28201", weight: 3 },
  { city: "Tupelo", state: "MS", zip: "38801", weight: 3 },
  { city: "Oxford", state: "MS", zip: "38655", weight: 2 },
  { city: "Jackson", state: "MS", zip: "39201", weight: 2 },
  { city: "Memphis", state: "TN", zip: "38101", weight: 2 },
  { city: "Birmingham", state: "AL", zip: "35201", weight: 2 },
  { city: "Scottsdale", state: "AZ", zip: "85251", weight: 1 },
]

function weightedPick<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let r = faker.number.float({ min: 0, max: totalWeight })
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function pickChannel(): OrderChannel {
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.55) return "DTC Web"
  if (r < 0.7) return "DTC Store"
  if (r < 0.85) return "B2B Tom James"
  if (r < 0.95) return "B2B Other"
  return "Trunk Show"
}

function pickHowHeard(): string {
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.3) return "Social Media"
  if (r < 0.5) return "Referral"
  if (r < 0.65) return "Press"
  if (r < 0.8) return "Event"
  if (r < 0.9) return "Search"
  return "Word of Mouth"
}

function getTier(totalOrders: number): LoyaltyTier {
  if (totalOrders <= 1) return "New"
  if (totalOrders <= 4) return "Returning"
  if (totalOrders <= 9) return "VIP"
  return "Ambassador"
}

function generateWeightedOrders(): number {
  // Weighted toward 1-5
  const r = faker.number.float({ min: 0, max: 1 })
  if (r < 0.4) return faker.number.int({ min: 1, max: 2 })
  if (r < 0.7) return faker.number.int({ min: 2, max: 5 })
  if (r < 0.9) return faker.number.int({ min: 5, max: 10 })
  return faker.number.int({ min: 10, max: 25 })
}

const NICKNAMES = [
  "Johnny",
  "Mike",
  "Em",
  "Bobby",
  "Billy",
  "Danny",
  "Jimmy",
  "Tommy",
  "Teddy",
  "Chuck",
]

const PROFILE_NOTES = [
  "Prefers heavier weight denim. Has purchased exclusively raw denim.",
  "Corporate executive — needs business-appropriate fits. Usually orders in batches of 3.",
  "Repeat gift buyer — orders for his sons. Always requests gift wrapping.",
  "Very particular about inseam length. Double-check hem before shipping.",
  "Long-time customer, always orders same specs. Clone previous order when possible.",
  "Referred by Tom James rep. Transitioning to DTC orders.",
  "Runs a denim blog — potential brand ambassador. Sends photos of fades.",
  "Allergic to nickel — always use brass hardware. CRITICAL.",
  "Celebrity stylist — orders for clients. Needs quick turnaround.",
  "International shipping to Mexico home in winter months.",
  "Left a 5-star review on the website. Very enthusiastic about the brand.",
  "Had a sizing issue on first order — resolved with complimentary alterations.",
  "Prefers relaxed fit through the thigh. Athletic build.",
  "Orders matching pairs with spouse. Always coordinate shipping.",
  "Works in construction — needs reinforced knees and double-stitched seams.",
]

const CALL_NOTES = [
  "Called to check on order status. Very friendly, no issues.",
  "Discussed fit concerns — scheduled a video call with the fit team.",
  "Wants to schedule a trunk show visit. Added to the Nashville list.",
  "Asked about jacket sizing. Sent measurement guide via email.",
  "Follow-up on alteration request. Hem needs to be taken up 0.5 inches.",
  "Inquired about wholesale pricing for his company. Transferred to B2B team.",
  "Birthday coming up — spouse called to arrange a gift order.",
  "Discussed switching from Performance to Raw Denim. Sent fabric swatches.",
  "Had shipping delay — apologized and upgraded to priority shipping on next order.",
  "Wants to add monogram to next order. Confirmed thread color preference.",
]

const CLIMATES = [
  "Hot & Humid",
  "Temperate",
  "Cold Winters",
  "Arid / Dry",
  "Mild Year-Round",
  "Four Seasons",
]

const PANTS_TYPES = [
  "Slim straight, raw denim",
  "Relaxed fit, chino",
  "Athletic fit, performance",
  "Classic straight, heavyweight denim",
  "Slim tapered, dark wash",
  "Regular fit, casual chino",
]

const COMPANIES = [
  "VP of Marketing, Acme Corp",
  "Managing Director, Goldman Sachs",
  "CEO, Smith & Associates",
  "Attorney, Davis Law Group",
  "Architect, Foster + Partners",
  "Software Engineer, Google",
  "Surgeon, Mayo Clinic",
  "Chef/Owner, The Barn Restaurant",
  "Real Estate Developer, Highrise Capital",
  "Professor, Vanderbilt University",
]

const FAVORITE_COLORS = [
  "Dark Indigo",
  "Black",
  "Charcoal",
  "Navy",
  "Steel Gray",
  "British Khaki",
  "Olive",
]

export function generateCustomers(): Customer[] {
  faker.seed(42)

  const customers: Customer[] = []
  const emailDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "icloud.com",
    "me.com",
  ]

  for (let i = 0; i < 200; i++) {
    const firstName = faker.person.firstName("male")
    const lastName = faker.person.lastName()
    const domain = emailDomains[faker.number.int({ min: 0, max: emailDomains.length - 1 })]
    const emailStyle = faker.number.float({ min: 0, max: 1 })
    const email =
      emailStyle < 0.6
        ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
        : `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`

    const location = weightedPick(
      CITIES,
      CITIES.map((c) => c.weight)
    )

    const channel = pickChannel()

    // For DTC Store, weight toward Mississippi-area
    let finalCity = location.city
    let finalState = location.state
    let finalZip = location.zip
    if (channel === "DTC Store" && faker.number.float({ min: 0, max: 1 }) < 0.4) {
      const msAreas = CITIES.filter((c) =>
        ["MS", "TN", "AL"].includes(c.state)
      )
      if (msAreas.length > 0) {
        const picked = msAreas[faker.number.int({ min: 0, max: msAreas.length - 1 })]
        finalCity = picked.city
        finalState = picked.state
        finalZip = picked.zip
      }
    }

    const totalOrders = generateWeightedOrders()
    const tier = getTier(totalOrders)
    const totalSpent =
      totalOrders * 450 +
      faker.number.int({ min: -200, max: 200 })
    const avgOrderSpent = Math.round(totalSpent / totalOrders)
    const avgProductSpent = Math.round(totalSpent / totalOrders)

    // Weighted date toward recent
    const dateWeight = faker.number.float({ min: 0, max: 1 })
    const yearRange = dateWeight < 0.3 ? { min: 2022, max: 2023 } : dateWeight < 0.6 ? { min: 2024, max: 2024 } : { min: 2025, max: 2026 }
    const lastOrderDate = faker.date
      .between({
        from: `${yearRange.min}-01-01`,
        to: yearRange.max === 2026 ? "2026-02-15" : `${yearRange.max}-12-31`,
      })
      .toISOString()
      .split("T")[0]

    const createdDate = faker.date
      .between({ from: "2020-01-01", to: lastOrderDate })
      .toISOString()
      .split("T")[0]

    const hasDob = faker.number.float({ min: 0, max: 1 }) < 0.6
    const dob = hasDob
      ? faker.date
          .between({ from: "1960-01-01", to: "2000-12-31" })
          .toISOString()
          .split("T")[0]
      : null
    const age = dob
      ? Math.floor(
          (new Date("2026-02-15").getTime() - new Date(dob).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null

    const hasHeight = faker.number.float({ min: 0, max: 1 }) < 0.7
    const feet = faker.number.int({ min: 5, max: 6 })
    const inches = faker.number.int({ min: 0, max: 11 })
    const height = hasHeight ? `${feet}'${inches}"` : null

    const hasWeight = faker.number.float({ min: 0, max: 1 }) < 0.5
    const weight = hasWeight
      ? `${faker.number.int({ min: 140, max: 260 })} lbs`
      : null

    const nickname =
      i < NICKNAMES.length && faker.number.float({ min: 0, max: 1 }) < 0.8
        ? NICKNAMES[i]
        : null

    const hasCompany = faker.number.float({ min: 0, max: 1 }) < 0.3
    const hasSpouse = faker.number.float({ min: 0, max: 1 }) < 0.2
    const hasMexicoTax = faker.number.float({ min: 0, max: 1 }) < 0.03
    const hasSocial = faker.number.float({ min: 0, max: 1 }) < 0.15

    const contactMethods: ContactMethod[] = ["Phone", "Email", "SMS", "In-Person"]
    const purchasePrefs: PurchasePreference[] = ["Online", "In-Store", "Phone"]

    const lastContactDate = faker.date
      .between({ from: "2025-06-01", to: "2026-02-15" })
      .toISOString()
      .split("T")[0]
    const contactMethodPick =
      contactMethods[faker.number.int({ min: 0, max: contactMethods.length - 1 })]
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    const lcDate = new Date(lastContactDate)
    const lastContactMethod = `${contactMethodPick} - ${months[lcDate.getMonth()]} ${lcDate.getDate()}, ${lcDate.getFullYear()}`

    const howHeard = pickHowHeard()

    customers.push({
      id: `CUST-${String(i + 1).padStart(4, "0")}`,
      firstName,
      lastName,
      nickname,
      email,
      phone: faker.phone.number({ style: "national" }),
      landLine:
        faker.number.float({ min: 0, max: 1 }) < 0.15
          ? faker.phone.number({ style: "national" })
          : null,
      dateOfBirth: dob,
      age,
      height,
      weight,
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: finalCity,
        state: finalState,
        zip: finalZip,
        country: "US",
      },
      billingAddress:
        faker.number.float({ min: 0, max: 1 }) < 0.2
          ? {
              street: faker.location.streetAddress(),
              city: finalCity,
              state: finalState,
              zip: finalZip,
              country: "US",
            }
          : null,
      otherAddresses: [],
      company: hasCompany
        ? COMPANIES[faker.number.int({ min: 0, max: COMPANIES.length - 1 })]
        : null,
      spouseName: hasSpouse ? faker.person.fullName({ sex: "female" }) : null,
      spouseAccountId: null,
      socialMediaHandles: hasSocial ? `@${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      mexicoShippingTaxId: hasMexicoTax
        ? `RFC${faker.string.alphanumeric(10).toUpperCase()}`
        : null,
      howHeardAboutUs: howHeard,
      referralSource:
        howHeard === "Referral" ? faker.person.fullName() : null,
      preferredPurchase:
        purchasePrefs[faker.number.int({ min: 0, max: purchasePrefs.length - 1 })],
      preferredContact: contactMethodPick,
      lastContactMethod,
      lastContactDate,
      favoriteColor:
        faker.number.float({ min: 0, max: 1 }) < 0.4
          ? FAVORITE_COLORS[
              faker.number.int({ min: 0, max: FAVORITE_COLORS.length - 1 })
            ]
          : null,
      climate:
        faker.number.float({ min: 0, max: 1 }) < 0.5
          ? CLIMATES[faker.number.int({ min: 0, max: CLIMATES.length - 1 })]
          : null,
      normalPantsType:
        faker.number.float({ min: 0, max: 1 }) < 0.4
          ? PANTS_TYPES[faker.number.int({ min: 0, max: PANTS_TYPES.length - 1 })]
          : null,
      loyaltyTier: tier,
      rewardPoints: totalOrders * 45 + faker.number.int({ min: 0, max: 100 }),
      totalSpent: Math.max(totalSpent, 250),
      totalOrders,
      averageOrderSpent: Math.max(avgOrderSpent, 250),
      averageProductSpent: Math.max(avgProductSpent, 250),
      lastOrderDate,
      channel,
      isWhiteGlove: faker.number.float({ min: 0, max: 1 }) < 0.05,
      hasFitConfirmation: faker.number.float({ min: 0, max: 1 }) < 0.7,
      hasEmptyMeasurements: faker.number.float({ min: 0, max: 1 }) < 0.05,
      profileNote:
        faker.number.float({ min: 0, max: 1 }) < 0.2
          ? PROFILE_NOTES[
              faker.number.int({ min: 0, max: PROFILE_NOTES.length - 1 })
            ]
          : null,
      callNotes:
        faker.number.float({ min: 0, max: 1 }) < 0.15
          ? CALL_NOTES[
              faker.number.int({ min: 0, max: CALL_NOTES.length - 1 })
            ]
          : null,
      ordersReturned: faker.number.int({ min: 0, max: Math.min(2, totalOrders) }),
      itemsAltered: faker.number.int({ min: 0, max: Math.min(3, totalOrders) }),
      activeAlterations: faker.number.int({ min: 0, max: 1 }),
      createdAt: createdDate,
    })
  }

  // Link a couple of spouse accounts
  if (customers.length >= 4) {
    customers[2].spouseAccountId = customers[3].id
    customers[3].spouseAccountId = customers[2].id
  }

  return customers
}
