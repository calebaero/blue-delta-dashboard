import { faker } from "@faker-js/faker"
import type { FabricRoll, HardwareItem, RollStatus } from "./types"

interface RollSpec {
  color: string
  family: "Raw Denim" | "Cotton Chino" | "Performance" | "Cashiers Collection"
  weightOz: number
  composition: string
  suppliers: string[]
  widthMin: number
  widthMax: number
  shrinkWarpMin: number
  shrinkWarpMax: number
  shrinkWeftMin: number
  shrinkWeftMax: number
}

const rawDenimColors = [
  "Dark Indigo",
  "Smooth Indigo",
  "Natural Indigo",
  "Postman Blue",
  "Steel Gray",
  "Cast Gray",
  "Charcoal",
  "Super Black",
]

const chinoColors = [
  "Banana Olive",
  "British Khaki",
  "Harbor Gray",
  "Powder Blue",
  "Stone",
  "Moss",
  "Terracotta",
  "Navy",
  "Cream",
  "Slate",
]

const performanceColors = [
  "Indigo",
  "Black",
  "Charcoal",
  "Khaki",
  "Navy",
  "Olive",
  "Steel",
  "Stone",
  "White",
  "Harbor",
]

const cashiersColors = [
  "Dark Blue",
  "Graphite",
  "Forest",
  "Buckskin Brown",
  "White",
]

function buildSpecs(): RollSpec[] {
  const specs: RollSpec[] = []
  for (const color of rawDenimColors) {
    specs.push({
      color,
      family: "Raw Denim",
      weightOz: 9.5,
      composition: "75% Cotton / 25% Elastane",
      suppliers: ["Cone Mills", "Kaihara"],
      widthMin: 32,
      widthMax: 36,
      shrinkWarpMin: 0.03,
      shrinkWarpMax: 0.05,
      shrinkWeftMin: 0.04,
      shrinkWeftMax: 0.07,
    })
  }
  // Take 5 chinos to keep near 28 total
  for (const color of chinoColors.slice(0, 5)) {
    specs.push({
      color,
      family: "Cotton Chino",
      weightOz: 9,
      composition: "63% Cotton / 35% EcoVero Viscose / 2% Elastane",
      suppliers: ["Candiani", "ISKO"],
      widthMin: 56,
      widthMax: 60,
      shrinkWarpMin: 0.02,
      shrinkWarpMax: 0.03,
      shrinkWeftMin: 0.03,
      shrinkWeftMax: 0.05,
    })
  }
  // Take 5 performance
  for (const color of performanceColors.slice(0, 5)) {
    specs.push({
      color,
      family: "Performance",
      weightOz: 8,
      composition: "50% Cotton / 47% Nylon / 3% Spandex",
      suppliers: ["ISKO", "Burlington"],
      widthMin: 58,
      widthMax: 62,
      shrinkWarpMin: 0.01,
      shrinkWarpMax: 0.02,
      shrinkWeftMin: 0.02,
      shrinkWeftMax: 0.03,
    })
  }
  for (const color of cashiersColors) {
    specs.push({
      color,
      family: "Cashiers Collection",
      weightOz: 12.6,
      composition: "98% Cotton / 2% Elastane",
      suppliers: ["Cone Mills"],
      widthMin: 34,
      widthMax: 36,
      shrinkWarpMin: 0.05,
      shrinkWarpMax: 0.08,
      shrinkWeftMin: 0.06,
      shrinkWeftMax: 0.1,
    })
  }
  return specs
}

export function generateFabricRolls(): FabricRoll[] {
  faker.seed(4201)

  const specs = buildSpecs()
  const racks = ["A", "B", "C", "D", "E", "F"]
  const rolls: FabricRoll[] = []

  // Indices that will be quarantined
  const quarantineIndices = new Set([3, 18])
  // Indices that will be critically low
  const criticalIndices = new Set([7, 14, 22])

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    const supplier =
      spec.suppliers[faker.number.int({ min: 0, max: spec.suppliers.length - 1 })]
    const initialYards = faker.number.int({ min: 50, max: 120 })
    const reorderPoint = faker.number.int({ min: 15, max: 25 })

    let currentYards: number
    if (criticalIndices.has(i)) {
      currentYards = faker.number.float({ min: 0.5, max: 3, fractionDigits: 1 })
    } else if (i % 5 === 0) {
      // Some rolls low
      currentYards = faker.number.float({
        min: reorderPoint * 0.4,
        max: reorderPoint * 1.0,
        fractionDigits: 1,
      })
    } else {
      currentYards = faker.number.float({
        min: reorderPoint * 1.2,
        max: initialYards * 0.95,
        fractionDigits: 1,
      })
    }
    currentYards = parseFloat(currentYards.toFixed(1))

    let status: RollStatus
    if (quarantineIndices.has(i)) {
      status = "Quarantine"
      currentYards = parseFloat(
        faker.number.float({ min: 20, max: 60, fractionDigits: 1 }).toFixed(1)
      )
    } else if (currentYards <= 3) {
      status = "Depleted"
    } else if (currentYards <= reorderPoint) {
      status = "Low"
    } else {
      status = "Active"
    }

    const rack = racks[faker.number.int({ min: 0, max: racks.length - 1 })]
    const rackNum = faker.number.int({ min: 1, max: 8 })
    const bay = faker.number.int({ min: 1, max: 4 })

    const yearSuffix = faker.number.int({ min: 24, max: 25 })
    const lotNum = faker.number.int({ min: 100, max: 999 })

    rolls.push({
      id: `ROLL-${String(i + 1).padStart(4, "0")}`,
      materialName: `${spec.weightOz}oz ${supplier} ${spec.family === "Raw Denim" ? "Selvedge" : spec.family} - ${spec.color}`,
      fabricFamily: spec.family,
      color: spec.color,
      weightOz: spec.weightOz,
      composition: spec.composition,
      supplier,
      batchDyeLot: `DL-20${yearSuffix}-${String(lotNum).padStart(4, "0")}`,
      widthInches: faker.number.int({ min: spec.widthMin, max: spec.widthMax }),
      shrinkageWarpPct: parseFloat(
        faker.number.float({ min: spec.shrinkWarpMin, max: spec.shrinkWarpMax, fractionDigits: 3 }).toFixed(3)
      ),
      shrinkageWeftPct: parseFloat(
        faker.number.float({ min: spec.shrinkWeftMin, max: spec.shrinkWeftMax, fractionDigits: 3 }).toFixed(3)
      ),
      initialYards,
      currentYards,
      reorderPointYards: reorderPoint,
      costPerYard: parseFloat(
        faker.number.float({ min: 12.5, max: 45, fractionDigits: 2 }).toFixed(2)
      ),
      location: `Rack ${rack}-${rackNum}, Bay ${bay}`,
      status,
      receivedDate: faker.date
        .between({ from: "2024-06-01", to: "2025-12-01" })
        .toISOString()
        .split("T")[0],
      notes: quarantineIndices.has(i)
        ? "Quality hold — dye lot inconsistency under review"
        : null,
    })
  }

  return rolls
}

export function generateHardware(): HardwareItem[] {
  const items: {
    name: string
    type: HardwareItem["type"]
    variant: string
    stock: number
    reorder: number
    bom: number
    cost: number
  }[] = [
    { name: "YKK #5 Brass Zipper", type: "Zipper", variant: "Brass", stock: 800, reorder: 200, bom: 1, cost: 3.25 },
    { name: "YKK #5 Nickel Zipper", type: "Zipper", variant: "Nickel", stock: 350, reorder: 200, bom: 1, cost: 3.5 },
    { name: "Main Button - Brass", type: "Main Button", variant: "Brass", stock: 600, reorder: 150, bom: 1, cost: 1.75 },
    { name: "Main Button - Nickel", type: "Main Button", variant: "Nickel", stock: 400, reorder: 150, bom: 1, cost: 1.85 },
    { name: "Main Button - Antique Brass", type: "Main Button", variant: "Antique Brass", stock: 250, reorder: 150, bom: 1, cost: 2.0 },
    { name: "Bar-Tack Rivet Positions", type: "Rivet", variant: "Bar-Tack", stock: 5000, reorder: 1000, bom: 6, cost: 0.15 },
    { name: "Snap - Brass", type: "Snap", variant: "Brass", stock: 300, reorder: 100, bom: 2, cost: 0.95 },
    { name: "Snap - Nickel", type: "Snap", variant: "Nickel", stock: 200, reorder: 100, bom: 2, cost: 1.0 },
    { name: "Belt Buckle - Brass", type: "Buckle", variant: "Brass", stock: 150, reorder: 50, bom: 1, cost: 8.5 },
    { name: "Belt Buckle - Nickel", type: "Buckle", variant: "Nickel", stock: 100, reorder: 50, bom: 1, cost: 9.0 },
  ]

  const racks = ["G", "H"]
  return items.map((item, i) => {
    const status: HardwareItem["status"] =
      item.stock <= 0
        ? "Out of Stock"
        : item.stock <= item.reorder
          ? "Low"
          : "In Stock"

    return {
      id: `HW-${String(i + 1).padStart(4, "0")}`,
      name: item.name,
      type: item.type,
      variant: item.variant,
      supplier: item.type === "Zipper" ? "YKK USA" : "Tennessee Brass Works",
      currentStock: item.stock,
      reorderPoint: item.reorder,
      costPerUnit: item.cost,
      bomQuantityPerJean: item.bom,
      location: `Rack ${racks[i % 2]}-${Math.floor(i / 2) + 1}, Bay 1`,
      status,
    }
  })
}
