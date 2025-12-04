import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";
import qrCode from "@/assets/qr-code.png";
export const AppFooter = () => {
  const {
    t
  } = useTranslation();
  const [showContactDialog, setShowContactDialog] = useState(false);
  return <>
      <ContactSuggestionDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
      
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Provided By */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">{t("sidebar.providedBy")}</h3>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Everlasting Funeral Advisors</p>
                <a href="https://everlastingfuneraladvisors.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block">
                  everlastingfuneraladvisors.com
                </a>
              </div>
            </div>

            {/* About Us */}
            <div>
              <Link to="/about-us" className="text-xs font-semibold mb-3 tracking-wide block text-center text-blue-800">
                About Us
              </Link>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">{t("sidebar.followUs")}</h3>
              <a href="https://www.facebook.com/profile.php?id=61580859545223" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline">
                <Facebook className="mr-2 h-3 w-3" />
                Facebook
              </a>
            </div>

            {/* Contact & Quote */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Get Help</h3>
              <div className="space-y-1">
                <button onClick={() => setShowContactDialog(true)} className="text-left text-xs text-primary hover:underline flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {t("sidebar.contactSuggest")}
                </button>
                <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">
                  Request a Quote
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <img src={qrCode} alt="Everlasting Funeral Advisors QR Code" className="w-28 h-28 object-contain" />
              <p className="text-xs text-muted-foreground mt-2 text-center">Scan to contact us</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Everlasting Funeral Advisors. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>;
};