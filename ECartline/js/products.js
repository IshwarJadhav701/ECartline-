/* ===== Product database (49 products with dedicated photos) ===== */
const categories = ["Mobiles","Electronics","Fashion","Footwear","Home & Kitchen","Sports","Beauty","Toys","Furniture","Outdoor","Bags","Accessories"];
const u = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

const rawProducts = [
  [
    "Noise ColorFit Pro 4 Smartwatch",
    "Electronics",
    1299,
    2099,
    4.4,
    8765,
    "Bright AMOLED display smart watch with Bluetooth calling, 100+ sports modes and 7-day battery.",
    [
      "1508685096489-7aacd43bd3b1",
      "1579586337278-3befd40fd17a",
      "1546868871-7041f2a55e12"
    ]
  ],
  [
    "boAt Rockerz 450 Headphones",
    "Electronics",
    1499,
    3990,
    4.3,
    52310,
    "Wireless over-ear headphones with 40mm drivers and up to 15 hours playback.",
    [
      "1505740420928-5e560c06d30e",
      "1583394838336-acd977736f90",
      "1484704849700-f032a568e944"
    ]
  ],
  [
    "JBL Flip Bluetooth Speaker",
    "Electronics",
    7999,
    9999,
    4.6,
    12450,
    "Portable waterproof speaker with powerful bass and 12 hours of playtime.",
    [
      "1545454675-3531b543be5d",
      "1608043152269-423dbba4e7e1",
      "1508700115892-45ecd05ae2ad"
    ]
  ],
  [
    "HP 15 Laptop 8GB/512GB",
    "Electronics",
    42990,
    52000,
    4.2,
    3210,
    "Thin and light laptop for work and study with fast SSD storage.",
    [
      "1496181133206-80ce9b88a853",
      "1517336714731-489689fd1ca8",
      "1588872657578-7efd1f1555ed"
    ]
  ],
  [
    "Redmi Note 13 5G",
    "Mobiles",
    16999,
    21999,
    4.3,
    21876,
    "6.67-inch AMOLED display, 108MP camera and all-day battery life.",
    [
      "1598327105666-5b89351aff97",
      "1511707171634-5f897ff02aa9",
      "1592750475338-74b7b21085ab"
    ]
  ],
  [
    "Samsung Galaxy M35 5G",
    "Mobiles",
    18999,
    24999,
    4.4,
    9840,
    "Super AMOLED screen with 6000mAh battery and 50MP triple camera.",
    [
      "1610945265064-0e34e5519bbf",
      "1598327105666-5b89351aff97",
      "1580910051074-3eb694886505"
    ]
  ],
  [
    "realme Narzo 70 5G",
    "Mobiles",
    12999,
    16999,
    4.2,
    15620,
    "120Hz display, Dimensity chipset and fast charging smartphone.",
    [
      "1565849904461-04a58ad377e0",
      "1511707171634-5f897ff02aa9",
      "1592750475338-74b7b21085ab"
    ]
  ],
  [
    "OnePlus Nord CE4",
    "Mobiles",
    24999,
    26999,
    4.5,
    7420,
    "Snapdragon processor, 100W charging and smooth fluid display.",
    [
      "1592750475338-74b7b21085ab",
      "1565849904461-04a58ad377e0",
      "1511707171634-5f897ff02aa9"
    ]
  ],
  [
    "Men's Cotton Casual Shirt",
    "Fashion",
    799,
    1599,
    4.1,
    6540,
    "Breathable regular-fit cotton shirt for everyday wear.",
    [
      "1596755094514-f87e34085b2c",
      "1602810318383-e386cc2a3ccf",
      "1521572267360-ee0c2909d518"
    ]
  ],
  [
    "Women's Floral Kurti",
    "Fashion",
    649,
    1299,
    4.2,
    11230,
    "Soft rayon kurti with elegant floral print and comfortable fit.",
    [
      "1583391733956-3750e0ff4e8b",
      "1617627143750-d86bc21e42bb",
      "1572804013309-59a88b7e92f1"
    ]
  ],
  [
    "Slim Fit Stretch Denim Jeans",
    "Fashion",
    1199,
    2499,
    4,
    9870,
    "Stretchable denim jeans with a modern slim fit.",
    [
      "1541099649105-f69ad21f3246",
      "1542272604-787c3835535d",
      "1604176354204-9268737828e4"
    ]
  ],
  [
    "Classic Analog Watch for Men",
    "Fashion",
    2499,
    4999,
    4.4,
    4320,
    "Stainless steel strap watch with a premium dial and water resistance.",
    [
      "1524805444758-089113d48a6d",
      "1522335789203-aabd1fc54bc9",
      "1533139502658-0198f920d8e8"
    ]
  ],
  [
    "Pro Running Shoes",
    "Footwear",
    2199,
    3999,
    4.3,
    18760,
    "Lightweight cushioned running shoes with breathable mesh.",
    [
      "1542291026-7eec264c27ff",
      "1551107696-a4b085a6d91a",
      "1515955656352-a1fa3ffcd111"
    ]
  ],
  [
    "Casual White Sneakers",
    "Footwear",
    1499,
    2999,
    4.1,
    13400,
    "Everyday sneakers with durable sole and clean minimalist look.",
    [
      "1595950653106-6c9ebd614d3a",
      "1560769629-975ec94e6a86",
      "1525966222134-fcfa99b8ae77"
    ]
  ],
  [
    "Leather Formal Shoes",
    "Footwear",
    2799,
    4499,
    4.2,
    5210,
    "Genuine leather formal shoes with comfortable insole.",
    [
      "1614252235316-8c857d38b5f4",
      "1533867617858-e7b97e060509",
      "1560343090-f0409e92791a"
    ]
  ],
  [
    "Non-Stick Cookware Set (5 pcs)",
    "Home & Kitchen",
    1899,
    3499,
    4.3,
    14320,
    "Induction-friendly non-stick cookware set with cool-touch handles.",
    [
      "1584269600464-37b1b58a9fe7",
      "1584990347449-74d1a5113941",
      "1556911220-e15b29be8c8f"
    ]
  ],
  [
    "Mixer Grinder 750W",
    "Home & Kitchen",
    3299,
    4999,
    4.4,
    28900,
    "Powerful 3-jar mixer grinder for wet and dry grinding.",
    [
      "1570222094114-d054a817e56b",
      "1585515320310-259814833e62",
      "1540420773420-3366772f4999"
    ]
  ],
  [
    "Digital Air Fryer 4L",
    "Home & Kitchen",
    4999,
    8999,
    4.5,
    16780,
    "Cook crispy food with up to 90% less oil using rapid air technology.",
    [
      "1556911220-e15b29be8c8f",
      "1585515320310-259814833e62",
      "1570222094114-d054a817e56b"
    ]
  ],
  [
    "Cotton Double Bedsheet Set",
    "Home & Kitchen",
    699,
    1499,
    4.1,
    22100,
    "Soft 144 TC cotton bedsheet with two pillow covers.",
    [
      "1522771739844-6a9f6d5f14af",
      "1584100936595-c0654b55a2e2",
      "1598928506311-c55ded91a20c"
    ]
  ],
  [
    "Anti-Skid Yoga Mat 6mm",
    "Sports",
    599,
    1299,
    4.4,
    19450,
    "Extra thick eco-friendly yoga mat with carry strap.",
    [
      "1601925260368-ae2f83cf8b7f",
      "1571019613454-1cb2f99b2d8b",
      "1518611012118-696072aa579a"
    ]
  ],
  [
    "Kashmir Willow Cricket Bat",
    "Sports",
    2999,
    4500,
    4.2,
    2310,
    "Well-balanced full size cricket bat for leather ball play.",
    [
      "1531415074868-036b107e775a",
      "1540747913346-19e32dc3e97e",
      "1587280501635-68a0e82cd5ff"
    ]
  ],
  [
    "Adjustable Dumbbell Set 20kg",
    "Sports",
    3499,
    5999,
    4.3,
    6780,
    "Home gym adjustable dumbbells with anti-slip grip.",
    [
      "1584735935682-2f2b69dff9d2",
      "1517836357463-d25dfeac3438",
      "1534438327276-14e5300c3a48"
    ]
  ],
  [
    "Training Football Size 5",
    "Sports",
    799,
    1299,
    4,
    5430,
    "Durable machine-stitched football for practice and matches.",
    [
      "1552667466-07770ae110d0",
      "1614632537423-1e6c2e7e0aab",
      "1574629810360-7efbbe195018"
    ]
  ],
  [
    "Vitamin C Face Serum 30ml",
    "Beauty",
    499,
    899,
    4.3,
    34560,
    "Brightening serum for glowing and even-toned skin.",
    [
      "1620916566398-39f1143ab7be",
      "1512496015851-a90fb38ba796",
      "1608248597359-5735b5a2bfbc"
    ]
  ],
  [
    "Matte Lipstick Combo (Set of 6)",
    "Beauty",
    699,
    1399,
    4.1,
    12980,
    "Long-lasting creamy matte lipsticks in trending shades.",
    [
      "1586495777744-4413f21062fa",
      "1596462502278-27bfdc403348",
      "1512496015851-a90fb38ba796"
    ]
  ],
  [
    "Professional Hair Dryer 2000W",
    "Beauty",
    1299,
    2499,
    4.2,
    8760,
    "Fast-drying hair dryer with cool shot and 3 heat settings.",
    [
      "1522337360788-8b13dee7a37e",
      "1585751119414-ef2636f8aede",
      "1527799820374-dcf8d9d4a388"
    ]
  ],
  [
    "Building Blocks Set 500 pcs",
    "Toys",
    899,
    1799,
    4.5,
    9870,
    "Creative colourful blocks to build and learn for kids 5+.",
    [
      "1587654780291-39c9404d746b",
      "1566576912321-d58ddd7a6088",
      "1558060370-d644479cb6e7"
    ]
  ],
  [
    "Remote Control Racing Car",
    "Toys",
    1499,
    2999,
    4.1,
    6540,
    "Rechargeable high-speed RC car with sturdy suspension.",
    [
      "1594787318286-3d835c1d207f",
      "1581235720704-06d3acfcb36f",
      "1558060370-d644479cb6e7"
    ]
  ],
  [
    "Family Board Game Collection",
    "Toys",
    599,
    999,
    4.4,
    4120,
    "Fun board games set for family evenings and parties.",
    [
      "1610890716171-6b1bb98ffd09",
      "1632501641765-e568d28b0015",
      "1566576912321-d58ddd7a6088"
    ]
  ],
  [
    "Ergonomic Office Chair",
    "Furniture",
    6999,
    12999,
    4.3,
    7890,
    "Mesh back chair with lumbar support and adjustable height.",
    [
      "1580481077195-c22ae249911e",
      "1505797149-43b0069ec26b",
      "1589584649628-b80753a47990"
    ]
  ],
  [
    "Wooden Study Table",
    "Furniture",
    5499,
    8999,
    4.2,
    3450,
    "Sturdy engineered wood study desk with storage shelf.",
    [
      "1518455027359-f3f8164ba6bd",
      "1524758631624-e2822e304c36",
      "1595428774223-ef52624120d2"
    ]
  ],
  [
    "3-Seater Fabric Sofa",
    "Furniture",
    18999,
    29999,
    4.4,
    1890,
    "Comfortable modern sofa with high-density foam cushions.",
    [
      "1555041469-a586c61ea9bc",
      "1493663284031-b7e3aefcf1b7",
      "1586023492125-27b2c045efd7"
    ]
  ],
  [
    "2-Person Camping Tent",
    "Outdoor",
    3499,
    5999,
    4.3,
    5670,
    "Waterproof, easy set-up tent for trekking and weekend camping.",
    [
      "1504280390367-361c6d9f38f4",
      "1478131143081-80f7f84ca84d",
      "1445308394109-4ec2920981b1"
    ]
  ],
  [
    "Trekking Backpack 60L",
    "Outdoor",
    2499,
    4499,
    4.4,
    8120,
    "Rain-cover included rucksack with padded straps for long treks.",
    [
      "1622560480605-d83c853bc5c3",
      "1553062407-98eeb64c6a62",
      "1504280390367-361c6d9f38f4"
    ]
  ],
  [
    "Insulated Sleeping Bag",
    "Outdoor",
    1599,
    2999,
    4.1,
    3240,
    "Warm lightweight sleeping bag for cool outdoor nights.",
    [
      "1520072959219-c595dc870360",
      "1478131143081-80f7f84ca84d",
      "1504280390367-361c6d9f38f4"
    ]
  ],
  [
    "Laptop Backpack 30L",
    "Bags",
    999,
    2199,
    4.4,
    45670,
    "Water-resistant backpack with USB port and padded laptop sleeve.",
    [
      "1553062407-98eeb64c6a62",
      "1590874103328-eac38a683ce7",
      "1548036328-c9fa89d128fa"
    ]
  ],
  [
    "Travel Duffle Bag",
    "Bags",
    1799,
    3299,
    4.2,
    9870,
    "Spacious duffle with shoe compartment and shoulder strap.",
    [
      "1547949003-9792a18a2601",
      "1553062407-98eeb64c6a62",
      "1548036328-c9fa89d128fa"
    ]
  ],
  [
    "Casual Sling Bag",
    "Bags",
    599,
    1199,
    4,
    7650,
    "Compact crossbody sling bag for daily essentials.",
    [
      "1544816155-12df9643f363",
      "1548036328-c9fa89d128fa",
      "1590874103328-eac38a683ce7"
    ]
  ],
  [
    "Polarized Sunglasses",
    "Accessories",
    899,
    1999,
    4.3,
    15430,
    "UV400 polarized sunglasses with lightweight frame.",
    [
      "1511499767150-a48a237f0083",
      "1572635196237-14b3f281503f",
      "1524592094714-0f0654e20314"
    ]
  ],
  [
    "Genuine Leather Wallet",
    "Accessories",
    499,
    999,
    4.2,
    21340,
    "Slim RFID-safe wallet with multiple card slots.",
    [
      "1627123424574-724758594e93",
      "1572635196237-14b3f281503f",
      "1559563458-527698bf5295"
    ]
  ],
  [
    "Digital Sports Wrist Watch",
    "Accessories",
    1199,
    2299,
    4.1,
    6780,
    "Water-resistant digital watch with stopwatch and backlight.",
    [
      "1523275335684-37898b6baf30",
      "1546868871-7041f2a55e12",
      "1508685096489-7aacd43bd3b1"
    ]
  ],
  [
    "Samsung Galaxy S24 Ultra 5G",
    "Mobiles",
    129999,
    144999,
    4.8,
    18450,
    "Titanium frame, 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 with Galaxy AI, 200MP quad camera and built-in S-Pen.",
    [
      "1610945265064-0e34e5519bbf",
      "1580910051074-3eb694886505",
      "1598327105666-5b89351aff97"
    ]
  ],
  [
    "Samsung Galaxy S23 Ultra 5G",
    "Mobiles",
    89999,
    124999,
    4.7,
    32180,
    "200MP ultra-clear nightography camera, Snapdragon 8 Gen 2, 120Hz curved AMOLED display, 5000mAh battery and integrated S-Pen.",
    [
      "1580910051074-3eb694886505",
      "1610945265064-0e34e5519bbf",
      "1565849904461-04a58ad377e0"
    ]
  ],
  [
    "Apple iPhone 16 Pro Max",
    "Mobiles",
    144900,
    159900,
    4.9,
    14200,
    "Grade 5 titanium design with Camera Control, 48MP Fusion camera, A18 Pro chip, and industry-leading battery life.",
    [
      "1695048133142-1a20484d2569",
      "1510557880182-3d4d3cba35a5",
      "1592750475338-74b7b21085ab"
    ]
  ],
  [
    "Apple iPhone 16",
    "Mobiles",
    79900,
    84900,
    4.7,
    9640,
    "Aerospace-grade aluminum with Camera Control, 48MP 2-in-1 camera, Action button, and lightning-fast A18 processor.",
    [
      "1510557880182-3d4d3cba35a5",
      "1592750475338-74b7b21085ab",
      "1511707171634-5f897ff02aa9"
    ]
  ],
  [
    "Apple iPhone 15 Pro Max",
    "Mobiles",
    134900,
    154900,
    4.8,
    38200,
    "Forged in titanium with 6.7-inch Super Retina XDR, A17 Pro chip, Action button, and 5x optical zoom camera.",
    [
      "1695048133142-1a20484d2569",
      "1592750475338-74b7b21085ab",
      "1510557880182-3d4d3cba35a5"
    ]
  ],
  [
    "Apple iPhone 15",
    "Mobiles",
    65999,
    79900,
    4.6,
    54100,
    "Dynamic Island, 48MP main camera with 2x Telephoto, USB-C connector, and durable color-infused glass design.",
    [
      "1592750475338-74b7b21085ab",
      "1511707171634-5f897ff02aa9",
      "1565849904461-04a58ad377e0"
    ]
  ],
  [
    "Apple iPhone 14",
    "Mobiles",
    54999,
    69900,
    4.5,
    68300,
    "6.1-inch Super Retina XDR display, advanced dual-camera system with Photonic Engine and all-day battery life.",
    [
      "1511707171634-5f897ff02aa9",
      "1592750475338-74b7b21085ab",
      "1510557880182-3d4d3cba35a5"
    ]
  ],
  [
    "Apple iPhone 13",
    "Mobiles",
    47999,
    59900,
    4.6,
    95400,
    "Super Retina XDR OLED, A15 Bionic chip, Cinematic mode 1080p, and durable Ceramic Shield front.",
    [
      "1565849904461-04a58ad377e0",
      "1592750475338-74b7b21085ab",
      "1511707171634-5f897ff02aa9"
    ]
  ]
];

let products = rawProducts.map((r, i) => {
  const [name, category, price, oldPrice, rating, reviews, description, imageIds] = r;
  const pct = Math.round((oldPrice - price) / oldPrice * 100);
  return {
    id: i + 1,
    name,
    category,
    price,
    oldPrice,
    pct,
    discount: pct + "% OFF",
    rating,
    reviews,
    description,
    image: u(imageIds[0]),
    images: imageIds.map(u),
    inStock: true
  };
});

// Load the real product list from the backend (MySQL)
const productsReady = (async () => {
  try {
    const list = await fetchAllProducts();
    if (list && list.length) products = list;
  } catch (e) {
    console.warn("Backend not reachable - using built-in product list.", e.message);
  }

  // Apply any persistent product edits (e.g. edited product names, prices, descriptions)
  try {
    const overrides = JSON.parse(localStorage.getItem("ec_product_overrides") || "{}");
    products = products.map(p => {
      if (overrides[p.id]) {
        return { ...p, ...overrides[p.id] };
      }
      return p;
    });

    // Merge any newly added products
    const custom = JSON.parse(localStorage.getItem("ec_custom_products") || "[]");
    if (Array.isArray(custom)) {
      custom.forEach(cp => {
        const idx = products.findIndex(p => String(p.id) === String(cp.id));
        if (idx > -1) products[idx] = { ...products[idx], ...cp };
        else products.unshift(cp);
      });
    }
  } catch (e) {}
})();
