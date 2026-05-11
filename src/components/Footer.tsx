import Link from "next/link";
import Image from "next/image";
import FooterNewsletter from "./FooterNewsletter";

export default function Footer() {
  return (
    <footer role="contentinfo">
      <div className="foot-top">
        <div className="brand">
          <Image
            src="/images/logo.png"
            alt="EvangelCake"
            width={80}
            height={80}
          />
          <p>
            Pastelería artesanal en Zaragoza. Tartas hechas a mano, con alma
            brasileña, para los días que importan.
          </p>
          <FooterNewsletter />
        </div>
        <div>
          <h5>Catálogo</h5>
          <ul>
            <li>
              <Link href="/tartas-personalizadas">Tartas personalizadas</Link>
            </li>
            <li>
              <Link href="/#productos">Tres leches</Link>
            </li>
            <li>
              <Link href="/#productos">Bizcocho zanahoria</Link>
            </li>
            <li>
              <Link href="/#productos">Crumbl cookies</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Estudio</h5>
          <ul>
            <li>
              <Link href="/encargos">Encargos a medida</Link>
            </li>
            <li>
              <Link href="/sobre-nosotros">Sobre nosotros</Link>
            </li>
            <li>
              <Link href="/#prensa">Prensa</Link>
            </li>
            <li>
              <Link href="/blog">Hoy aprende</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Contacto</h5>
          <ul>
            <li>
              <a href="https://wa.me/34624131348">+34 624 13 13 48</a>
            </li>
            <li>
              <a
                href="https://instagram.com/evangelcake"
                target="_blank"
                rel="noopener noreferrer"
              >
                @evangelcake
              </a>
            </li>
            <li>
              <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>
            </li>
            <li>Pº María Agustín 13 · Zaragoza</li>
          </ul>
        </div>
      </div>
      <div className="foot-bot">
        <span>
          © {new Date().getFullYear()} EvangelCake ·{" "}
          <Link href="/aviso-legal">Aviso legal</Link> ·{" "}
          <Link href="/privacidad">Privacidad</Link> ·{" "}
          <Link href="/cookies">Cookies</Link> ·{" "}
          <Link
            href="/admin"
            className="foot-admin"
            aria-label="Panel interno"
          >
            ·
          </Link>
        </span>
        <span className="script">Hecho con amor</span>
      </div>
    </footer>
  );
}
