import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionDigitalProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionDigital = ({ value, onChange }: SectionDigitalProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">💻 Digital World</h2>
        <p className="text-muted-foreground mb-6">
          Manage your digital legacy including social media, online accounts, and digital assets.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="digital">Digital Assets & Accounts</Label>
        <Textarea
          id="digital"
          placeholder="Document your digital presence:

SOCIAL MEDIA:
- Facebook, Instagram, Twitter, LinkedIn
- Preferred action: memorialize, delete, or transfer

EMAIL ACCOUNTS:
- All email addresses
- Important messages to save
- Auto-responder wishes

ONLINE ACCOUNTS:
- Shopping (Amazon, eBay, etc.)
- Streaming services (Netflix, Spotify, etc.)
- Cloud storage (Google Drive, Dropbox, iCloud)
- Photo sharing sites
- Banking and financial apps

DIGITAL ASSETS:
- Cryptocur rency wallets
- NFTs or digital collectibles
- Domain names
- Online businesses or blogs

PASSWORD MANAGEMENT:
- Password manager name and master password location
- Two-factor authentication backup codes

Note: Store actual passwords securely in a password manager, not here."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">🔗 Helpful Resources:</h3>
        <ul className="text-sm space-y-1">
          <li>
            <a
              href="https://support.apple.com/en-us/102431"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Apple Legacy Contact Setup
            </a>
          </li>
          <li>
            <a
              href="https://myaccount.google.com/inactive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Inactive Account Manager
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
