import chicken from "@/assets/p-chicken.jpg";
import mutton from "@/assets/Mutton pickle.png";
import fish from "@/assets/p-fish.jpg";
import dryfish from "@/assets/Dry fish pickle.png";
import prawn from "@/assets/prawn pickle.png";
import cpodi from "@/assets/chicken idli powder.png";
import prawnPodi from "@/assets/prawn-podi.png";

export type Flavour = {
  slug: string;
  name: string;
  tagline: string;
  heat: 1 | 2 | 3 | 4 | 5;
  price: number;
  price300g?: number;
  weight: string;
  image: string;
  notes: string[];
  story: string;
};

export const flavours: Flavour[] = [
  {
    slug: "chicken",
    name: "Chicken Pickle",
    tagline: "The Crowd-Pleaser",
    heat: 3,
    price: 130,
    price300g: 350,
    weight: "100g",
    image: chicken,
    notes: ["Country chicken", "Sesame oil", "Curry leaf"],
    story: "Boneless thigh, slow-fried in cold-pressed sesame oil till the spices halo it.",
  },
  {
    slug: "mutton",
    name: "Mutton Pickle",
    tagline: "The Heavyweight",
    heat: 4,
    price: 250,
    price300g: 700,
    weight: "100g",
    image: mutton,
    notes: ["Tender goat", "Black pepper", "Tamarind"],
    story: "Twelve-hour braise of hill-grazed goat, finished with toasted black pepper.",
  },
  {
    slug: "fish",
    name: "Andhra Fish Pickle",
    tagline: "The Coastal Storm",
    heat: 5,
    price: 130,
    price300g: 350,
    weight: "100g",
    image: fish,
    notes: ["Seer fish", "Guntur chili", "Mustard"],
    story: "Boneless seer fish meets the legendary Guntur chili. Wear a bib.",
  },
  {
    slug: "dry-fish",
    name: "Dry Fish Pickle",
    tagline: "The Cult Classic",
    heat: 4,
    price: 130,
    price300g: 350,
    weight: "100g",
    image: dryfish,
    notes: ["Sun-dried catch", "Garlic", "Tamarind"],
    story: "Sun-dried for 3 days on the Konkan coast. Funky, deep, unforgettable.",
  },
  {
    slug: "prawn",
    name: "Prawn Pickle",
    tagline: "The Ocean Whisper",
    heat: 3,
    price: 230,
    price300g: 600,
    weight: "100g",
    image: prawn,
    notes: ["Tiger prawns", "Mustard oil", "Fenugreek"],
    story: "Plump tiger prawns, butter-soft, pickled in pungent mustard oil.",
  },
  {
    slug: "chicken-podi",
    name: "Chicken Idly Podi",
    tagline: "The Morning Riot",
    heat: 2,
    price: 150,
    weight: "100g",
    image: cpodi,
    notes: ["Roasted chicken", "Lentils", "Dry chili"],
    story: "Sun-dried roasted chicken pounded with toasted lentils. Pour over hot ghee.",
  },
  {
    slug: "prawn-podi",
    name: "Prawn Idly Podi",
    tagline: "Authentic & Flavorful",
    heat: 3,
    price: 120,
    weight: "100g",
    image: prawnPodi,
    notes: ["Prawn", "Roasted Gram", "Garlic"],
    story: "Savor the rich coastal taste with our Prawn Idly Podi - a spicy, prawn-spiced blend made from premium prawns and traditional South spices.",
  },
];
