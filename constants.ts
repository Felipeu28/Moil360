
import { Article, Category, ChartDataPoint, StatData } from './types';

export const HERO_STATS: StatData[] = [
  { label: 'Workers Coached', value: '5,000+' },
  { label: 'Small Businesses', value: '500+' },
  { label: 'Avg Time Saved', value: '11 Hrs/Wk' }
];

export const CHART_DATA: ChartDataPoint[] = [
  { month: 'Jan', aiAdoption: 12, efficiencyGain: 5, revenue: 15 },
  { month: 'Feb', aiAdoption: 15, efficiencyGain: 8, revenue: 18 },
  { month: 'Mar', aiAdoption: 22, efficiencyGain: 12, revenue: 25 },
  { month: 'Apr', aiAdoption: 35, efficiencyGain: 18, revenue: 32 },
  { month: 'May', aiAdoption: 48, efficiencyGain: 25, revenue: 45 },
  { month: 'Jun', aiAdoption: 55, efficiencyGain: 32, revenue: 58 },
  { month: 'Jul', aiAdoption: 68, efficiencyGain: 40, revenue: 72 },
];

export const NAV_LINKS = [
  { name: 'Strategy', href: '#insights' },
  { name: 'Growth', href: '#insights' },
  { name: 'Operations', href: '#insights' },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    category: Category.PRODUCT,
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop',
    author: { name: 'The Moil Team', title: 'Product', avatarUrl: '' },
    featured: true,
    locales: {
      en: {
        title: 'Moil: The Bilingual AI Coach for Real-World Workers and Small Businesses',
        excerpt: 'The first bilingual, mobile-first AI operating system made exclusively for real-world workers and the small businesses that hire them.',
        contentBlocks: [
            { type: 'h2', text: 'The Future of Trade Operations' },
            { type: 'paragraph', text: 'You speak English, Spanish, or both. You fix houses, drive trucks, clean homes, serve food, or run a small crew. You don’t have time for 17 different apps, $500/month tool stacks, or complicated AI that wasn’t built for you.' },
            { type: 'paragraph', text: 'That’s why we created Moil — the first bilingual (English + Spanish), mobile-first AI operating system built for the real economy.' },
            { type: 'h3', text: 'Two Sides, One Mission' },
            { type: 'list', items: [
                'Moil Career Coach (for workers): Resume builder, Interview practice, Job matches. Free or employer sponsored.',
                'Moil Business Coach (for owners): Business plans, Marketing content, Hiring tools, Invoices. $15/month avg.',
                'Hiring & Matching Engine: Connecting ready-to-hire talent with local businesses instantly.'
            ]},
            { type: 'h2', text: 'Who Moil Is Actually For' },
            { type: 'paragraph', text: 'Moil is built for workers in construction, hospitality, logistics, and manufacturing, as well as solo owners and small crews (1–25 people) in trades and services.' },
            { type: 'paragraph', text: 'Average Moil Business user saves 11 hours/week. Average worker lands a better job in 19 days (vs 47 days on Indeed alone).' },
            { type: 'cta', title: 'Start Growing with Moil', text: 'Join 500+ businesses scaling their operations with bilingual AI.', ctaButton: 'Try Moil Business', ctaLink: 'https://moilapp.com/business' }
        ]
      },
      es: {
        title: 'Moil: El Entrenador de IA Bilingüe para la Economía Real',
        excerpt: 'El primer sistema operativo de IA bilingüe y móvil, creado exclusivamente para trabajadores de la economía real y las pequeñas empresas que los contratan.',
        contentBlocks: [
            { type: 'h2', text: 'El Futuro de las Operaciones de Oficios' },
            { type: 'paragraph', text: 'Usted habla inglés, español o ambos. Arregla casas, conduce camiones, limpia hogares o dirige un pequeño equipo. No tiene tiempo para 17 aplicaciones diferentes. Por eso creamos Moil.' },
            { type: 'h3', text: 'Dos Lados, Una Misión' },
            { type: 'list', items: [
                'Moil Career Coach: Creador de currículums, práctica de entrevistas y emparejamiento laboral.',
                'Moil Business Coach: Planes de negocios, marketing, contratación y facturas.',
                'Motor de Contratación: Conecta talento listo para trabajar con negocios locales.'
            ]},
            { type: 'h2', text: 'Para Quién es Moil Realmente' },
            { type: 'paragraph', text: 'Moil está diseñado para trabajadores en construcción, hospitalidad y logística, así como para dueños solitarios y pequeños equipos de oficios.' },
            { type: 'cta', title: 'Comience a Crecer con Moil', text: 'Únase a más de 500 empresas que escalan sus operaciones con IA bilingüe.', ctaButton: 'Probar Moil Negocios', ctaLink: 'https://moilapp.com/business' }
        ]
      }
    }
  },
  {
    id: '2',
    category: Category.AI_TECH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'AI Experts', avatarUrl: '' },
    featured: true,
    locales: {
      en: {
        title: 'Top AI Trends Every Owner Should Know for 2026',
        excerpt: 'Discover the top 10 generative AI trends and how small businesses can use them to scale operations and growth.',
        contentBlocks: [
            { type: 'h2', text: '2026: The Turning Point for SMBs' },
            { type: 'paragraph', text: 'AI is no longer limited to big tech. It is becoming the "digital glue" for small trades and service businesses. In 2026, we see a massive shift toward autonomous operations.' },
            { type: 'h3', text: 'Trend 1: Agentic Workflows' },
            { type: 'paragraph', text: 'AI isn\'t just answering questions anymore; it\'s doing work. Agentic AI can now handle scheduling, part ordering, and customer follow-ups without human intervention.' },
            { type: 'h3', text: 'Trend 2: Bilingual Everything' },
            { type: 'paragraph', text: 'The ability to communicate across language barriers instantly is the new competitive advantage. Multimodal models now translate voice and text in real-time.' },
            { type: 'list', items: [
                'Agentic Workflows: AI that completes tasks, not just text.',
                'Hyper-local Data: Using regional business data for better pricing.',
                'Bilingual Bridge: Real-time translation as a default service.'
            ]}
        ]
      },
      es: {
        title: 'Principales Tendencias de IA para Dueños de Negocios en 2026',
        excerpt: 'Descubra las 10 principales tendencias de IA generativa y cómo las pequeñas empresas pueden usarlas para escalar.',
        contentBlocks: [
            { type: 'h2', text: '2026: El Punto de Inflexión' },
            { type: 'paragraph', text: 'La IA ya no es exclusiva de las grandes tecnológicas. Se está convirtiendo en el "pegamento digital" para oficios y servicios. En 2026, vemos un cambio masivo hacia operaciones autónomas.' },
            { type: 'h3', text: 'Tendencia 1: Flujos de Trabajo Agénticos' },
            { type: 'paragraph', text: 'La IA ya no solo responde preguntas; hace el trabajo. La IA agéntica ahora puede manejar horarios, pedidos de piezas y seguimiento de clientes sin intervención humana.' },
            { type: 'h3', text: 'Tendencia 2: Todo Bilingüe' },
            { type: 'paragraph', text: 'La capacidad de comunicarse a través de las barreras del idioma es la nueva ventaja competitiva. Los modelos traducen voz y texto en tiempo real.' }
        ]
      }
    }
  },
  {
    id: '3',
    category: Category.GROWTH,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Growth Strategist', avatarUrl: '' },
    locales: {
      en: {
        title: 'Digital Commerce for Trades: Selling Services Like Products',
        excerpt: 'The "Call for Quote" button is dying. In 2026, 40% of trade jobs are booked and paid for instantly online.',
        contentBlocks: [
            { type: 'h2', text: 'The Amazon-ification of Home Services' },
            { type: 'paragraph', text: 'Customers today expect instant gratification. If they can buy a car online, they want to book a water heater flush online. Those forcing phone tag are losing 35% of leads.' },
            { type: 'h3', text: 'Productizing Your Service' },
            { type: 'paragraph', text: 'Stop selling "Plumbing Services." Start selling "The Annual Leak Prevention Package - $199." Fixed prices remove friction and build trust instantly.' },
            { type: 'list', items: [
                'Online Bookings are up 41% year-over-year.',
                'No-show rates drop by 15% when paid upfront.',
                'Up-sell rates increase by 22% during digital checkout.'
            ]},
            { type: 'h2', text: 'The Bilingual Checkout' },
            { type: 'paragraph', text: 'With 25% of the U.S. workforce being Hispanic, offering a checkout experience in Spanish builds massive trust. A "Book Now" button that toggles to "Reservar Ahora" increases conversion by 18%.' }
        ]
      },
      es: {
        title: 'Comercio Digital para Oficios: Vendiendo Servicios como Productos',
        excerpt: 'El botón de "Llamar para Cotizar" está muriendo. En 2026, el 40% de los trabajos de oficios se reservan al instante.',
        contentBlocks: [
            { type: 'h2', text: 'La Amazonificación de los Servicios del Hogar' },
            { type: 'paragraph', text: 'Los clientes hoy esperan gratificación instantánea. Si pueden comprar un auto en línea, quieren reservar un mantenimiento de calentador en línea.' },
            { type: 'h3', text: 'Productizando su Servicio' },
            { type: 'paragraph', text: 'Deje de vender "Servicios de Plomería". Comience a vender "Paquete Anual de Prevención de Fugas - $199". Los precios fijos eliminan la fricción.' },
            { type: 'list', items: [
                'Las reservas en línea han subido un 41%.',
                'Las tasas de inasistencia bajan un 15% con pago adelantado.',
                'Las ventas adicionales suben un 22% en el checkout digital.'
            ]}
        ]
      }
    }
  },
  {
    id: '4',
    category: Category.GROWTH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Sustainability', avatarUrl: '' },
    locales: {
      en: {
        title: 'The "Green Premium" in Construction: How to Charge 15% More',
        excerpt: 'Sustainability isn\'t just moral; it\'s profitable. Homeowners are paying premiums for eco-certified renovations.',
        contentBlocks: [
            { type: 'h2', text: 'The Economics of Eco-Renovations' },
            { type: 'paragraph', text: 'In 2026, energy efficiency is the #1 requested feature. Contractors who can speak "ROI" regarding solar, insulation, and heat pumps close deals at 20% higher margins.' },
            { type: 'h3', text: 'Eco-Impact Reporting' },
            { type: 'paragraph', text: 'Explain the utility savings to homeowners clearly. Heat pumps and high-grade insulation aren\'t costs; they are investments protected by massive tax credits.' },
            { type: 'list', items: [
                'Margin Boost: +15% for certified green jobs.',
                'Gov Incentives: Up to $12k/year in available credits.',
                'Bid Win Rate: +30% when including eco-impact reports.'
            ]},
            { type: 'h2', text: 'Marketing the "Green" Advantage' },
            { type: 'paragraph', text: 'Use data to sell. Showing a client exactly how much they save over 5 years is more powerful than any brochure. Transparency is your greatest sales tool.' }
        ]
      },
      es: {
        title: 'La "Prima Verde" en la Construcción: Cómo Cobrar un 15% Más',
        excerpt: 'La sostenibilidad no es solo moral; es rentable. Los propietarios pagan primas por renovaciones ecológicas.',
        contentBlocks: [
            { type: 'h2', text: 'Economía de las Eco-Renovaciones' },
            { type: 'paragraph', text: 'En 2026, la eficiencia energética es la característica #1 solicitada. Los contratistas que hablan de "ROI" cierran tratos con márgenes 20% más altos.' },
            { type: 'h3', text: 'Informes de Impacto Ecológico' },
            { type: 'paragraph', text: 'Explique los ahorros claramente. Las bombas de calor no son costos; son inversiones protegidas por créditos fiscales.' }
        ]
      }
    }
  },
  {
    id: '5',
    category: Category.OPERATIONS,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Ops Expert', avatarUrl: '' },
    locales: {
      en: {
        title: 'The No-Office Empire: Running a 10-Person Crew from Your Phone',
        excerpt: 'You don\'t need a warehouse or a receptionist. The "Hybrid Field Stack" lets you run a million-dollar operation from your truck.',
        contentBlocks: [
            { type: 'h2', text: 'Kill the Paperwork' },
            { type: 'paragraph', text: 'If you are physically handing work orders to your crew, you are burning $500/week in efficiency. The goal is "Touchless Dispatch." Digital work orders and auto-translate remove 12 hours of admin weekly.' },
            { type: 'h3', text: 'The Bilingual Comm Layer' },
            { type: 'paragraph', text: 'The biggest friction in mixed crews is language. Use Moil with auto-translate: you type in English, they read in Spanish. They reply in voice (Spanish), you read in English.' },
            { type: 'h2', text: 'Real-Time Accountability' },
            { type: 'paragraph', text: 'GPS tracking and instant photo uploads on job completion aren\'t about micromanagement. They are about proof of work and faster invoicing.' }
        ]
      },
      es: {
        title: 'El Imperio sin Oficina: Dirigiendo un Equipo de 10 desde tu Celular',
        excerpt: 'No necesita un almacén. El "Hybrid Field Stack" le permite operar un negocio millonario desde su camioneta.',
        contentBlocks: [
            { type: 'h2', text: 'Elimine el Papeleo' },
            { type: 'paragraph', text: 'Si entrega órdenes físicamente, pierde $500/semana. El objetivo es "Despacho sin Contacto". Las órdenes digitales eliminan 12 horas de admin.' }
        ]
      }
    }
  },
  {
    id: '6',
    category: Category.LEGAL,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Cybersecurity', avatarUrl: '' },
    locales: {
      en: {
        title: 'Cybersecurity for Plumbers: Protecting from Ransomware',
        excerpt: 'Hackers aren\'t targeting Google; they are targeting you. Why small trades are the new #1 target.',
        contentBlocks: [
            { type: 'h2', text: 'The $15,000 Ransom' },
            { type: 'paragraph', text: 'That is the average demand hackers make to unlock a small business customer list. For a plumber, that is payroll. For hackers, it is easy money because your password is "Plumbing123".' },
            { type: 'list', items: [
                'Attacks on SMBs are up 45% in 2025.',
                'Avg Downtime: 14 days of lost work.',
                'Client Churn: 30% of customers leave after a data leak.'
            ]},
            { type: 'h2', text: 'Simple Shields' },
            { type: 'paragraph', text: 'Use a password manager. Turn on Multi-Factor Authentication (MFA). These two steps alone stop 99% of automated attacks. Don\'t be an easy target.' }
        ]
      },
      es: {
        title: 'Ciberseguridad para Plomeros: Protección contra Ransomware',
        excerpt: 'Los hackers no atacan a Google; lo atacan a usted. Por qué los oficios pequeños son el nuevo objetivo #1.',
        contentBlocks: [
            { type: 'h2', text: 'El Rescate de $15,000' },
            { type: 'paragraph', text: 'Ese es el promedio que exigen los hackers. Para un plomero, eso es la nómina. Para los hackers, es dinero fácil.' }
        ]
      }
    }
  },
  {
    id: '7',
    category: Category.FINANCE,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Finance Specialist', avatarUrl: '' },
    locales: {
      en: {
        title: 'The Cash Flow Cure: How to Stop Being "Business Poor"',
        excerpt: 'You have $50k in receivables but can\'t make payroll. Fix the "Trade Trap" with 5 financial controls.',
        contentBlocks: [
            { type: 'h2', text: 'Profit is Opinion, Cash is Fact' },
            { type: 'paragraph', text: 'Most trades fail while being "profitable" on paper. The issue is the gap between buying materials and getting paid. You are acting as a bank for your customers.' },
            { type: 'h3', text: 'The Upfront Deposit Rule' },
            { type: 'paragraph', text: 'Implement the 50% upfront deposit rule. Never start a job without it. Automated AR chasing will stabilize your runway.' },
            { type: 'h2', text: 'Separate Your Accounts' },
            { type: 'paragraph', text: 'If your business and personal money are in the same bucket, you don\'t have a business; you have a expensive hobby. Separate them today.' }
        ]
      },
      es: {
        title: 'La Cura del Flujo de Caja: Cómo Dejar de ser "Pobre de Negocio"',
        excerpt: 'Tiene $50k en facturas pero no puede pagar la nómina. Arregle la "Trampa del Oficio" con 5 controles.',
        contentBlocks: [
            { type: 'h2', text: 'Ganancia es Opinión, Efectivo es Realidad' },
            { type: 'paragraph', text: 'Muchos fallan siendo "rentables" en papel. El problema es el bache entre comprar materiales y cobrar.' }
        ]
      }
    }
  },
  {
    id: '8',
    category: Category.RETENTION,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Customer Success', avatarUrl: '' },
    locales: {
      en: {
        title: 'Membership Models: Turning Repairs into Monthly Revenue',
        excerpt: 'Why the most valuable trade businesses have 500+ members paying $29/mo for priority access.',
        contentBlocks: [
            { type: 'h2', text: 'Service as a Subscription' },
            { type: 'paragraph', text: 'Acquiring a customer costs $300. Keeping them costs $0. Membership models smooth the revenue rollercoaster and ensure you are covered during slow months.' },
            { type: 'h3', text: 'The Priority Selling Point' },
            { type: 'paragraph', text: 'Don\'t sell the inspection; sell the speed. "Members skip the line." In a heatwave, that peace of mind is worth more than any repair cost.' },
            { type: 'h2', text: 'Predictable Growth' },
            { type: 'paragraph', text: 'A business with recurring revenue is worth 3x more than one without. You aren\'t just fixing pipes; you are building an asset.' }
        ]
      },
      es: {
        title: 'Modelos de Membresía: Convirtiendo Reparaciones en Ingresos Mensuales',
        excerpt: 'Por qué los negocios más valiosos tienen más de 500 miembros pagando $29/mes por acceso prioritario.',
        contentBlocks: [
            { type: 'h2', text: 'Servicio como Suscripción' },
            { type: 'paragraph', text: 'Adquirir un cliente cuesta $300. Mantenerlo cuesta $0. Los modelos de membresía suavizan la montaña rusa de ingresos.' }
        ]
      }
    }
  },
  {
    id: '9',
    category: Category.HIRING,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'HR Expert', avatarUrl: '' },
    locales: {
      en: {
        title: 'Moneyball for Hiring: Finding Hidden Talent',
        excerpt: 'The "perfect candidate" doesn\'t exist. Stop looking for resumes and start looking for traits.',
        contentBlocks: [
            { type: 'h2', text: 'The Adjacency Strategy' },
            { type: 'paragraph', text: 'With 400,000 unfilled trade jobs, you cannot find experienced people. You must find capable people and train them.' },
            { type: 'list', items: [
                'Hire Line Cooks for Welding (Heat tolerance, timing).',
                'Hire Warehouse Packers for Carpentry (Spatial awareness).',
                'Hire CNAs for Safety Inspection (Protocol adherence).'
            ]},
            { type: 'h2', text: 'Hire for Will, Train for Skill' },
            { type: 'paragraph', text: 'A person with a great attitude and a willingness to learn is 10x more valuable than a grumpy expert who ruins your culture.' }
        ]
      },
      es: {
        title: 'Moneyball para la Contratación: Hallando Talento Oculto',
        excerpt: 'El "candidato perfecto" no existe. Deje de buscar currículums y empiece a buscar rasgos.',
        contentBlocks: [
            { type: 'h2', text: 'Estrategia de Adyacencia' },
            { type: 'paragraph', text: 'Con 400,000 empleos sin llenar, no encontrará expertos. Debe buscar gente capaz y entrenarla.' }
        ]
      }
    }
  },
  {
    id: '10',
    category: Category.GROWTH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'SEO Specialist', avatarUrl: '' },
    locales: {
      en: {
        title: 'The New Local SEO: Winning with Entities',
        excerpt: 'Keywords are dead. Google\'s AI cares about "Entities." If you aren\'t proving you are real, you are invisible.',
        contentBlocks: [
            { type: 'h2', text: 'Verification is SEO' },
            { type: 'paragraph', text: 'Google prefers businesses with a physical footprint. Local sponsorships and verified reviews are the strongest signals for ranking high in 2026.' },
            { type: 'h3', text: 'The Bilingual Search Monopoly' },
            { type: 'paragraph', text: 'In the Sun Belt, 30% of searches are in Spanish. Most competitors have zero Spanish content. Dominating this gap is the easiest win.' },
            { type: 'h2', text: 'Authority through Context' },
            { type: 'paragraph', text: 'Don\'t just list your city. List your neighborhood, local landmarks, and the specific types of homes you service. Specificity creates trust with the algorithm.' }
        ]
      },
      es: {
        title: 'El Nuevo SEO Local: Ganando con Entidades',
        excerpt: 'Las palabras clave han muerto. La IA de Google se preocupa por las "Entidades". Si no demuestra que es real, es invisible.',
        contentBlocks: [
            { type: 'h2', text: 'Verificación es SEO' },
            { type: 'paragraph', text: 'Google prefiere negocios con huella física. Patrocinios locales y reseñas verificadas son las señales más fuertes.' }
        ]
      }
    }
  },
  {
    id: '11',
    category: Category.AI_TECH,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Automation Expert', avatarUrl: '' },
    locales: {
      en: {
        title: 'The "Agentic" Dispatcher: AI Replacing Middle Management',
        excerpt: 'Agentic AI *does work*. Meet the autonomous agents that schedule jobs and order parts.',
        contentBlocks: [
            { type: 'h2', text: 'The 24/7 Office Manager' },
            { type: 'paragraph', text: 'Imagine a bot that watches your email. When a supplier says "Part is delayed," the bot reschedules the job and texts the customer automatically.' },
            { type: 'list', items: [
                'Admin time saved: 15 hours per week.',
                'Parts errors reduced by 85%.',
                'Speed: Instant responses to customer inquiries.'
            ]},
            { type: 'h2', text: 'Scaling without Overhead' },
            { type: 'paragraph', text: 'The goal of AI is not to fire people; it is to avoid hiring middle management as you grow. Keep your team lean and your profit margins fat.' }
        ]
      },
      es: {
        title: 'El Despachador "Agéntico": IA Reemplazando la Gerencia Media',
        excerpt: 'La IA Agéntica *hace el trabajo*. Conozca los agentes autónomos que programan trabajos y piden piezas.',
        contentBlocks: [
            { type: 'h2', text: 'El Gerente de Oficina 24/7' },
            { type: 'paragraph', text: 'Imagine un bot que vigila su correo. Si un proveedor dice "Pieza retrasada", el bot reprograma solo.' }
        ]
      }
    }
  },
  {
    id: '12',
    category: Category.MARKET_RESEARCH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Labor Market Analyst', avatarUrl: '' },
    locales: {
      en: {
        title: 'Healthcare to HVAC: The Great Labor Migration',
        excerpt: 'Nurses and aides are burnt out. They are flocking to the trades for better pay and autonomy.',
        contentBlocks: [
            { type: 'h2', text: 'Why Nurses Make Great Techs' },
            { type: 'paragraph', text: 'Nurses are trained in strict protocols and documentation. Those skills transfer perfectly to complex technical service and inspection.' },
            { type: 'h3', text: 'The Pitch: One Patient at a Time' },
            { type: 'paragraph', text: 'Pitch them on the service life: one problem to solve, one customer to help, and better work-life balance.' },
            { type: 'h2', text: 'The Empathy Advantage' },
            { type: 'paragraph', text: 'Service is 50% technical and 50% emotional. People from healthcare backgrounds are naturally better at managing stressed homeowners.' }
        ]
      },
      es: {
        title: 'De Salud a HVAC: La Gran Migración Laboral',
        excerpt: 'Las enfermeras y auxiliares están agotados. Están migrando a los oficios por mejor paga y autonomía.',
        contentBlocks: [
            { type: 'h2', text: 'Por qué las Enfermeras son Excelentes Técnicos' },
            { type: 'paragraph', text: 'Están entrenadas en protocolos y documentación. Esas habilidades se transfieren perfecto.' }
        ]
      }
    }
  },
  {
    id: '13',
    category: Category.CAREER,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Career Coach', avatarUrl: '' },
    locales: {
      en: {
        title: 'The 6-Second Scan: Beating the Resume Robots',
        excerpt: '75% of resumes are rejected by ATS bots. Learn the exact format to get flagged as "Top Tier".',
        contentBlocks: [
            { type: 'h2', text: 'Keywords are King' },
            { type: 'paragraph', text: 'Bots are simple. If the job says "Forklift" and you say "Warehouse," you lose. Mirror the job description exactly.' },
            { type: 'h3', text: 'The Results Format' },
            { type: 'paragraph', text: 'Stop listing duties. List results ("Maintained 99% sanitation score"). Numbers pop; duties bore.' },
            { type: 'h2', text: 'Clean and Simple' },
            { type: 'paragraph', text: 'Avoid fancy graphics or two-column layouts. These confuse the bots. Simple, clean, text-based resumes win every time.' }
        ]
      },
      es: {
        title: 'El Escaneo de 6 Segundos: Venciendo a los Robots',
        excerpt: 'El 75% de los currículums son rechazados por bots ATS. Aprenda el formato exacto para ser marcado como "Top Tier".',
        contentBlocks: [
            { type: 'h2', text: 'Palabras Clave son Ley' },
            { type: 'paragraph', text: 'Los bots son simples. Si el empleo pide "Montacargas" y usted dice "Bodega", pierde.' }
        ]
      }
    }
  },
  {
    id: '14',
    category: Category.COMMUNITY,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Community Funding', avatarUrl: '' },
    locales: {
      en: {
        title: 'Free Capital: How to Unlock EDC Grants in Texas',
        excerpt: 'Banks aren\'t the only source of money. Economic Development Corporations have budgets they *must* spend.',
        contentBlocks: [
            { type: 'h2', text: 'The Best Kept Secret in Funding' },
            { type: 'paragraph', text: 'EDCs offer grants for facade improvements and workforce training. These are repayment-free if requirements are met.' },
            { type: 'cta', title: 'Find Local Grants', text: 'Moil indexes over 400 grant programs in Texas and the Sun Belt.', ctaButton: 'Search My Zip Code', ctaLink: '#' },
            { type: 'h2', text: 'Impact is Currency' },
            { type: 'paragraph', text: 'When applying for grants, focus on how you help the community. Are you hiring locals? Are you fixing historical buildings? Tell that story.' }
        ]
      },
      es: {
        title: 'Capital Gratis: Subvenciones de EDC en Texas',
        excerpt: 'Los bancos no son la única fuente de dinero. Las Corporaciones de Desarrollo Económico tienen presupuestos obligatorios.',
        contentBlocks: [
            { type: 'h2', text: 'El Secreto de Financiación' },
            { type: 'paragraph', text: 'Las EDCs ofrecen fondos para mejorar fachadas y entrenar personal. No se devuelven si se cumplen las metas.' }
        ]
      }
    }
  },
  {
    id: '15',
    category: Category.OPERATIONS,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Operations Lead', avatarUrl: '' },
    locales: {
      en: {
        title: 'The $20,000 Van: Stopping Inventory Bleed',
        excerpt: 'Your technicians are driving with $5k in unauthorized parts. Use Visual AI to solve the stock mystery.',
        contentBlocks: [
            { type: 'h2', text: 'The "Just in Case" Problem' },
            { type: 'paragraph', text: 'Techs hoard parts, tying up cash. Visual AI counts shelf stock from a single photo and auto-replenishes inventory.' },
            { type: 'list', items: [
                'Reduce shrinkage by 60%.',
                'Improve first-time fix rates significantly.',
                'Automate replenishment orders via Visual AI.'
            ]},
            { type: 'h2', text: 'Cleanliness is Efficiency' },
            { type: 'paragraph', text: 'A messy van is a sign of a messy mind. Standardize your truck layouts. When everything has a place, nothing gets lost.' }
        ]
      },
      es: {
        title: 'La Camioneta de $20,000: Deteniendo la Fuga de Inventario',
        excerpt: 'Sus técnicos conducen con $5k en piezas no autorizadas. Use IA Visual para resolver el misterio.',
        contentBlocks: [
            { type: 'h2', text: 'El Problema del "Por si Acaso"' },
            { type: 'paragraph', text: 'Los técnicos guardan piezas, congelando efectivo. La IA Visual cuenta el stock desde una foto.' }
        ]
      }
    }
  },
  {
    id: '16',
    category: Category.DEI,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Strategy Director', avatarUrl: '' },
    locales: {
      en: {
        title: 'Bilingual Revenue Multiplier: Diversity as Strategy',
        excerpt: 'Hiring bilingual staff isn\'t a box to check. It is a direct line to the $2 Trillion Hispanic market.',
        contentBlocks: [
            { type: 'h2', text: 'The Trust Gap' },
            { type: 'paragraph', text: 'Home services require high trust. Spanish-speaking techs close estimates at 2x the rate in Hispanic neighborhoods.' },
            { type: 'h3', text: 'Marketing the Advantage' },
            { type: 'paragraph', text: 'Put "Se Habla Español" on trucks and uniforms. It is a massive differentiator in crowded urban markets.' },
            { type: 'h2', text: 'Cultural Competence' },
            { type: 'paragraph', text: 'It\'s not just the language; it\'s the culture. Understanding community values like family and respect helps close larger residential deals.' }
        ]
      },
      es: {
        title: 'Multiplicador Bilingüe: Diversidad como Estrategia',
        excerpt: 'Contratar personal bilingüe no es un requisito. Es línea directa al mercado hispano de $2 Billones.',
        contentBlocks: [
            { type: 'h2', text: 'La Brecha de Confianza' },
            { type: 'paragraph', text: 'Los servicios requieren confianza. Técnicos bilingües cierran tratos al doble del ritmo.' }
        ]
      }
    }
  },
  {
    id: '17',
    category: Category.AI_TECH,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Tech Analyst', avatarUrl: '' },
    locales: {
      en: {
        title: 'Solopreneur Survival Kit: Reaching $250k Solo',
        excerpt: 'You are the CEO, janitor, and marketer. Here is the AI stack that replaces a 3-person staff.',
        contentBlocks: [
            { type: 'h2', text: 'Leverage is the New Hustle' },
            { type: 'paragraph', text: 'Deploy software instead of hiring help. For $150/month, you can have a stack that outperforms an office manager.' },
            { type: 'list', items: [
                'AI Reception: Never lose a lead with text-back bots.',
                'AI Bookkeeper: Snap receipts, extract data instantly.',
                'AI Marketer: Generate and schedule a month of ads in one sitting.'
            ]},
            { type: 'h2', text: 'Protect Your Time' },
            { type: 'paragraph', text: 'Your time as the owner is worth $200/hour. If you are doing $20/hour tasks like filing papers, you are losing money.' }
        ]
      },
      es: {
        title: 'Kit del Solopreneur: Alcanzando $250k Solo',
        excerpt: 'Usted es el CEO, conserje y marquetero. Aquí está el stack de IA que reemplaza a 3 empleados.',
        contentBlocks: [
            { type: 'h2', text: 'Apalancamiento es el Nuevo "Hustle"' },
            { type: 'paragraph', text: 'Use software en lugar de contratar ayuda. Por $150/mes, tenga un stack mejor que un gerente.' }
        ]
      }
    }
  },
  {
    id: '18',
    category: Category.FINANCE,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Financial Controller', avatarUrl: '' },
    locales: {
      en: {
        title: 'Bulletproof Finance: Surviving Price Swings',
        excerpt: 'Copper is up 20%. Lumber is down 10%. If you aren\'t repricing bids weekly, you are losing money.',
        contentBlocks: [
            { type: 'h2', text: 'The Escalation Clause' },
            { type: 'paragraph', text: 'Every quote must have a 7-day validity limit. Protect your material margins with automated supplier catalog links.' },
            { type: 'h3', text: 'Factoring for Growth' },
            { type: 'paragraph', text: 'Factor invoices if you need cash now. It costs 3%, but it saves your payroll during slow months.' },
            { type: 'h2', text: 'Dynamic Pricing' },
            { type: 'paragraph', text: 'Don\'t be afraid to raise prices as your costs rise. Good customers understand market conditions; bad ones will complain regardless.' }
        ]
      },
      es: {
        title: 'Finanzas Blindadas: Sobreviviendo a Precios Locos',
        excerpt: 'El cobre sube 20%. La madera baja 10%. Si no reajusta ofertas semanalmente, pierde dinero.',
        contentBlocks: [
            { type: 'h2', text: 'Cláusula de Escalamiento' },
            { type: 'paragraph', text: 'Cada cotización debe vencer en 7 días. Proteja sus márgenes con catálogos automáticos.' }
        ]
      }
    }
  },
  {
    id: '19',
    category: Category.COMMUNITY,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Marketing Lead', avatarUrl: '' },
    locales: {
      en: {
        title: 'The "Little League" Strategy: Hyper-Local ROI',
        excerpt: 'Facebook Ads are broad. The highest ROI marketing in 2026 is physical and community-based.',
        contentBlocks: [
            { type: 'h2', text: 'The $500 Billboard' },
            { type: 'paragraph', text: 'Sponsoring a local team puts your logo on 15 jerseys worn by children of homeowners. Trust is instant.' },
            { type: 'h3', text: 'Welcome Kits' },
            { type: 'paragraph', text: 'Partner with realtors. Branded welcome boxes get you into the house before things even break.' },
            { type: 'h2', text: 'Be the Local Expert' },
            { type: 'paragraph', text: 'Speak at local events or host free workshops on home maintenance. Being seen as a helpful expert beats being seen as a salesperson.' }
        ]
      },
      es: {
        title: 'Estrategia "Little League": ROI Hiper-Local',
        excerpt: 'Los anuncios de Facebook son amplios. El marketing de mayor ROI es físico y comunitario.',
        contentBlocks: [
            { type: 'h2', text: 'La Valla de $500' },
            { type: 'paragraph', text: 'Patrocinar un equipo pone su logo en 15 camisetas de hijos de propietarios.' }
        ]
      }
    }
  },
  {
    id: '20',
    category: Category.CAREER,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Tech Coach', avatarUrl: '' },
    locales: {
      en: {
        title: 'Upskill or Die: The Augmented Tradesperson',
        excerpt: 'Robots won\'t replace plumbers. But plumbers using thermal cameras will replace those using flashlights.',
        contentBlocks: [
            { type: 'h2', text: 'The Tech Premium' },
            { type: 'paragraph', text: 'Workers interpreting smart home data earn 22% more. Move from "fixing" to "diagnosing" for higher security.' },
            { type: 'h3', text: 'Micro-Certifications' },
            { type: 'paragraph', text: '2-day certifications in EV Charger setup or Smart Home config are where the immediate money is.' },
            { type: 'h2', text: 'Continuous Learning' },
            { type: 'paragraph', text: 'Set aside 2 hours a week for learning. Whether it\'s a new tool or a new management technique, staying curious is your best insurance policy.' }
        ]
      },
      es: {
        title: 'Actualícese o Muera: El Trabajador Aumentado',
        excerpt: 'Los robots no reemplazarán plomeros. Pero plomeros con cámaras térmicas sí a los tradicionales.',
        contentBlocks: [
            { type: 'h2', text: 'Prima Tecnológica' },
            { type: 'paragraph', text: 'Trabajadores que interpretan datos ganan 22% más. Pase de "arreglar" a "diagnosticar".' }
        ]
      }
    }
  },
  {
    id: '21',
    category: Category.GROWTH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'SEO Expert', avatarUrl: '' },
    locales: {
      en: {
        title: 'Blue Ocean SEO: The Bilingual Content Gap',
        excerpt: 'Everyone fights for "Roof Repair" keywords. No one fights for "Reparación de Techos." Easy wins.',
        contentBlocks: [
            { type: 'h2', text: 'Low Competition, High Intent' },
            { type: 'paragraph', text: 'CPC for Spanish keywords is 90% lower. Capture the market others are ignoring for pennies on the dollar.' },
            { type: 'h3', text: 'Dialect-Correct Content' },
            { type: 'paragraph', text: 'Don\'t use Google Translate. Use Moil to write natural Spanish that uses the slang your local customers type.' },
            { type: 'h2', text: 'Dominate the Gap' },
            { type: 'paragraph', text: 'If your competitors aren\'t speaking to 30% of the market, you can win that 30% without a fight. Use this advantage to scale fast.' }
        ]
      },
      es: {
        title: 'SEO de Océano Azul: La Brecha Bilingüe',
        excerpt: 'Todos pelean por "Techos" en inglés. Casi nadie en español. Victorias fáciles.',
        contentBlocks: [
            { type: 'h2', text: 'Baja Competencia, Alta Intención' },
            { type: 'paragraph', text: 'El costo por clic en español es 90% menor. Capture el mercado ignorado por centavos.' }
        ]
      }
    }
  },
  {
    id: '22',
    category: Category.GROWTH,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Scaling Lead', avatarUrl: '' },
    locales: {
      en: {
        title: 'Crossing the Chasm: Scaling from 1 to 5 Vans',
        excerpt: 'The gap between 2 and 5 vans is where businesses break. Standardize before you scale.',
        contentBlocks: [
            { type: 'h2', text: 'The Dispatcher Hire' },
            { type: 'paragraph', text: 'Hire a human dispatcher at 3 vans to manage the crew while you manage the growth strategy. Chaos does not scale.' },
            { type: 'h3', text: 'Revenue per Van' },
            { type: 'paragraph', text: 'Keep revenue per van constant ($250k+). If it drops as you add vans, fix operations before adding more.' },
            { type: 'h2', text: 'Process is Freedom' },
            { type: 'paragraph', text: 'The only way to step out of the field is to build processes so good that you aren\'t needed. Documentation is the key to scaling.' }
        ]
      },
      es: {
        title: 'Cruzando el Abismo: Escalando de 1 a 5 Camionetas',
        excerpt: 'La brecha entre 2 y 5 camionetas es donde los negocios mueren. Estandarice antes de escalar.',
        contentBlocks: [
            { type: 'h2', text: 'Contratación del Despachador' },
            { type: 'paragraph', text: 'Contrate un despachador a las 3 camionetas para gestionar al equipo mientras usted planea el crecimiento.' }
        ]
      }
    }
  },
  {
    id: '23',
    category: Category.GROWTH,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Business Growth', avatarUrl: '' },
    locales: {
      en: {
        title: 'The Referral Engine: Turn 1 Customer Into 3 More',
        excerpt: 'Learn how contractors build referral systems that automatically generate new customers.',
        contentBlocks: [
            { type: 'h2', text: 'Engineering Trust' },
            { type: 'paragraph', text: 'Systematic day-3 follow-ups with referral incentives create a loop that replaces expensive ads.' },
            { type: 'list', items: [
                'Day-3 Follow-up: Ensure satisfaction and ask for feedback.',
                'Incentive Loop: Reward referrals with service credits.',
                'Auto-Requests: Use Moil to text review links automatically.'
            ]},
            { type: 'h2', text: 'Why Referrals Beat Ads' },
            { type: 'paragraph', text: 'A referred customer closes at a 70% higher rate and costs $0 in acquisition. Engineering this trust is the fastest way to $1M.' }
        ]
      },
      es: {
        title: 'El Motor de Referidos: Convierta un Cliente en 3 Más',
        excerpt: 'Aprenda cómo los contratistas crean sistemas de referidos que generan clientes automáticamente.',
        contentBlocks: [
            { type: 'h2', text: 'Ingeniería de Confianza' },
            { type: 'paragraph', text: 'Los seguimientos sistemáticos al tercer día con incentivos crean un ciclo que reemplaza anuncios caros.' },
            { type: 'list', items: [
                'Día 3: Asegure satisfacción y pida opinión.',
                'Ciclo de Incentivo: Premie referidos con créditos.',
                'Pedidos Automáticos: Moil envía links solo.'
            ]}
        ]
      }
    }
  },
  {
    id: '24',
    category: Category.FINANCE,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Financial Management', avatarUrl: '' },
    locales: {
      en: {
        title: 'Profit Margins Decoded: What You Should Actually Be Making',
        excerpt: 'Most contractors don\'t know their real profit margins. Learn the target margins by service type.',
        contentBlocks: [
            { type: 'h2', text: 'The Margin Trap' },
            { type: 'paragraph', text: 'Calculate your loaded labor rate correctly. If you don\'t include taxes and insurance, you are losing money.' },
            { type: 'list', items: [
                'Residential Service: Aim for 50-60% gross margin.',
                'Large Projects: Aim for 20-30% gross margin.',
                'Commercial Contracts: Aim for 15-20% gross margin.'
            ]},
            { type: 'h2', text: 'Knowing Your Break-Even' },
            { type: 'paragraph', text: 'Your "overhead" isn\'t just rent. It\'s every hour you aren\'t billing. If you don\'t know your daily nut, you\'re flying blind.' }
        ]
      },
      es: {
        title: 'Márgenes de Ganancia Decodificados: Lo que debería ganar',
        excerpt: 'La mayoría no conoce sus márgenes reales. Aprenda los márgenes objetivo por tipo de servicio.',
        contentBlocks: [
            { type: 'h2', text: 'La Trampa del Margen' },
            { type: 'paragraph', text: 'Calcule su tasa de mano de obra cargada. Si no incluye impuestos y seguros, pierde dinero.' }
        ]
      }
    }
  },
  {
    id: '25',
    category: Category.CX,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Customer Experience', avatarUrl: '' },
    locales: {
      en: {
        title: 'The 5-Star Experience System: From First Call to Fan',
        excerpt: 'Learn the exact customer service system that turns one-time customers into lifetime clients.',
        contentBlocks: [
            { type: 'h2', text: 'Touchpoint Mastery' },
            { type: 'paragraph', text: 'Booties, pre-arrival texts, and a 24-hour follow-up call are the backbone of a 5-star reputation.' },
            { type: 'list', items: [
                'Booties & Mats: Respect for the home is the #1 review topic.',
                'Pre-arrival Text: Professionalism starts before the doorbell.',
                '24hr Call: Resolve complaints before they hit Google.'
            ]},
            { type: 'h2', text: 'Experience over Repair' },
            { type: 'paragraph', text: 'Anyone can fix a pipe. Not everyone can make a homeowner feel safe and respected. That is what you bill for.' }
        ]
      },
      es: {
        title: 'El Sistema de Experiencia 5 Estrellas: De Llamada a Fan',
        excerpt: 'Aprenda el sistema exacto que convierte clientes únicos en clientes de por vida.',
        contentBlocks: [
            { type: 'h2', text: 'Maestría en Puntos de Contacto' },
            { type: 'paragraph', text: 'Cubre calzados, textos previos y llamadas de seguimiento son la base de una reputación.' }
        ]
      }
    }
  },
  {
    id: '26',
    category: Category.CAREER,
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Work-Life Balance', avatarUrl: '' },
    locales: {
      en: {
        title: 'The Burning Man: Preventing Contractor Burnout',
        excerpt: '73% of contractors experience burnout. Learn the warning signs before it destroys your business.',
        contentBlocks: [
            { type: 'h2', text: 'Delegate or Die' },
            { type: 'paragraph', text: 'You cannot be the tech, the salesman, and the bookkeeper forever. Systems prevent exhaustion.' },
            { type: 'h3', text: 'The Warning Signs' },
            { type: 'paragraph', text: 'Loss of pride in work and dreading the phone are red alerts. It is time to step back and build systems.' },
            { type: 'list', items: [
                'Set "Phone Off" hours strictly.',
                'Automate scheduling via AI.',
                'Hire your first dispatcher before you break.'
            ]}
        ]
      },
      es: {
        title: 'El Hombre Agotado: Previniendo el "Burnout" del Contratista',
        excerpt: 'El 73% de los contratistas sufren de agotamiento. Aprenda las señales antes de que destruya su negocio.',
        contentBlocks: [
            { type: 'h2', text: 'Delegue o Muera' },
            { type: 'paragraph', text: 'No puede ser el técnico, vendedor y contador para siempre. Los sistemas previenen el agotamiento.' }
        ]
      }
    }
  },
  {
    id: '27',
    category: Category.FINANCE,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Pricing Strategy', avatarUrl: '' },
    locales: {
      en: {
        title: 'The $200/Hour Technician: Command Premium Pricing',
        excerpt: 'Stop competing on price. Learn how contractors charge $200/hour and keep customers happy.',
        contentBlocks: [
            { type: 'h2', text: 'Value Positioning' },
            { type: 'paragraph', text: 'Flat-rate pricing and professional diagnosis allow you to move away from hourly rate arguments.' },
            { type: 'h3', text: 'The Diagnosis Fee' },
            { type: 'paragraph', text: 'Never waive your diagnostic fee. It values your knowledge, not just your labor. It filters out bad leads.' },
            { type: 'list', items: [
                'Professional Presentation: Clean trucks and tablets.',
                'Diagnosis Reports: Visual proof of the issue.',
                'Flat-rate menu: No surprise billing.'
            ]}
        ]
      },
      es: {
        title: 'El Técnico de $200/Hora: Cómo Exigir Precios Premium',
        excerpt: 'Deje de competir por precio. Aprenda cómo cobrar $200/hora y mantener clientes felices.',
        contentBlocks: [
            { type: 'h2', text: 'Posicionamiento de Valor' },
            { type: 'paragraph', text: 'Los precios de tarifa plana y el diagnóstico profesional permiten alejarse de peleas por horas.' }
        ]
      }
    }
  },
  {
    id: '28',
    category: Category.GROWTH,
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1521791721666-22a21188729d?w=800&h=450&fit=crop',
    author: { name: 'Moil Team', title: 'Business Models', avatarUrl: '' },
    locales: {
      en: {
        title: 'The Service Agreement Gold Mine: Recurring Revenue',
        excerpt: 'Learn how contractors build $150k+ recurring revenue with maintenance agreements.',
        contentBlocks: [
            { type: 'h2', text: 'Predictable Income' },
            { type: 'paragraph', text: 'Selling maintenance plans covers your overhead before the phone even rings for repairs.' },
            { type: 'list', items: [
                'Predictable cash flow during off-seasons.',
                'Higher business valuation for eventual exit.',
                'Automatic lead generation for larger system replacements.'
            ]},
            { type: 'h2', text: 'How to Launch' },
            { type: 'paragraph', text: 'Start with your top 50 customers. Offer them "Preferred Pricing" and two visits a year. Most will say yes for the peace of mind.' }
        ]
      },
      es: {
        title: 'La Mina de Oro de los Acuerdos: Ingresos Recurrentes',
        excerpt: 'Aprenda cómo los contratistas generan más de $150k recurrentes con acuerdos de mantenimiento.',
        contentBlocks: [
            { type: 'h2', text: 'Ingresos Predecibles' },
            { type: 'paragraph', text: 'Vender planes de mantenimiento cubre sus gastos fijos antes de que suene el teléfono.' }
        ]
      }
    }
  }
];
