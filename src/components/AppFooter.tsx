import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";

export const AppFooter = () => {
  const { t } = useTranslation();
  const [showContactDialog, setShowContactDialog] = useState(false);

  return (
    <>
      <ContactSuggestionDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
      />
      
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Provided By */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("sidebar.providedBy")}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Everlasting Funeral Advisors</p>
                <p>(323) 863-5804</p>
                <a
                  href="mailto:info@everlastingfuneraladvisors.com"
                  className="text-primary hover:underline block"
                >
                  info@everlastingfuneraladvisors.com
                </a>
                <a
                  href="https://everlastingfuneraladvisors.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block"
                >
                  everlastingfuneraladvisors.com
                </a>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("sidebar.aboutUs")}</h3>
              <Link
                to="/about-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Learn more about us
              </Link>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("sidebar.followUs")}</h3>
              <a
                href="https://www.facebook.com/profile.php?id=61580859545223"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </a>
            </div>

            {/* Contact & Quote */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Get Help</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowContactDialog(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("sidebar.contactSuggest")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="https://everlastingfuneraladvisors.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Request a Quote
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Everlasting Funeral Advisors. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};