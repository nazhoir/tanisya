import Blog from '@/components/shadcn-studio/blocks/blog-component-15/blog-component-15'
import CTA from '@/components/shadcn-studio/blocks/cta-section-01/cta-section-01'
import FAQ from '@/components/shadcn-studio/blocks/faq-component-17/faq-component-17'
import Footer from '@/components/shadcn-studio/blocks/footer-component-01/footer-component-01'
import Header from '@/components/shadcn-studio/blocks/hero-section-01/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-01/hero-section-01'
import LogoCloud from '@/components/shadcn-studio/blocks/logo-cloud-01/logo-cloud-01'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/hero-section-01/header'


const navigationData: NavigationSection[] = [
  {
    title: 'Home',
    href: '#'
  },
  {
    title: 'Products',
    href: '#'
  },
  {
    title: 'About Us',
    href: '#'
  },
  {
    title: 'Contacts',
    href: '#'
  }
]

const logos = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo-bw.png',
    alt: 'Amazon'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo-bw.png',
    alt: 'HubSpot'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo-bw.png',
    alt: 'Walmart'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo-bw.png',
    alt: 'Microsoft'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/evernote-icon-bw.png',
    alt: 'Evernote'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/paypal-logo-bw.png',
    alt: 'PayPal'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo-bw.png',
    alt: 'Airbnb'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/adobe-logo-bw.png',
    alt: 'Adobe'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/shopify-logo-bw.png',
    alt: 'Shopify'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/huawei-logo-bw.png',
    alt: 'Huawei'
  }
]

const blogPosts = [
  {
    title: 'Design Smarter: How User Behavior Shapes Winning Products',
    description: 'Learn how to discover what users truly want and build with confidence.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-04.png',
    imageAlt: 'Design workspace with color swatches',
    date: 'March 12, 2025',
    category: 'Product',
    author: 'Phillip Palmer',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    title: 'Nail Your First Launch: A Checklist for Product Debut Success',
    description: 'Avoid common launch traps and create excitement from day one.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-05.png',
    imageAlt: 'Product launch analytics',
    date: 'January 20, 2025',
    category: 'Startup Growth',
    author: 'Michael Brown',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    title: 'Why Fast Apps Win: The Blueprint for Lightning-Quick Experiences',
    description: 'Explore proven strategies to boost speed and delight users every time.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-06.png',
    imageAlt: 'Mobile app development',
    date: 'February 28, 2025',
    category: 'Product',
    author: 'Jane Smith',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    title: 'Scaling Design the Right Way with a Solid Component System',
    description: 'Build consistency, save time, and ship optimized UI every release.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-07.png',
    imageAlt: 'Component design system',
    date: 'March 05, 2025',
    category: 'Design',
    author: 'Dylan Field',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    title: 'Product KPIs That Actually Matter And How to Track Them',
    description: 'Measure progress the right way to build momentum and stay focused.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-08.png',
    imageAlt: 'Team analyzing KPIs',
    date: 'January 09, 2025',
    category: 'Design',
    author: 'Nina Rich',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    title: 'How AI-Driven Workflows Are Transforming Product Development',
    description: 'Discover smarter ways to ideate, design, and build using AI tools.',
    imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-09.png',
    imageAlt: 'AI in product development',
    date: 'March 05, 2025',
    category: 'Startup Growth',
    author: 'Startup Growth',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  }
]

const faqItems = [
  {
    question: 'What does your company do?',
    answer:
      "Our company specializes in delivering high-quality solutions that are tailored to meet the evolving needs of businesses and individuals. Whether it's a digital product, a creative service, or a custom solution."
  },
  {
    question: 'What services do you offer?',
    answer:
      'We offer a wide range of services including web development, graphic design, digital marketing, and custom software solutions. Our team works closely with clients to create personalized strategies that help them achieve their goals.'
  }
]

const HeroSection01Block = () => {
  return (
    <div className='relative'>
      {/* Header Section */}
      <Header navigationData={navigationData} />

      {/* Main Content */}
      <main className='flex flex-col'>
        <HeroSection />
      </main>
    </div>
  )
}

const LogoCloud01Block = () => {
  return <LogoCloud logos={logos} />
}

const BlogComponent15Block = () => {
  return <Blog blogPosts={blogPosts} />
}

const CtaSection01Block = () => {
  return <CTA />
}

const FaqComponent17Block = () => {
  return <FAQ faqItems={faqItems} />
}

const FooterComponent01Block = () => {
  return <Footer />
}

const LandingPage = () => {
  return (
    <div className='flex flex-col'>
      <HeroSection01Block />

      <LogoCloud01Block />

      <BlogComponent15Block />

      <CtaSection01Block />

      <FaqComponent17Block />

      <FooterComponent01Block />
    </div>
  )
}

export default LandingPage
