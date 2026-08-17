/**
 * Default website content — the "current information on the website" as it was
 * hardcoded before the settings CMS existed. The dashboard Settings page pre-fills
 * from these, and every public component falls back to them when no saved setting
 * exists. Saved settings (site_settings table) override these values.
 */

export interface HeroSlide {
  image: string;
  kicker: string;
  title: string[];
  titleAccent: string;
  description: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export interface StatItem {
  value: number | string;
  label: string;
  suffix: string;
}

export interface CoreValue {
  title: string;
  body: string;
}

export interface Program {
  image: string;
  title: string;
  meta: string;
}

export interface Leader {
  role: string;
  name: string;
  initials: string;
  photo: string;
  profile: string;
  favoriteQuote: string;
}

export interface Testimony {
  quote: string;
  cite: string;
}

export interface MinistryData {
  title: string;
  body: string;
  mainLeader: string;
  assistantLeader: string;
  keyActivities: string[];
  meetingPlace: string;
  contact: string;
  image1: string;
  image2: string;
}

export interface LeadershipMember {
  role: string;
  name: string;
  photo: string;
}

export interface LeadershipGroup {
  title: string;
  description: string;
  members: LeadershipMember[];
}

export interface GalleryPhoto {
  src: string;
  alt: string;
}

export interface NewsArticle {
  slug: string;
  image: string;
  meta: string;
  title: string;
  body: string;
  content?: string[];
}

export interface ResourceItem {
  title: string;
  description: string;
  fileSize?: string;
}

export interface ResourceSection {
  title: string;
  description: string;
  items: ResourceItem[];
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string;
  children: NavLinkItem[];
}

export interface CommunityContent {
  kicker: string;
  title: string;
  description: string;
  backgroundImage: string;
  image: string;
  body: string[];
  gallery: string[];
}

export const siteDefaults = {
  hero: {
    slides: [
      {
        image: '/photos/hero.jpg',
        kicker: 'Pentecost Students & Associates · UENR',
        title: ['Where faith & campus life', 'grow as one'],
        titleAccent: 'grow as one',
        description:
          'From the GETFund Hostel Basement to land of our own — a fellowship of The Church of Pentecost, rooted in the Word and sent out to the campus.',
        cta: { label: 'Join PENSA', href: '/ministries' },
        ctaSecondary: { label: 'Upcoming Events', href: '/community/news' },
      },
      {
        image: '/photos/worship.jpg',
        kicker: 'Worship & Prayer',
        title: ['A place to encounter', "God's presence"],
        titleAccent: "God's presence",
        description:
          'Hour of Infilling, dawn prayers, Horeb sessions — every gathering is an opportunity to meet with God and be transformed.',
        cta: { label: 'Our Ministries', href: '/ministries' },
        ctaSecondary: { label: 'Prayer Schedule', href: '/ministries' },
      },
      {
        image: '/photos/outreach.jpg',
        kicker: 'Outreach & Evangelism',
        title: ['Taking the gospel', 'beyond the walls'],
        titleAccent: 'beyond the walls',
        description:
          'From campus evangelism to street outreach, we are passionate about sharing the love of Christ with everyone around us.',
        cta: { label: 'Get Involved', href: '/ministries' },
        ctaSecondary: { label: 'Our Story', href: '/about' },
      },
      {
        image: '/photos/study.jpg',
        kicker: 'Bible Studies & Discipleship',
        title: ['Growing together', 'in the Word'],
        titleAccent: 'in the Word',
        description:
          'Cell groups, Bible study sessions and discipleship training — building strong believers who are rooted in Scripture.',
        cta: { label: 'Find a Group', href: '/ministries' },
        ctaSecondary: { label: 'About Us', href: '/about' },
      },
    ],
  },

  stats: {
    items: [
      { value: 1200, label: 'Students Reached', suffix: '+' },
      { value: 576, label: 'Souls Won', suffix: '' },
      { value: 183, label: 'Water Baptisms', suffix: '' },
      { value: 80, label: 'Programs Held', suffix: '+' },
    ],
  },

  who_we_are: {
    kicker: 'Who we are',
    title: "The Hope of God's Glory",
    body:
      "PENSA-UENR began in late 2012 as a shared fellowship with KNUST PENSA students, and started officially in 2013 with 12 members meeting in the GETFund Hostel Basement. Today, with land of our own and a building project underway, we remain students following Christ together.",
    image: '/photos/serving.jpg',
  },

  values: {
    kicker: 'Our Values',
    title: 'What we stand for',
    values: [
      { title: 'Word & Prayer', body: 'Rooted in Scripture and standing firm in prayer.' },
      { title: 'Love & Care', body: 'Every student finds a home and a helping hand.' },
      {
        title: 'Service & Giving',
        body: "Stewarding our time, talents and resources for God's kingdom.",
      },
    ],
  },

  programs: {
    kicker: 'Programs',
    title: 'Gatherings that shape us',
    programs: [
      { image: '/photos/hero.jpg', title: 'Sunday Service', meta: 'Sun · 10:30 AM' },
      { image: '/photos/study.jpg', title: 'Midweek Bible Study', meta: 'Tue · 9:00 PM' },
      { image: '/photos/worship.jpg', title: 'Hour of Infilling', meta: 'Sun · 9:30 AM' },
      { image: '/photos/outreach.jpg', title: 'Outreach & Evangelism', meta: 'Sat · 5:00 AM' },
    ],
  },

  leadership_preview: {
    kicker: 'Leadership',
    title: 'Meet the team',
    leaders: [
      {
        role: 'President',
        name: 'President',
        initials: '?',
        photo: '/photos/L1.png',
        profile: 'Profile information to be updated.',
        favoriteQuote: '"To be updated."',
      },
      {
        role: 'Vice President',
        name: 'Vice President',
        initials: '?',
        photo: '/photos/L2.png',
        profile: 'Profile information to be updated.',
        favoriteQuote: '"To be updated."',
      },
      {
        role: 'General Secretary',
        name: 'General Secretary',
        initials: '?',
        photo: '/photos/L3.png',
        profile: 'Profile information to be updated.',
        favoriteQuote: '"To be updated."',
      },
    ],
  },

  testimonies: {
    kicker: 'Testimonies',
    title: 'Lives changed by grace',
    testimonies: [
      {
        quote:
          'PENSA-UENR welcomed me like family. Through the Bible studies and prayer meetings, I found purpose and gave my life to Christ.',
        cite: 'Ama Serwaa · Level 300, Nursing',
      },
      {
        quote:
          'PENSA gave me a family away from home. The dawn prayers and cell groups kept me grounded through every exam season.',
        cite: 'Kofi Mensah · Level 200, Renewable Energy Engineering',
      },
      {
        quote:
          'I joined as a shy first-year. The mentorship and worship team helped me grow in confidence and in my walk with God.',
        cite: 'Efua Owusu · Level 400, Business Administration',
      },
    ],
  },

  about: {
    kicker: 'About PENSA-UENR',
    title: 'Who We Are',
    description: '',
    backgroundImage: '/photos/about.jpg',
    story: [
      'PENSA-UENR is the University of Energy and Natural Resources chapter of the Pentecost Students and Associates — the tertiary arm of The Church of Pentecost. We operate fully within the governance of the Church, with a Travelling Secretary providing pastoral oversight at the campus level.',
      'We began in late 2012 as a shared fellowship with KNUST PENSA students, and started officially in 2013 with 12 members (8 active), meeting in the GETFund Hostel Basement. Today, with land of our own and a building project underway, we remain students following Christ together.',
    ],
    image: '/photos/serving.jpg',
    vision:
      'Insert here: the finalized five-year strategic vision statement (this also anchors slide one of the homepage slider).',
    mission: 'Insert here: the finalized mission statement of PENSA-UENR.',
    timeline: [
      { year: '2012', body: 'UENR is established, growing out of the Faculty of Renewable Natural Resources of KNUST. PENSA-UENR begins as a shared fellowship with KNUST PENSA students.' },
      { year: 'Late 2012', body: 'The KNUST students leave for industrial attachment — and UENR students step in to keep the fellowship going.' },
      { year: '2013', body: 'Official independent start, under Travelling Secretary Pastor Emmanuel Ayisi Mensah. Bro. Meshack is appointed first President. 12 members (8 active) begin meeting in the GETFund Hostel Basement, later moving to Sunday services at 10:30am.' },
      { year: '2014/15', body: 'Monday prayer meetings and Horeb Prayer Sessions are introduced. The fellowship makes its first deposit toward land: GH₵10,000.' },
      { year: '2015/16', body: "A second GH₵10,000 deposit follows. Prayer meetings move to Tuesdays so members can join the university's Intercessors on Mondays — Tuesday prayer meetings draw an average of 70 students." },
      { year: '2017/18–2018/19', body: 'Hour of Infilling is introduced. The land is formally acquired from the Fiapre Traditional Council with a GH₵22,000 down payment toward a total cost of GH₵26,500.' },
      { year: 'Today', body: 'A building project is underway on our own land — from the GETFund Hostel Basement to a permanent home.' },
    ],
    faithIntro:
      'Insert here: the finalized statement of faith. Since PENSA operates under the authority of The Church of Pentecost, this typically mirrors the Church\'s doctrinal statement, including:',
    faithPoints: [
      'The Bible is the inspired, infallible Word of God — the final authority for faith and practice.',
      'There is one God, eternally existent in three persons: Father, Son and Holy Spirit.',
      'Salvation is by grace through faith in Jesus Christ, who died for our sins and rose again.',
      'Water baptism by immersion for believers, and the baptism of the Holy Spirit with the evidence of speaking in tongues.',
      'Divine healing, the second coming of Christ, and the resurrection of the dead.',
    ],
  },

  leadership: {
    header: {
      kicker: 'Leadership',
      title: 'Leadership',
      description: 'The servants leading PENSA-UENR',
      backgroundImage: '/photos/about.jpg',
    },
    groups: [
      {
        title: 'Travelling Secretary, Patron & Alumni President',
        description:
          'The spiritual leaders providing pastoral oversight and guidance to PENSA-UENR.',
        members: [
          { role: 'Travelling Secretary', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Patron', name: 'To be updated', photo: '/photos/L2.png' },
          { role: 'Alumni President', name: 'To be updated', photo: '/photos/L3.png' },
        ],
      },
      {
        title: '7 Member Board',
        description:
          'The governing board overseeing the strategic direction and operations of the fellowship.',
        members: [
          { role: 'Board Chair', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Board Member', name: 'To be updated', photo: '/photos/L2.png' },
          { role: 'Board Member', name: 'To be updated', photo: '/photos/L3.png' },
          { role: 'Board Member', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Board Member', name: 'To be updated', photo: '/photos/L2.png' },
          { role: 'Board Member', name: 'To be updated', photo: '/photos/L3.png' },
          { role: 'Board Secretary', name: 'To be updated', photo: '/photos/L1.png' },
        ],
      },
      {
        title: 'Local Church Council (LCC)',
        description:
          'The executive committee managing the day-to-day activities and programs of PENSA-UENR.',
        members: [
          { role: 'President', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Vice President', name: 'To be updated', photo: '/photos/L2.png' },
          { role: 'General Secretary', name: 'To be updated', photo: '/photos/L3.png' },
          { role: 'Financial Secretary', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Organizer', name: 'To be updated', photo: '/photos/L2.png' },
        ],
      },
      {
        title: 'Stewards (Deputies)',
        description:
          'Assisting department heads and supporting the smooth execution of fellowship activities.',
        members: [
          { role: 'Steward', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Steward', name: 'To be updated', photo: '/photos/L2.png' },
          { role: 'Steward', name: 'To be updated', photo: '/photos/L3.png' },
        ],
      },
      {
        title: 'Missionaries',
        description:
          'Members dedicated to evangelism, outreach, and spreading the gospel on campus and beyond.',
        members: [
          { role: 'Missionary', name: 'To be updated', photo: '/photos/L1.png' },
          { role: 'Missionary', name: 'To be updated', photo: '/photos/L2.png' },
        ],
      },
    ],
  },

  ministries: {
    header: {
      kicker: 'Ministries',
      title: 'Grow with us',
      description: 'Serve, worship and grow through one of our ministries — every department exists to help students follow Christ together.',
      backgroundImage: '/photos/hero.jpg',
    },
    cta: {
      kicker: 'Get involved',
      title: 'Find your place in the fellowship',
      label: 'Talk to us',
      href: '/contact',
    },
    ministries: [
      {
        title: 'Evangelism & Outreach',
        body: 'Taking the gospel beyond the lecture halls.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Campus evangelism', 'Street outreach', 'Door-to-door visits', 'Media evangelism'],
        meetingPlace: 'Main Auditorium',
        contact: 'TBD',
        image1: '/photos/outreach.jpg',
        image2: '/photos/serving.jpg',
      },
      {
        title: 'Prayer',
        body: 'Dawn prayers, Horeb sessions and intercession.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Dawn prayers', 'Horeb sessions', 'Intercession', 'Prayer retreats'],
        meetingPlace: 'Prayer Ground',
        contact: 'TBD',
        image1: '/photos/study.jpg',
        image2: '/photos/worship.jpg',
      },
      {
        title: 'Bible Studies',
        body: 'Growing in the Word through cell groups.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Cell group meetings', 'Bible study sessions', 'Scripture memorization', 'Discipleship training'],
        meetingPlace: 'Various Halls',
        contact: 'TBD',
        image1: '/photos/study.jpg',
        image2: '/photos/hero.jpg',
      },
      {
        title: 'Music & Worship',
        body: 'Leading the fellowship in worship.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Choir practice', 'Worship leading', 'Music training', 'Concert organization'],
        meetingPlace: 'Music Room',
        contact: 'TBD',
        image1: '/photos/worship.jpg',
        image2: '/photos/serving.jpg',
      },
      {
        title: 'Media',
        body: 'Photography, video and social media.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Event coverage', 'Social media management', 'Video production', 'Graphics design'],
        meetingPlace: 'Media Center',
        contact: 'TBD',
        image1: '/photos/serving.jpg',
        image2: '/photos/hero.jpg',
      },
      {
        title: 'Welfare',
        body: 'Every student finds a home and a helping hand.',
        mainLeader: 'TBD',
        assistantLeader: 'TBD',
        keyActivities: ['Student support', 'Care packages', 'Visitations', 'Community service'],
        meetingPlace: 'Fellowship Hall',
        contact: 'TBD',
        image1: '/photos/serving.jpg',
        image2: '/photos/outreach.jpg',
      },
    ],
  },

  pensice: {
    kicker: 'Community · PENSICE',
    title: 'PENSICE',
    description:
      'Developing campus leaders through mentorship, training and practical discipleship.',
    backgroundImage: '/photos/portrait.jpg',
    image: '/photos/portrait.jpg',
    body: [
      'PENSICE (Pentecost Students in Campus Excellence) is the leadership development arm of PENSA-UENR. It focuses on raising godly leaders who will impact the campus and beyond.',
      'Through mentorship programs, leadership training workshops, and practical discipleship, PENSICE equips students to lead with integrity and purpose.',
    ],
    gallery: [
      '/photos/serving.jpg',
      '/photos/study.jpg',
      '/photos/worship.jpg',
      '/photos/outreach.jpg',
      '/photos/impact.jpg',
    ],
  },

  plc: {
    kicker: 'Community · PLC',
    title: 'Pensice Leaders Campus',
    description:
      'Developing campus leaders through mentorship, training and practical discipleship.',
    backgroundImage: '/photos/serving.jpg',
    image: '/photos/serving.jpg',
    body: [
      'PLC (Pensice Leaders Campus) is the leadership development arm of PENSA-UENR. It focuses on raising godly leaders who will impact the campus and beyond.',
      'Through mentorship programs, leadership training workshops, and practical discipleship, PLC equips students to lead with integrity and purpose.',
    ],
    gallery: [
      '/photos/serving.jpg',
      '/photos/study.jpg',
      '/photos/worship.jpg',
      '/photos/outreach.jpg',
      '/photos/hero.jpg',
    ],
  },

  cenacle: {
    kicker: 'Community · Cenacle',
    title: 'Cenacle',
    description: "A time of deep worship, prayer and encounter with God's presence.",
    backgroundImage: '/photos/study.jpg',
    image: '/photos/worship.jpg',
    body: [
      "Cenacle is a special gathering dedicated to deep worship, prayer and seeking God's face. Named after the Upper Room where the disciples gathered before Pentecost, it is a time for spiritual renewal and encounter.",
      "Students come together for extended times of worship, prayer and the study of God's Word, seeking a fresh outpouring of the Holy Spirit.",
    ],
    gallery: [
      '/photos/worship.jpg',
      '/photos/study.jpg',
      '/photos/serving.jpg',
      '/photos/hero.jpg',
      '/photos/outreach.jpg',
    ],
  },

  gallery: {
    header: {
      kicker: 'Community · Gallery',
      title: 'Moments from campus',
      description: 'Fellowship, worship, outreach and every moment in between.',
      backgroundImage: '/photos/worship.jpg',
    },
    photos: [
      { src: '/photos/hero.jpg', alt: 'PENSA-UENR students in fellowship' },
      { src: '/photos/serving.jpg', alt: 'Members serving together' },
      { src: '/photos/study.jpg', alt: 'Bible study session' },
      { src: '/photos/worship.jpg', alt: 'Worship and praise' },
      { src: '/photos/outreach.jpg', alt: 'Outreach and evangelism' },
      { src: '/photos/impact.jpg', alt: 'Building project and outreach' },
      { src: '/photos/portrait.jpg', alt: 'Members portrait' },
      { src: '/photos/about.jpg', alt: 'Fellowship gathering' },
    ],
  },

  news: {
    header: {
      kicker: 'Community · News & Events',
      title: 'News around the campus',
      description: 'Official PENSA-UENR communication — announcements, evangelism reports, opportunities and achievements.',
      backgroundImage: '/photos/impact.jpg',
    },
    events: [
      { title: 'Sunday Service', meta: 'Sun · 10:30 AM' },
      { title: 'Hour of Infilling', meta: 'Sun · 9:30 AM' },
      { title: 'Midweek Bible Study', meta: 'Tue · 9:00 PM' },
      { title: 'Outreach & Evangelism', meta: 'Sat · 5:00 AM' },
    ],
    articles: [
      {
        slug: 'building-project-fund-drive',
        image: '/photos/impact.jpg',
        meta: 'Announcement · Aug 2026',
        title: 'Building Project Fund Drive Underway',
        body: 'Insert here: current building status, fund balance and the next milestone. The land was acquired from the Fiapre Traditional Council in 2017/18–2018/2019.',
        content: [
          'The PENSA-UENR building project is progressing steadily. Thanks to the generous contributions of members and supporters, we have reached a significant milestone in our journey toward a permanent worship center.',
          'The land was acquired from the Fiapre Traditional Council in 2017/18–2018/2019 with a GH₵22,000 down payment toward a total cost of GH₵26,500. Since then, the fellowship has been working tirelessly to raise funds for the construction.',
          'We are currently in the foundation stage and need your continued support. Every contribution brings us closer to completing this dream. Join us in building a place of worship for generations to come.',
        ],
      },
      {
        slug: '576-souls-won',
        image: '/photos/outreach.jpg',
        meta: 'Evangelism · Aug 2026',
        title: '576 Souls Won in the First Semester',
        body: "Our highest documented output in the fellowship's history — including 497 souls won and 179 baptisms through the sector-wide \"Beginning with Jesus\" Campus Crusade.",
        content: [
          'This semester has been our most fruitful yet in terms of evangelism and soul winning. Through the sector-wide "Beginning with Jesus" Campus Crusade, we recorded an unprecedented 576 souls won to Christ.',
          "The campaign included door-to-door evangelism, campus outreach programs, and special revival meetings. In addition to the 576 converts, 179 new believers were baptized in water, marking a powerful testimony of God's work among us.",
          "We give glory to God for this harvest and encourage every member to continue being a witness on campus. The harvest is plentiful, and we are called to be laborers.",
        ],
      },
      {
        slug: 'midweek-bible-studies-resume',
        image: '/photos/study.jpg',
        meta: 'Bible Studies · Aug 2026',
        title: 'Midweek Bible Studies Resume for the Semester',
        body: 'Insert here: current venue and schedule for midweek Bible study, prayer meetings and the Hour of Infilling.',
        content: [
          "Midweek Bible studies have resumed for the new semester. All members are encouraged to attend and invite fellow students for an enriching time in God's Word.",
          'The sessions cover in-depth study of Scripture, practical Christian living, and prayer. Whether you are a new believer or have been walking with Christ for years, there is something for everyone.',
          "Come with your Bible, a notebook, and an open heart. Let us grow together in the knowledge of our Lord Jesus Christ.",
        ],
      },
    ],
  },

  resources: {
    header: {
      kicker: 'Resources',
      title: 'Resources',
      description: 'Access important documents and guides',
      backgroundImage: '/photos/study.jpg',
    },
    sections: [
      {
        title: 'Pentecost',
        description:
          'Documents and resources rooted in the Pentecostal faith and the doctrine of the Church of Pentecost.',
        items: [
          {
            title: 'Tenets of the Church',
            description: 'The foundational beliefs and doctrinal statements that guide our faith and practice.',
            fileSize: '2.4 MB',
          },
          {
            title: 'Constitution & By-Laws',
            description: 'The governing document of the Church of Pentecost and its operational by-laws.',
            fileSize: '5.1 MB',
          },
          {
            title: 'Ministerial Handbook',
            description: 'Guidelines and protocols for ministers and church leadership across all assemblies.',
            fileSize: '3.8 MB',
          },
        ],
      },
      {
        title: 'Youth Ministry',
        description:
          'Resources dedicated to youth empowerment, discipleship, and spiritual growth.',
        items: [
          {
            title: 'Youth Ministry Handbook',
            description: 'Operational guide for youth leaders and members on programs, events, and outreach.',
            fileSize: '1.9 MB',
          },
          {
            title: 'Discipleship Materials',
            description: 'Study guides, devotionals, and training resources for youth spiritual development.',
            fileSize: '4.2 MB',
          },
          {
            title: '5-Year Vision Plan',
            description: 'The strategic roadmap for youth ministry growth and impact over the next five years.',
            fileSize: '2.7 MB',
          },
        ],
      },
      {
        title: 'PENSA UENR',
        description:
          'Internal documents and resources specific to the PENSA University of Energy and Natural Resources chapter.',
        items: [
          {
            title: 'PENSA Constitution',
            description: 'The governing document for PENSA chapters, outlining structure and operations.',
            fileSize: '1.5 MB',
          },
          {
            title: 'Leadership Guide',
            description: 'Roles, responsibilities, and expectations for PENSA-UENR executive members.',
            fileSize: '1.2 MB',
          },
          {
            title: 'Program Calendar',
            description: 'Annual schedule of PENSA-UENR activities, events, and fellowship meetings.',
            fileSize: '890 KB',
          },
          {
            title: 'Academic & Scholarship Board',
            description: 'Information on academic support, scholarships, and financial aid opportunities for members.',
            fileSize: '2.1 MB',
          },
        ],
      },
    ],
  },

  contact: {
    header: {
      kicker: 'Contact',
      title: 'Get in touch',
      description:
        'Reach out to the PENSA-UENR executive committee — we would love to hear from you.',
    },
    backgroundImage: '/photos/hero.jpg',
    address: 'UENR, Sunyani, Ghana',
    phone: '+233 (0) 55 123 4567',
    email: 'info@pensa-uenr.org',
  },

  footer: {
    brandHeading: 'PENSA-UENR',
    brandDescription:
      'Pentecost Students & Associates, University of Energy and Natural Resources, Sunyani. A ministry of The Church of Pentecost.',
    social: [
      { label: 'Facebook', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
    explore: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/ministries', label: 'Ministries' },
      { href: '/community/pensice', label: 'PENSICE' },
      { href: '/community/plc', label: 'PLC' },
      { href: '/community/cenacle', label: 'CENACLE' },
      { href: '/community/gallery', label: 'Gallery' },
      { href: '/community/news', label: 'News & Events' },
      { href: '/contact', label: 'Contact' },
    ],
    contactInfo: {
      address: 'UENR, Sunyani, Ghana',
      phone: '+233 (0) 55 123 4567',
      email: 'info@pensa-uenr.org',
    },
  },

  branding: {
    logo: '/logo.png',
    brandName: 'PU-HUB',
    brandTagline: 'PENSA UENR Hub',
    siteName: 'PENSA-UENR',
    siteTagline: 'Pentecost Students & Associates · UENR',
  },

  fonts: {
    displayFont: 'Sora',
    bodyFont: 'Plus Jakarta Sans',
  },

  colors: {
    primary: '#16289e',
    primaryDark: '#0f1d6e',
    primaryLight: '#2a3db5',
    accent: '#e40000',
    accentCream: '#ffe381',
    surface: '#eef1fa',
    text: '#16289e',
    textMuted: '#8b9de0',
  },

  styles: {
    cornerRadius: 16,
    buttonStyle: 'filled',
    showIcons: true,
    iconAlignment: 'left',
  },

  motion: {
    revealAnimations: true,
    autoPlayCarousels: true,
    hoverEffects: true,
  },

  flow: {
    navGroups: [
      {
        label: 'Home',
        href: '/',
        children: [],
      },
      {
        label: 'About',
        href: '/about',
        children: [
          { label: 'About Us', href: '/about' },
          { label: 'Leadership', href: '/leadership' },
        ],
      },
      {
        label: 'Ministries',
        href: '/ministries',
        children: [],
      },
      {
        label: 'Community',
        href: '/community/pensice',
        children: [
          { label: 'PENSICE', href: '/community/pensice' },
          { label: 'PLC', href: '/community/plc' },
          { label: 'CENACLE', href: '/community/cenacle' },
          { label: 'Gallery', href: '/community/gallery' },
          { label: 'News & Events', href: '/community/news' },
        ],
      },
      {
        label: 'Resources',
        href: '/resources',
        children: [],
      },
      {
        label: 'Contact',
        href: '/contact',
        children: [],
      },
    ],
  },
};

export type SiteSectionKey = keyof typeof siteDefaults;
