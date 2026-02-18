import type { Product } from "./types"

export function generateProducts(): Product[] {
  return [
    {
      id: "PROD-0001",
      name: "Custom Raw Denim Jean",
      category: "Pants",
      basePrice: 450,
      description:
        "Handcrafted from premium raw selvedge denim, built to develop a unique patina over time. Each pair is cut from a single bolt and constructed to your exact measurements.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Pocket Style",
        "Hardware Finish",
        "Hem Style",
        "Belt Loop Style",
      ],
    },
    {
      id: "PROD-0002",
      name: "Custom Chino",
      category: "Pants",
      basePrice: 450,
      description:
        "Versatile custom chinos made from a luxurious EcoVero viscose blend. Softer hand-feel with structured drape — equally at home in the boardroom or at brunch.",
      fabricFamily: "Cotton Chino",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Pocket Style",
        "Hardware Finish",
        "Hem Style",
      ],
    },
    {
      id: "PROD-0003",
      name: "Custom Performance Jean",
      category: "Pants",
      basePrice: 450,
      description:
        "Engineered for all-day comfort with a cotton-nylon-spandex blend that stretches, breathes, and recovers. The look of denim with the performance of athletic wear.",
      fabricFamily: "Performance",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Pocket Style",
        "Hardware Finish",
        "Hem Style",
      ],
    },
    {
      id: "PROD-0004",
      name: "Cashiers Collection Jean",
      category: "Pants",
      basePrice: 450,
      description:
        "Our heavyweight heritage jean. Named after our mountain retreat, the Cashiers Collection uses 12.6 oz selvedge denim that ages beautifully over years of wear.",
      fabricFamily: "Cashiers Collection",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Pocket Style",
        "Hardware Finish",
        "Hem Style",
        "Belt Loop Style",
      ],
    },
    {
      id: "PROD-0005",
      name: "Denim Trucker Jacket",
      category: "Jacket",
      basePrice: 525,
      description:
        "A modern take on the classic trucker, custom-fit from our raw selvedge denim. Tailored through the body with room in the shoulders for layering.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Hardware Finish",
        "Lining",
      ],
    },
    {
      id: "PROD-0006",
      name: "Chore Coat",
      category: "Jacket",
      basePrice: 575,
      description:
        "Inspired by classic French workwear, our chore coat features patch pockets, a relaxed silhouette, and the signature Blue Delta construction quality.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Hardware Finish",
        "Lining",
        "Pocket Configuration",
      ],
    },
    {
      id: "PROD-0007",
      name: "Lined Rancher Jacket",
      category: "Jacket",
      basePrice: 600,
      description:
        "Our premium outerwear piece. A structured denim jacket with blanket lining, corduroy collar, and hand-finished details throughout.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Thread Color",
        "Monogram",
        "Hardware Finish",
        "Lining Material",
        "Collar Style",
      ],
    },
    {
      id: "PROD-0008",
      name: "Custom Leather Belt",
      category: "Belt",
      basePrice: 200,
      description:
        "Full-grain leather belt with custom hardware and optional monogram. Designed to complement our jeans and available in multiple widths.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Buckle Style",
        "Hardware Finish",
        "Monogram",
        "Width",
      ],
    },
    {
      id: "PROD-0009",
      name: "Monogrammed Pocket Square",
      category: "Accessory",
      basePrice: 75,
      description:
        "Hand-cut selvedge denim pocket square with custom monogram embroidery. A distinctive accessory that showcases the raw edge of our heritage fabrics.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: ["Monogram", "Thread Color", "Fabric Selection"],
    },
    {
      id: "PROD-0010",
      name: "Custom Denim Apron",
      category: "Accessory",
      basePrice: 150,
      description:
        "A chef-grade apron cut from our selvedge denim with adjustable leather straps and custom pocket configuration. Perfect for the kitchen or workshop.",
      fabricFamily: "Raw Denim",
      isActive: true,
      customizationOptions: [
        "Monogram",
        "Thread Color",
        "Pocket Layout",
        "Strap Style",
      ],
    },
  ]
}
