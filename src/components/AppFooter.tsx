import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, MessageSquare } from "lucide-react";
import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";
import qrCode from "@/assets/qr-code.png";

export const AppFooter = () => {
  const { t } = useTranslation();
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  return (
    <>
      <ContactSuggestionDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
      
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-foreground mb-3">Everlasting Funeral Advisors</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your trusted partner in compassionate, affordable funeral planning.
              </p>
              <a 
                href="https://everlastingfuneraladvisors.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-primary hover:underline block mt-2"
              >
                everlastingfuneraladvisors.com
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/about-us" className="text-xs text-muted-foreground hover:text-primary block">
                  About Us
                </Link>
                <Link to="/pricing" className="text-xs text-muted-foreground hover:text-primary block">
                  Pricing & Plans
                </Link>
                <Link to="/resources" className="text-xs text-muted-foreground hover:text-primary block">
                  Helpful Resources
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Support</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowContactDialog(true)} 
                  className="text-left text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Contact & Support
                </button>
                <Link to="/faq" className="text-xs text-muted-foreground hover:text-primary block">
                  FAQ
                </Link>
                <a 
                  href="https://www.facebook.com/profile.php?id=61580859545223" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-primary"
                >
                  <Facebook className="mr-1 h-3 w-3" />
                  Follow Us
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <img src={qrCode} alt="Everlasting Funeral Advisors QR Code" className="w-24 h-24 object-contain" />
              <p className="text-xs text-muted-foreground mt-2 text-center">Scan to contact us</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Serving families nationwide with education, clarity, and compassionate guidance.
            </p>
          </div>

          {/* Legal & Copyright */}
          <div className="pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Everlasting Funeral Advisors. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};