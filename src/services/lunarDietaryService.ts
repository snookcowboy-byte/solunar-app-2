import { MoonPhaseName } from '../types';

export interface DailyMealRecommendation {
  mealTime: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Night Bite';
  title: string;
  description: string;
  keyNutrients: string[];
  macroRatio: {
    carbsPct: number;
    proteinPct: number;
    fatPct: number;
  };
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  portionTip: string;
  hydrationTip: string;
  sampleItems: string[];
}

export interface PhaseDietaryGuidance {
  phaseName: MoonPhaseName;
  phaseCategory: 'New Moon' | 'Waxing' | 'Full Moon' | 'Waning';
  coreFocus: string;
  headline: string;
  biologicalMechanism: string;
  targetCarbs: string;
  targetProtein: string;
  targetLipids: string;
  recommendedSuperfoods: string[];
  foodsToLimit: string[];
  hydrationStrategy: string;
  meals: DailyMealRecommendation[];
}

/**
 * Returns comprehensive physiological and culinary dietary recommendations
 * calibrated specifically to the current lunar synodic phase and cycle day.
 */
export function getLunarPhaseDietaryRecommendations(
  phaseName: MoonPhaseName,
  cycleDay: number
): PhaseDietaryGuidance {
  // New Moon: ~Day 28 to 3.5 (Minimal luminosity, restorative glycogen synthesis)
  if (cycleDay <= 3.5 || cycleDay >= 26.5) {
    return {
      phaseName,
      phaseCategory: 'New Moon',
      headline: 'New Moon Chrononutrition: High Complex Carbohydrates & Cellular Glycogen Loading',
      coreFocus: 'High Long-Chain Complex Carbohydrates, Slow Polysaccharides & L-Tryptophan Shuttling',
      biologicalMechanism:
        'During the Dark Moon phase, pineal melatonin signaling peaks while systemic metabolic stress nadirs. Cellular insulin sensitivity is heightened for glycogen restoration. Slow-burning polysaccharides trigger a gentle, sustained insulin response that clears branched-chain amino acids, allowing L-tryptophan to cross the blood-brain barrier for nighttime serotonin and melatonin synthesis and cellular autophagy.',
      targetCarbs: '55% – 60% of total calories (focus on low-glycemic, high-amylose starches)',
      targetProtein: '20% – 25% (gentle plant proteins, collagen peptides, and clean poultry)',
      targetLipids: '20% (monounsaturated fats like extra virgin olive oil and pumpkin seed lipids)',
      recommendedSuperfoods: [
        'Roasted Japanese Sweet Potatoes',
        'Sprouted Black Lentils & Chickpeas',
        'Steel-Cut Oat Groats with Cinnamon',
        'Steamed Kabocha Squash',
        'Tuscan White Bean Puree',
        'Pumpkin & Sesame Seeds (Zinc + Tryptophan)',
      ],
      foodsToLimit: [
        'Refined sugars and high-fructose corn syrups (disturbs slow glycogen loading)',
        'Heavy deep-fried fats (delays gastric emptying during restorative recovery)',
        'Excessive late-evening caffeine (blunts nocturnal melatonin synthesis)',
      ],
      hydrationStrategy:
        'Warm herbal infusions (chamomile, linden flower, lemon balm) with a pinch of Celtic sea salt for intracellular mineral balance.',
      meals: [
        {
          mealTime: 'Breakfast',
          title: 'Cinnamon Steel-Cut Oat Bowl with Stewed Apples & Pumpkin Seeds',
          description:
            'Slow-cooked whole oat groats providing beta-glucan soluble fiber, paired with pectin-rich stewed apples and mineral-dense raw pumpkin seeds.',
          keyNutrients: ['Beta-Glucan Polysaccharides', 'Zinc', 'Magnesium', 'Dietary Pectin'],
          macroRatio: { carbsPct: 62, proteinPct: 18, fatPct: 20 },
          calories: 430,
          proteinG: 19,
          carbsG: 67,
          fatG: 10,
          portionTip: 'Generous complex carb portion to initiate daily sustained glycogen storage.',
          hydrationTip: 'Sip warm lemon-ginger water 15 minutes before eating.',
          sampleItems: [
            '1 cup cooked steel-cut oats',
            '1/2 cup cinnamon-stewed green apple slices',
            '2 tbsp raw sprouted pumpkin seeds',
            '1 tsp raw unheated honey (optional)',
          ],
        },
        {
          mealTime: 'Lunch',
          title: 'Moroccan Spiced Lentil & Sweet Potato Tagine over Quinoa',
          description:
            'Hearty slow-simmered green and brown lentils with cubed sweet potatoes, ground cumin, and turmeric served over fluffy tri-color quinoa.',
          keyNutrients: ['Amylose Complex Starches', 'L-Tryptophan', 'Iron', 'Curcumin'],
          macroRatio: { carbsPct: 58, proteinPct: 24, fatPct: 18 },
          calories: 520,
          proteinG: 31,
          carbsG: 75,
          fatG: 10,
          portionTip: 'Combine 2 parts roasted tubers and pulses with 1 part ancient grains.',
          hydrationTip: 'Hydrate with room-temperature spring water infused with cucumber slices.',
          sampleItems: [
            '1.5 cups lentil and sweet potato stew',
            '3/4 cup cooked quinoa',
            '1 cup steamed baby spinach with cold-pressed olive oil',
          ],
        },
        {
          mealTime: 'Dinner',
          title: 'Roasted Kabocha Squash & Tuscan Cannellini Beans with Sourdough',
          description:
            'Caramelized Japanese squash roasted with rosemary and garlic, served with creamy warm cannellini beans and slow-fermented artisan sourdough.',
          keyNutrients: ['Resistant Starch', 'Prebiotic Inulin', 'Potassium', 'B-Complex Vitamins'],
          macroRatio: { carbsPct: 60, proteinPct: 20, fatPct: 20 },
          calories: 480,
          proteinG: 24,
          carbsG: 72,
          fatG: 11,
          portionTip: 'Consume 2.5 to 3 hours before sleep to facilitate deep nocturnal melatonin release.',
          hydrationTip: 'Warm linden blossom or tart cherry tea (natural phytomelatonin).',
          sampleItems: [
            '1 cup oven-roasted kabocha squash wedges',
            '1 cup herb-simmered white cannellini beans',
            '1 slice long-fermented sourdough bread',
          ],
        },
        {
          mealTime: 'Snack',
          title: 'Roasted Spiced Chickpeas with Dark Berry Compote',
          description:
            'Crunchy paprika-roasted chickpeas providing prebiotic oligosaccharides and antioxidant anthocyanins.',
          keyNutrients: ['Dietary Fiber', 'Anthocyanins', 'Manganese'],
          macroRatio: { carbsPct: 65, proteinPct: 20, fatPct: 15 },
          calories: 220,
          proteinG: 11,
          carbsG: 36,
          fatG: 4,
          portionTip: 'Small palm-sized serving between solar noon and late afternoon.',
          hydrationTip: '8 oz pure filtered water.',
          sampleItems: ['1/3 cup crispy spiced chickpeas', 'Handful of fresh wild blueberries'],
        },
      ],
    };
  }

  // Full Moon: ~Day 12.5 to 17.5 OR phaseName === 'Full Moon' (Peak illumination, gravitational spring tide, heightened sympathetic arousal)
  if ((cycleDay >= 12.5 && cycleDay <= 17.5) || phaseName === 'Full Moon') {
    return {
      phaseName,
      phaseCategory: 'Full Moon',
      headline: 'Full Moon Chrononutrition: Balanced Proteins, Anti-Inflammatory Lipids & Controlled Glycemia',
      coreFocus: 'Structural Protein Synthesis, Omega-3 Phospholipids & Electrolyte Fluid Retention Balance',
      biologicalMechanism:
        'During the Full Moon, solar-lunar gravitational vectors align (Syzygy Spring Tide), inducing hydrostatic extracellular fluid shifts and heightened nighttime autonomic arousal. Ambient nocturnal moonlight (~0.25 lux) suppresses pineal melatonin by 5–10%. Optimal chrononutrition requires high biological value structural proteins (1.6–2.0 g/kg) for tissue turnover, marine omega-3 DHA/EPA phospholipids to stabilize erythrocyte membranes against hydrostatic pressure, natural potassium diuretics (dandelion, asparagus) to counteract spring-tide water retention, and controlled low-glycemic carbs to prevent nocturnal reactive hypoglycemia.',
      targetCarbs: '35% – 40% (low-glycemic leafy greens, wild asparagus, sprouted grains, berries)',
      targetProtein: '30% – 35% (wild cold-water sockeye salmon, pasture-raised eggs, organic chicken breast, collagen)',
      targetLipids: '30% – 35% (wild salmon DHA/EPA, Hass avocados, raw walnuts, extra virgin olive oil)',
      recommendedSuperfoods: [
        'Wild Alaskan Sockeye Salmon (Omega-3 DHA/EPA & Marine Astaxanthin)',
        'Pasture-Raised Whole Organic Eggs (Bioavailable Choline & Leucine)',
        'Hass Avocado & Cold-Pressed Extra Virgin Olive Oil (Oleic Acid)',
        'Steamed Wild Asparagus & Dandelion Greens (Potassium-Rich Natural Diuretics)',
        'Montmorency Tart Cherry Juice (Natural Phytomelatonin for Bright Moonlit Nights)',
        'Raw English Walnuts & Pumpkin Seeds (Brain Phospholipids & Magnesium)',
        'Organic Fermented Sheep Milk Kefir or Greek Yogurt (Probiotics & Calming Peptides)',
      ],
      foodsToLimit: [
        'Excessive dietary sodium (amplifies gravitational extracellular fluid retention during Spring Tides)',
        'High-glycemic refined starches (trigger reactive hypoglycemia & midnight adrenaline spikes)',
        'Heavy alcohol and histamine-dense aged cheeses (compound sleep fragmentation under bright moonlight)',
      ],
      hydrationStrategy:
        'High potassium-to-sodium ratio (2:1 minimum): Coconut water, filtered spring water with squeezed fresh lime, and trace magnesium glycinate drops to optimize cellular Na+/K+ ATPase pumps.',
      meals: [
        {
          mealTime: 'Breakfast',
          title: 'Pastured Eggs with Sliced Avocado & Sautéed Dandelion Greens',
          description:
            'Two to three pasture-raised organic poached or scrambled eggs over garlic-wilted dandelion greens and half a Hass avocado drizzled with extra virgin olive oil.',
          keyNutrients: ['Bioavailable Choline', 'Lutein', 'Potassium (Diuretic)', 'Monounsaturated Oleic Acid'],
          macroRatio: { carbsPct: 20, proteinPct: 35, fatPct: 45 },
          calories: 480,
          proteinG: 34,
          carbsG: 22,
          fatG: 28,
          portionTip: 'Moderate low-glycemic carbohydrates, high biological value protein for sustained neurotransmitter stability.',
          hydrationTip: 'Large glass of mineral water with freshly squeezed lime juice and trace magnesium.',
          sampleItems: [
            '3 pasture-raised organic eggs (poached or soft-scrambled)',
            '1/2 ripe Hass avocado with Celtic sea salt',
            '1.5 cups wilted dandelion greens or baby spinach with garlic',
            '1 slice sprouted grain Ezekiel toast',
          ],
        },
        {
          mealTime: 'Lunch',
          title: 'Wild Alaskan Sockeye Salmon with Quinoa & Charred Asparagus',
          description:
            'Pan-seared wild sockeye salmon fillet delivering marine astaxanthin and omega-3 EPA/DHA phospholipids, accompanied by asparagine-rich asparagus spears and lemon-herb quinoa.',
          keyNutrients: ['Omega-3 EPA/DHA', 'Marine Astaxanthin', 'Asparagine (Natural Diuretic)', 'Selenium'],
          macroRatio: { carbsPct: 32, proteinPct: 35, fatPct: 33 },
          calories: 580,
          proteinG: 48,
          carbsG: 44,
          fatG: 22,
          portionTip: 'Generous 6 oz salmon serving to maximize cellular membrane fluidity under tidal peak.',
          hydrationTip: 'Iced peppermint or hibiscus tea (promotes vascular tone and fluid balance).',
          sampleItems: [
            '6 oz grilled wild Alaskan sockeye salmon fillet',
            '1/2 cup cooked fluffy tri-color quinoa',
            '10 grilled asparagus spears with shaved lemon zest and extra virgin olive oil',
            'Side of mixed field greens with balsamic glaze',
          ],
        },
        {
          mealTime: 'Dinner',
          title: 'Herb-Roasted Pasture Chicken Breast with Mediterranean Braised Vegetables',
          description:
            'Tender roasted chicken breast with artichoke hearts, zucchini, fennel bulbs, and Kalamata olives braised with crushed tomatoes and high-polyphenol olive oil.',
          keyNutrients: ['Complete EAA Matrix', 'Magnesium', 'Dietary Inulin Prebiotic', 'Lycopene'],
          macroRatio: { carbsPct: 28, proteinPct: 40, fatPct: 32 },
          calories: 520,
          proteinG: 46,
          carbsG: 36,
          fatG: 18,
          portionTip: 'Controlled complex carbohydrate portion to preserve nocturnal growth hormone and deep restorative sleep.',
          hydrationTip: 'Warm magnesium glycinate mineral tonic or chamomile-passionflower infusion.',
          sampleItems: [
            '5–6 oz sliced herb-roasted chicken breast or grilled organic tofu',
            '1.5 cups braised zucchini, fennel, and artichoke hearts',
            '1 tbsp high-polyphenol extra virgin olive oil drizzle',
          ],
        },
        {
          mealTime: 'Snack',
          title: 'Raw Walnut Halves with Wild Blueberries & Sheep Milk Yogurt',
          description:
            'Raw polyphenol-rich English walnuts paired with low-glycemic antioxidant wild blueberries and probiotic fermented sheep yogurt.',
          keyNutrients: ['Alpha-Linolenic Acid (ALA)', 'Probiotics', 'Anthocyanins', 'Phytomelatonin'],
          macroRatio: { carbsPct: 30, proteinPct: 25, fatPct: 45 },
          calories: 280,
          proteinG: 16,
          carbsG: 20,
          fatG: 15,
          portionTip: 'Small mindful afternoon bowl to sustain mental clarity and prevent cortisol elevation.',
          hydrationTip: '8 oz filtered mineral spring water with lemon slice.',
          sampleItems: [
            '1/4 cup raw organic English walnut halves',
            '1/3 cup fresh wild blueberries',
            '1/3 cup plain organic Greek yogurt or sheep milk kefir',
          ],
        },
        {
          mealTime: 'Night Bite',
          title: 'Full Moon Night Tide Fuel: Smoked Wild Salmon & Crisp Cucumber with Citrus Tonic',
          description:
            'Specialized nocturnal solunar fuel for anglers and night sessions during the peak Full Moon spring tide. High biological value protein with marine astaxanthin, zero heavy starches, and potassium-rich lime mineral water to maintain razor-sharp predatory focus.',
          keyNutrients: ['Marine Omega-3 EPA/DHA', 'Astaxanthin', 'Bioavailable Leucine', 'Organic Potassium'],
          macroRatio: { carbsPct: 15, proteinPct: 55, fatPct: 30 },
          calories: 230,
          proteinG: 28,
          carbsG: 8,
          fatG: 9,
          portionTip: 'Consume 30 minutes before high tide night casting or late nocturnal active windows.',
          hydrationTip: 'Chilled mineral water with freshly squeezed lime and a pinch of potassium citrate.',
          sampleItems: [
            '3.5 oz wild smoked sockeye salmon or wild mackerel fillet',
            '1 cup sliced English cucumber spears with fresh dill and cracked pepper',
            '12 oz chilled coconut water with fresh lime juice',
          ],
        },
      ],
    };
  }

  // Waxing Phase: ~Day 3.6 to 12.4 (Building, anabolic momentum, cellular synthesis)
  if (cycleDay < 12.5) {
    return {
      phaseName,
      phaseCategory: 'Waxing',
      headline: 'Waxing Moon Chrononutrition: Anabolic Synthesis & Nutrient Density',
      coreFocus: 'Nutrient-Dense Building Blocks, Progressive Glycogen Stores & Tissue Synthesis',
      biologicalMechanism:
        'As lunar illumination builds from crescent toward gibbous, physiological parameters shift into an anabolic storage phase. Enzyme activity for micronutrient absorption peaks. Focus on balanced whole-food macronutrients with bioavailable iron, B-vitamins, and dense antioxidant greens to nourish cellular division and exercise recovery.',
      targetCarbs: '45% – 50% (whole grains, tubers, vibrant root vegetables)',
      targetProtein: '25% – 30% (poultry, legumes, pasture eggs, sustainable seafood)',
      targetLipids: '25% (extra virgin olive oil, pumpkin seeds, hemp hearts, tahini)',
      recommendedSuperfoods: [
        'Steamed Golden Beets & Beet Greens',
        'Sprouted Tri-Color Quinoa',
        'Pasture-Raised Turkey & Chicken',
        'Raw Pumpkin & Hemp Seeds',
        'Wild Black Rice (Forbidden Rice)',
        'Cruciferous Broccoli Sprouts (Sulforaphane)',
      ],
      foodsToLimit: ['Excess industrial seed oils', 'Ultra-processed snacking products', 'Excess sodium'],
      hydrationStrategy:
        'Mineralized water with fresh citrus wedges and trace marine minerals to support progressive tissue hydration.',
      meals: [
        {
          mealTime: 'Breakfast',
          title: 'Sprouted Grain Toast with Pasture Eggs, Microgreens & Hemp Seeds',
          description:
            'Two sunny pastured eggs on slow-fermented sprouted sourdough with nutrient-dense broccoli microgreens and raw hemp hearts.',
          keyNutrients: ['Choline', 'Sulforaphane', 'Gamma-Linolenic Acid (GLA)'],
          macroRatio: { carbsPct: 45, proteinPct: 30, fatPct: 25 },
          calories: 460,
          proteinG: 28,
          carbsG: 48,
          fatG: 16,
          portionTip: 'Hearty breakfast to kickstart early morning anabolic metabolism.',
          hydrationTip: 'Green tea or yerba mate during early morning cortisol peak.',
          sampleItems: [
            '2 pasture-raised eggs',
            '2 slices toasted sprouted Ezekiel bread',
            '1 tbsp shelled hemp hearts',
            'Generous handful of broccoli sprouts',
          ],
        },
        {
          mealTime: 'Lunch',
          title: 'Mediterranean Grain Bowl with Grilled Chicken & Tahini Drizzle',
          description:
            'Warm farro, sliced grilled chicken breast, roasted golden beets, cucumber, and fresh parsley tossed in lemon tahini sauce.',
          keyNutrients: ['Bioavailable Iron', 'Betalains', 'Complex Starch', 'Niacin'],
          macroRatio: { carbsPct: 45, proteinPct: 30, fatPct: 25 },
          calories: 550,
          proteinG: 42,
          carbsG: 62,
          fatG: 15,
          portionTip: 'Balanced 1:1:1 volumetric ratio of grains, proteins, and colorful vegetables.',
          hydrationTip: 'Chilled mint-infused spring water.',
          sampleItems: [
            '3/4 cup cooked farro or brown rice',
            '5 oz grilled herb chicken breast',
            '1 cup roasted beets and diced cucumbers',
            '2 tbsp sesame tahini dressing',
          ],
        },
        {
          mealTime: 'Dinner',
          title: 'Baked Cod with Roasted Sweet Potato & Garlic Rainbow Chard',
          description:
            'Flaky Pacific cod loin roasted with thyme, accompanied by rosemary sweet potato coins and vibrant sautéed rainbow chard.',
          keyNutrients: ['Lean Marine Protein', 'Beta-Carotene', 'Vitamin K1', 'Magnesium'],
          macroRatio: { carbsPct: 45, proteinPct: 35, fatPct: 20 },
          calories: 490,
          proteinG: 44,
          carbsG: 55,
          fatG: 11,
          portionTip: 'Moderately sized sweet potato serving to support evening melatonin conversion.',
          hydrationTip: 'Warm bone broth or roasted dandelion root tea.',
          sampleItems: [
            '6 oz baked wild cod fillet',
            '1 medium roasted sweet potato',
            '1.5 cups garlic-braised rainbow chard',
          ],
        },
        {
          mealTime: 'Snack',
          title: 'Apple Slices with Raw Almond Butter & Chia Seeds',
          description: 'Crisp honeycrisp apple wedges dipped in stone-ground raw almond butter.',
          keyNutrients: ['Soluble Pectin', 'Vitamin E', 'Soluble Mucilage'],
          macroRatio: { carbsPct: 50, proteinPct: 15, fatPct: 35 },
          calories: 240,
          proteinG: 6,
          carbsG: 30,
          fatG: 12,
          portionTip: 'Light mid-day sustaining snack.',
          hydrationTip: 'Filtered water with a dash of Celtic sea salt.',
          sampleItems: ['1 organic apple', '1.5 tbsp raw almond butter', '1 tsp black chia seeds'],
        },
      ],
    };
  }

  // Waning Phase: ~Day 17.6 to 26.4 (Detoxification, cellular elimination, calming)
  return {
    phaseName,
    phaseCategory: 'Waning',
    headline: 'Waning Moon Chrononutrition: Hepatic Cleansing, Cellular Elimination & Digestive Ease',
    coreFocus: 'Cruciferous Glucosinolates, Polyphenol Cleansing, Digestive Lightness & Hydration',
    biologicalMechanism:
      'As moonlight decreases from gibbous toward the crescent, systemic metabolism transitions into a catabolic cleansing and shedding cycle. Digestive transit times accelerate. Focus on liver-supportive sulfur compounds (cruciferous vegetables, alliums), bitter greens to stimulate bile flow, and easily digestible broths to support cellular detox and eliminate residual spring-tide water retention.',
    targetCarbs: '40% – 45% (cruciferous vegetables, celery, fennel, wild berries, ancient grain pilafs)',
    targetProtein: '25% – 30% (collagen peptides, bone broths, wild white fish, sprouted legumes)',
    targetLipids: '25% – 30% (olive oil, avocados, ground flaxseeds, pumpkin seed butter)',
    recommendedSuperfoods: [
      'Raw & Steamed Artichoke Hearts (Cynarin bile stimulator)',
      'Arugula, Dandelion & Radicchio Bitter Greens',
      'Organic Bone Broth or Shiitake Mushroom Broth',
      'Fresh Ginger & Turmeric Root Tonics',
      'Ground Golden Flaxseed (Lignan Phytoestrogen clearance)',
      'Black Radishes & Daikon Radish',
    ],
    foodsToLimit: [
      'Heavy dairy creams and processed cheeses',
      'High-sugar confectionaries and heavy fried foods',
      'Artificial additives, chemical colorings, and excess preservatives',
    ],
    hydrationStrategy:
      'Abundant fluids: Warm dandelion root tea, nettle leaf infusion, and lemon-infused filtered water to assist renal and lymphatic drainage.',
    meals: [
      {
        mealTime: 'Breakfast',
        title: 'Detoxifying Berry & Greens Smoothie Bowl with Sprouted Hemp',
        description:
          'Blended wild blueberries, baby spinach, celery, fresh ginger, plant protein or collagen, topped with golden flax and coconut flakes.',
        keyNutrients: ['Flavonoids', 'Gingerols', 'Dietary Lignans', 'Bioavailable Glycine'],
        macroRatio: { carbsPct: 45, proteinPct: 30, fatPct: 25 },
        calories: 380,
        proteinG: 26,
        carbsG: 42,
        fatG: 12,
        portionTip: 'Liquid-fiber blend allows immediate digestive assimilation without gastrointestinal burden.',
        hydrationTip: 'Glass of warm lemon-cayenne water upon waking.',
        sampleItems: [
          '1 cup unsweetened almond milk',
          '1 cup wild blueberries',
          '2 cups packed fresh spinach',
          '1 scoop clean protein powder or 2 tbsp hemp hearts',
          '1 tbsp freshly ground flaxseed',
        ],
      },
      {
        mealTime: 'Lunch',
        title: 'Shaved Fennel, Arugula & Wild Sardine Salad with Lemon Dressing',
        description:
          'Crisp shaved fennel bulbs, spicy baby arugula, and sustainably caught wild sardines dressed in unfiltered olive oil and fresh lemon juice.',
        keyNutrients: ['Calcium', 'EPA/DHA', 'Glucosinolates', 'Anethole (digestive carminative)'],
        macroRatio: { carbsPct: 35, proteinPct: 35, fatPct: 30 },
        calories: 450,
        proteinG: 38,
        carbsG: 34,
        fatG: 16,
        portionTip: 'High-volume bitter greens stimulate gallbladder and hepatic phase-2 detoxification.',
        hydrationTip: 'Chilled sparkling mineral water with fresh rosemary sprig.',
        sampleItems: [
          '1 tin wild sardines in olive oil (drained)',
          '2 cups mixed baby arugula and watercress',
          '1 cup shaved raw fennel bulb',
          '1 tbsp cold-pressed olive oil & lemon juice',
        ],
      },
      {
        mealTime: 'Dinner',
        title: 'Shiitake & Bok Choy Healing Broth with Poached Wild Halibut',
        description:
          'Gentle mineral-rich broth infused with dried shiitake mushrooms, ginger, garlic, baby bok choy, and delicately poached white halibut.',
        keyNutrients: ['Beta-Glucans', 'Selenium', 'Potassium', 'Easily Digestible White Fish Protein'],
        macroRatio: { carbsPct: 40, proteinPct: 35, fatPct: 25 },
        calories: 440,
        proteinG: 42,
        carbsG: 40,
        fatG: 11,
        portionTip: 'Light, comforting, low-sodium evening bowl to relieve fluid retention.',
        hydrationTip: 'Freshly brewed peppermint or chamomile tea.',
        sampleItems: [
          '5 oz wild halibut or cod fillet poached in broth',
          '1.5 cups sliced shiitake mushrooms and baby bok choy',
          '2 cups restorative ginger-garlic bone or mushroom broth',
          '1/2 cup cooked wild brown rice (optional)',
        ],
      },
      {
        mealTime: 'Snack',
        title: 'Celery Sticks with Sprouted Pumpkin Seed Butter & Himalayan Salt',
        description: 'Crisp water-dense celery sticks paired with mineral-rich stone ground pumpkin seed butter.',
        keyNutrients: ['Phthalides (Blood Pressure Support)', 'Zinc', 'Organic Sodium & Potassium'],
        macroRatio: { carbsPct: 35, proteinPct: 25, fatPct: 40 },
        calories: 210,
        proteinG: 9,
        carbsG: 14,
        fatG: 13,
        portionTip: 'Natural diuretic snack preventing late-afternoon sluggishness.',
        hydrationTip: 'Nettle leaf tea (natural kidney tonic).',
        sampleItems: ['4 crisp celery stalks', '1.5 tbsp raw pumpkin seed butter'],
      },
    ],
  };
}
