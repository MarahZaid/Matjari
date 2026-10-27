import { Link } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  Shirt,
  Armchair,
  Sparkles,
  Dumbbell,
  Blocks,
  BookOpen,
  Watch,
  Store,
  Shapes,
  Compass,
} from "lucide-react";
import { categories, stores, products } from "../data/marketplace";
import {
  Image,
  ProductGrid,
  StoreCard,
  SectionHeading,
} from "../components/Marketplace";
const icons = [
  Headphones,
  Shirt,
  Armchair,
  Sparkles,
  Dumbbell,
  Blocks,
  BookOpen,
  Watch,
];
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="hero-pill">
            <span /> A world of independent stores
          </span>
          <h1>
            Many Stores.
            <br />
            <span>One Marketplace.</span>
          </h1>
          <p>
            Discover amazing products from independent stores,
            <br className="desktop-break" /> all in one place.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/products">
              Start shopping <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" to="/stores">
              Explore stores
            </Link>
          </div>
          <div className="hero-note">
            <span className="mini-logos">
              <i>f.</i>
              <i>n.</i>
              <i>os</i>
            </span>
            <span>
              Small stores. <strong>Endless possibilities.</strong>
            </span>
          </div>
        </div>
        <div className="hero-art">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <div className="hero-product hero-headphones">
            <Image eager id={products[0].image} alt="Studio headphones" />
            <span>Everyday, upgraded.</span>
          </div>
          <div className="hero-product hero-chair">
            <Image
              eager
              id="photo-1598300042247-d088f8ab3a91"
              alt="A thoughtfully designed accent chair"
            />
          </div>
          <div className="hero-product hero-bag">
            <Image
              eager
              id={products[1].image}
              alt="Canvas bag for everyday adventures"
            />
          </div>
          <div className="floating-note">
            <span>
              <ShoppingIcon />
            </span>
            <div>
              Discover something
              <br />
              <strong>uniquely you.</strong>
            </div>
            <Sparkles size={20} />
          </div>
          <span className="art-spark">✳</span>
        </div>
      </section>
      <div className="container discovery-strip">
        <div>
          <Store />
          <span>
            Independent stores
            <strong>Fresh perspectives, all in one place</strong>
          </span>
        </div>
        <div>
          <Shapes />
          <span>
            Something for everyone
            <strong>From daily essentials to little joys</strong>
          </span>
        </div>
        <div>
          <Compass />
          <span>
            Discover your next favorite
            <strong>Explore beyond the everyday</strong>
          </span>
        </div>
      </div>
      <section className="container section">
        <SectionHeading
          title="What are you looking for?"
          subtitle="A little of everything. Something just for you."
          to="/products"
          action="Explore all categories"
        />
        <div className="category-grid">
          {categories.map((c, i) => {
            const Icon = icons[i];
            return (
              <Link
                key={c}
                to={`/products?category=${encodeURIComponent(c)}`}
                className={`category-card category-${i}`}
              >
                <span>
                  <Icon size={25} strokeWidth={1.5} />
                </span>
                <strong>{c}</strong>
                <small>
                  Explore <ArrowRight size={12} />
                </small>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="stores-section">
        <div className="container section">
          <SectionHeading
            eyebrow="THE PEOPLE BEHIND YOUR FAVORITES"
            title="Good finds start with great stores."
            subtitle="Meet independent stores with a point of view."
            to="/stores"
            action="Meet all stores"
          />
          <div className="store-grid">
            {stores.slice(0, 4).map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          eyebrow="WORTH A CLOSER LOOK"
          title="Your next everyday favorites."
          subtitle="Thoughtful picks from across our marketplace."
          to="/products"
          action="Shop all products"
        />
        <ProductGrid products={products.slice(0, 8)} />
      </section>
      <section className="container bottom-banner">
        <div>
          <span className="eyebrow">CURIOUS LOOKS GOOD ON YOU</span>
          <h2>A new favorite is waiting.</h2>
          <p>Find the stores, stories, and little things that feel like you.</p>
        </div>
        <Link className="button" to="/stores">
          Find your kind of store <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
function ShoppingIcon() {
  return <Store size={21} />;
}
