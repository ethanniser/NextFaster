// eslint-disable-next-line @typescript-eslint/no-unused-vars
const artSuppliesForArm = [
  {
    name: "Drawing and Sketching",
    categories: [
      "Graphite Pencils",
      "Charcoal Pencils & Sticks",
      "Colored Pencils",
      "Mechanical Pencils",
      "Pastels (Soft, Oil, and Hard)",
      "Erasers (Kneaded, Vinyl, Precision Tip)",
      "Pencil Sharpeners (Manual, Electric)",
      "Sketchpads (Various sizes and paper weights)",
      "Blending Stumps/Tortillons",
      "Rulers and Protractors",
    ],
  },
  {
    name: "Painting Supplies",
    categories: [
      "Acrylic Paints (Basic and Professional Grades)",
      "Watercolor Paints (Pans, Tubes)",
      "Oil Paints",
      "Gouache Paints",
      "Fabric Paints",
      "Brushes (Round, Flat, Filbert, Fan, etc.)",
      "Canvas (Stretched, Canvas Boards, Canvas Rolls)",
      "Painting Palettes (Wood, Plastic, Disposable)",
      "Palette Knives",
      "Easels (Tabletop, Standing)",
      "Watercolor Paper (Cold Press, Hot Press)",
    ],
  },
  {
    name: "Ink and Calligraphy",
    categories: [
      "Ink Pens (Dip Pens, Brush Pens, Fountain Pens)",
      "India Ink, Colored Inks",
      "Calligraphy Nibs and Holders",
      "Brush Calligraphy Sets",
      "Ink Blotting Papers",
      "Markers (Alcohol-based, Water-based, Permanent)",
      "Brush Pens (Fine Tip, Broad Tip)",
      "Bullet Journals and Specialty Notebooks",
    ],
  },
  {
    name: "Craft Supplies",
    categories: [
      "Crafting Glue (Hot Glue, PVA, Mod Podge)",
      "Craft Scissors",
      "Decorative Papers (Origami Paper, Scrapbooking Paper)",
      "Craft Foam Sheets",
      "Beads, Buttons, Sequins",
      "Feathers, Felt, and Fabric Scraps",
      "Cutting Mats",
      "X-Acto Knives",
      "Stencils (Alphabet, Geometric Shapes)",
    ],
  },
  {
    name: "Printmaking and Stamping",
    categories: [
      "Linoleum Blocks",
      "Carving Tools",
      "Brayers",
      "Ink for Block Printing",
      "Rubber Stamps",
      "Ink Pads (Various Colors)",
      "Screen Printing Kits",
    ],
  },
  {
    name: "Sculpting and Model Making",
    categories: [
      "Polymer Clay (FIMO, Sculpey)",
      "Air-Dry Clay",
      "Pottery Clay",
      "Sculpting Tools",
      "Wire Armature",
      "Modeling Foam",
      "Molds and Casting Materials",
      "Plaster of Paris",
    ],
  },
  {
    name: "Miscellaneous Tools and Accessories",
    categories: [
      "Art Aprons and Smocks",
      "Storage Boxes for Supplies",
      "Brush Cleaner Solutions",
      "Pencil Cases",
      "Portfolios and Presentation Cases",
      "Spray Fixatives",
      "Masking Tape and Artist’s Tape",
      "Measuring Tape",
      "Lightboxes for Tracing",
    ],
  },
];

export const artSupplies = [
  {
    collectionName: "Painting Supplies",
    categories: [
      {
        categoryName: "Acrylic Paints (Basic and Professional Grades)",
        icon: "/images/acrylic-paint-icon.png",
        categoryItems: [
          {
            subCollectionName: "Basic Acrylic Paints",
            subcategories: [
              {
                subcategoryName: "Student Grade",
                products: [
                  {
                    name: "Basics Acrylic Paint Set",
                    description:
                      "A set of 10 vibrant acrylic paints perfect for beginners and students.",
                    price: 19.99,
                    highlights: [
                      "Includes 10 colors: Red, Yellow, Blue, Green, Black, White, and more.",
                      "Non-toxic and water-based for easy clean-up.",
                      "Ideal for canvas, paper, and wood projects.",
                    ],
                  },
                  {
                    name: "Liquitex Basics Acrylic Paint",
                    description:
                      "High-quality, student-grade acrylic paint with smooth consistency.",
                    price: 8.99,
                    highlights: [
                      "Available in 118ml tubes, ideal for both students and hobbyists.",
                      "Highly pigmented for vibrant colors.",
                      "Fast-drying and flexible once dry.",
                    ],
                  },
                  {
                    name: "Daler-Rowney System 3 Acrylic Paint",
                    description:
                      "Affordable, versatile acrylic paint suitable for various surfaces.",
                    price: 7.5,
                    highlights: [
                      "Available in a wide range of colors.",
                      "Water-soluble and easy to blend.",
                      "Perfect for indoor and outdoor projects.",
                    ],
                  },
                  {
                    name: "Golden Heavy Body Acrylic Paint",
                    description:
                      "Professional-grade acrylic paint known for its thick, buttery texture.",
                    price: 12.5,
                    highlights: [
                      "Excellent pigment load for vibrant and intense colors.",
                      "Retains brush strokes and marks, perfect for textured painting.",
                      "Highly durable and flexible when dry.",
                    ],
                  },
                  {
                    name: "Winsor & Newton Galeria Acrylic Paint",
                    description:
                      "A high-quality acrylic paint range designed for students and beginners.",
                    price: 10.99,
                    highlights: [
                      "Smooth consistency for easy application.",
                      "Fast-drying and ideal for layering techniques.",
                      "Compatible with a variety of mediums and surfaces.",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
