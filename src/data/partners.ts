import { faker } from "@faker-js/faker"
import type { Partner, PartnerRep } from "./types"

export function generatePartners(): Partner[] {
  faker.seed(42)

  return [
    {
      id: "PART-0001",
      name: "Tom James Company",
      type: "Clothier",
      contactEmail: "bdj-partnership@tomjames.com",
      contactPhone: "(214) 555-0100",
      address: {
        street: "1450 Commerce St, Suite 800",
        city: "Dallas",
        state: "TX",
        zip: "75201",
        country: "US",
      },
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      accountSince: "2019-03-15",
      paymentTerms: "Net 30",
      notes:
        "Largest B2B partner. Quarterly business reviews. Primary contact is VP of Custom Programs.",
    },
    {
      id: "PART-0002",
      name: "Nordstrom Personal Styling",
      type: "Retailer",
      contactEmail: "custom-partners@nordstrom.com",
      contactPhone: "(206) 555-0200",
      address: {
        street: "1700 Seventh Avenue",
        city: "Seattle",
        state: "WA",
        zip: "98101",
        country: "US",
      },
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      accountSince: "2023-06-01",
      paymentTerms: "Net 60",
      notes:
        "Pilot program with personal styling division. Currently active in 5 flagship locations.",
    },
    {
      id: "PART-0003",
      name: "Goldman Sachs Corporate Gifting",
      type: "Corporate",
      contactEmail: "corporate-gifts@gs.com",
      contactPhone: "(212) 555-0300",
      address: {
        street: "200 West Street",
        city: "New York",
        state: "NY",
        zip: "10282",
        country: "US",
      },
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      accountSince: "2022-09-10",
      paymentTerms: "Net 30",
      notes:
        "Seasonal gifting program for managing directors. Large batch orders in Q4.",
    },
    {
      id: "PART-0004",
      name: "Soho House Members Club",
      type: "Corporate",
      contactEmail: "partnerships@sohohouse.com",
      contactPhone: "(310) 555-0400",
      address: {
        street: "9200 Sunset Blvd",
        city: "Los Angeles",
        state: "CA",
        zip: "90069",
        country: "US",
      },
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      accountSince: "2024-01-20",
      paymentTerms: "Net 45",
      notes:
        "Member benefit program. Pop-up measurement events at LA, NYC, and Miami houses.",
    },
    {
      id: "PART-0005",
      name: "J. Hilburn Custom Clothiers",
      type: "Clothier",
      contactEmail: "denim-program@jhilburn.com",
      contactPhone: "(214) 555-0500",
      address: {
        street: "3100 Monticello Ave, Suite 500",
        city: "Dallas",
        state: "TX",
        zip: "75205",
        country: "US",
      },
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      accountSince: "2021-11-05",
      paymentTerms: "Net 30",
      notes:
        "Denim add-on program for their custom suiting clients. Growing steadily.",
    },
  ]
}

export function generatePartnerReps(partners: Partner[]): PartnerRep[] {
  faker.seed(4200)

  const territories = [
    "Southeast US",
    "Northeast US",
    "Midwest US",
    "Southwest US",
    "West Coast",
  ]

  const repConfigs: {
    partnerId: string
    count: number
    avgOrders: number
  }[] = [
    { partnerId: "PART-0001", count: 8, avgOrders: 45 },
    { partnerId: "PART-0002", count: 5, avgOrders: 20 },
    { partnerId: "PART-0003", count: 4, avgOrders: 15 },
    { partnerId: "PART-0004", count: 3, avgOrders: 10 },
    { partnerId: "PART-0005", count: 5, avgOrders: 25 },
  ]

  const reps: PartnerRep[] = []
  let repIndex = 1

  for (const config of repConfigs) {
    const partner = partners.find((p) => p.id === config.partnerId)!
    for (let i = 0; i < config.count; i++) {
      const firstName = faker.person.firstName("male")
      const lastName = faker.person.lastName()
      const totalOrders =
        config.avgOrders + faker.number.int({ min: -15, max: 20 })
      const totalRevenue = totalOrders * 450 + faker.number.int({ min: -500, max: 2000 })
      const emailDomain = partner.name
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .slice(0, 12)

      reps.push({
        id: `REP-${String(repIndex).padStart(4, "0")}`,
        partnerId: config.partnerId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}.com`,
        phone: faker.phone.number({ style: "national" }),
        territory: territories[i % territories.length],
        totalOrders: Math.max(totalOrders, 3),
        totalRevenue: Math.max(totalRevenue, 1350),
        averageReturnRate: parseFloat(
          (faker.number.float({ min: 2, max: 12, fractionDigits: 1 })).toFixed(1)
        ),
      })
      repIndex++
    }
  }

  return reps
}
