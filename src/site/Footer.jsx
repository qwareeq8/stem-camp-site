import { Github, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-contact" aria-label="Site credit">
          <span className="footer-contact-name">© Yusuf Qwareeq</span>
          <div className="footer-actions" aria-label="Contact links">
            <a className="footer-icon-link" href="mailto:qwareeq8@gmail.com" aria-label="Email Yusuf Qwareeq" title="Email Yusuf Qwareeq">
              <Mail size={12} aria-hidden="true" />
            </a>
            <a className="footer-icon-link" href="https://qwareeq8.github.io/" target="_blank" rel="noreferrer" aria-label="Yusuf Qwareeq website" title="Yusuf Qwareeq website">
              <Globe size={12} aria-hidden="true" />
            </a>
            <a className="footer-icon-link" href="https://github.com/qwareeq8" target="_blank" rel="noreferrer" aria-label="Yusuf Qwareeq on GitHub" title="Yusuf Qwareeq on GitHub">
              <Github size={12} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
