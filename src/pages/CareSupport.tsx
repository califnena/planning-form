import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Sparkles, ArrowRight, Mic, Volume2, VolumeX, Home, LogOut, CheckCircle, HelpCircle, MessageCircle, FileText, ClipboardCheck, Lock, Phone, Download, ArrowRightCircle, BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import { ClaireWelcomeModal } from "@/components/assistant/ClaireWelcomeModal";
import { PersonalSupportModal } from "@/components/assistant/PersonalSupportModal";
import { EmotionalSupportLimitModal } from "@/components/assistant/EmotionalSupportLimitModal";
import NotAdviceNote from "@/components/NotAdviceNote";
import { requireSessionOrRedirect } from "@/lib/sessionGuard";
import { isStoreIAP } from "@/lib/billingMode";
import { StoreIAPModal } from "@/components/StoreIAPModal";
import { AfterDeathResourcesResponse } from "@/components/assistant/AfterDeathResourcesResponse";
import { useEmotionalSupportSessions } from "@/hooks/useEmotionalSupportSessions";
import claireAvatar from "@/assets/claire-avatar.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Message = { role: "user" | "assistant"; content: string; isError?: boolean };
type Mode = "planning" | "afterdeath" | "emotional" | null;

// Mode-specific fallback messages when AI fails
const ERROR_FALLBACK_MESSAGES: Record<Exclude<Mode, null>, string> = {
  planning: "I'm here. If you tell me what you're working on, I can guide you. You can also use the guides and checklists below.",
  afterdeath: "I'm here. If you tell me what happened and what you need help with first, I'll guide you. You can also download the After Death Guide below.",
  emotional: "I'm here with you. If you want, tell me what's on your mind. If you'd rather not type, you can use the quick options below."
};

// Generic fallback when mode is null
const GENERIC_ERROR_FALLBACK = "Sorry, I didn't catch that. Please try again, or tap one of the quick options below.";

// Safe error logging (no PII)
const logClaireError = (mode: Mode, errorCode: string | number, errorMessage: string, isRetry: boolean) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    mode: mode || "none",
    errorCode: String(errorCode),
    errorMessage: errorMessage.slice(0, 200), // Truncate to avoid PII leakage
    isRetry
  };
  console.log("[Claire Error Log]", JSON.stringify(logEntry));
  // Future: Could store in a claire_error_logs table if needed
};


type QuickAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt?: string;
  navigateTo?: string;
  showAfterDeathResources?: boolean;
  downloadUrl?: string;
};

const PLANNING_ACTIONS: QuickAction[] = [
  { label: "After-Death Planner & Checklist", showAfterDeathResources: true, icon: ClipboardCheck },
  { label: "Help me understand my options", prompt: "Can you help me understand my planning options?", icon: HelpCircle },
  { label: "Help me continue my plan", prompt: "I want to continue working on my plan.", icon: FileText },
  { label: "I have a question", prompt: "I have a question about planning.", icon: MessageCircle },
  { label: "I need more support", prompt: "I'm feeling overwhelmed and need support.", icon: Heart },
];

const AFTERDEATH_ACTIONS: QuickAction[] = [
  { label: "What needs to be done first?", prompt: "Someone has passed away. What needs to be done first?", icon: ArrowRightCircle },
  { label: "Who needs to be notified?", prompt: "Who needs to be notified after someone passes away?", icon: MessageCircle },
  { label: "What documents are needed?", prompt: "What documents will I need to gather after a death?", icon: FileText },
  { label: "Funeral and service decisions", prompt: "What decisions need to be made about the funeral or memorial service?", icon: ClipboardCheck },
  { label: "What can wait until later?", prompt: "What tasks can wait until later? I don't want to miss anything urgent.", icon: HelpCircle },
  { label: "Download After Death Guide", downloadUrl: "/guides/EFA-After-Death-Planner-and-Checklist.pdf", icon: Download },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
];

const EMOTIONAL_ACTIONS: QuickAction[] = [
  { label: "How do I cope with grief?", prompt: "How do I cope with grief? I'm struggling and don't know what to do.", icon: Heart },
  { label: "Is what I'm feeling normal?", prompt: "Is what I'm feeling normal? I'm not sure if my reactions are okay.", icon: HelpCircle },
  { label: "How do I talk to others about my loss?", prompt: "How do I talk to family and friends about my loss? It feels so hard.", icon: MessageCircle },
  { label: "When does grief get easier?", prompt: "When does grief get easier? Will I always feel this way?", icon: HelpCircle },
  { label: "I'm struggling right now", prompt: "I'm really struggling right now. What can I do to feel a little better?", icon: Heart },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
];

// ============== TOPIC CATEGORIES ==============
type TopicCategory = 
  | "first_steps" 
  | "documents" 
  | "notifications" 
  | "funeral_decisions" 
  | "financial" 
  | "grief_coping"
  | "family_communication"
  | "timeline"
  | "general";

// ============== MAPPED INSTANT ANSWERS - Displayed immediately without AI call ==============
const INSTANT_ANSWERS: Record<string, { answer: string; topic: TopicCategory; followUp: string }> = {
  // Planning Ahead
  "What should I decide first when planning ahead?": {
    topic: "first_steps",
    answer: "Start with the basics: Do you prefer burial or cremation? Would you like a service, and if so, what type? These two decisions shape everything else. You can always change your mind later.",
    followUp: "Would you like to talk through burial vs. cremation options?"
  },
  "How do I choose a person to be in charge after I'm gone?": {
    topic: "documents",
    answer: "Choose someone you trust who is organized, calm under pressure, and willing to follow your wishes. It's helpful to pick someone geographically close. Talk to them first to make sure they're comfortable with the responsibility.",
    followUp: "Have you thought about who that might be?"
  },
  "What documents should I gather for end-of-life planning?": {
    topic: "documents",
    answer: "Key documents include: your will, advance directive or living will, healthcare power of attorney, financial power of attorney, life insurance policies, bank/investment account information, and property deeds. Keep them in a fireproof box or safe deposit box.",
    followUp: "Would you like to work on organizing these documents?"
  },
  "How do I share my wishes with my family?": {
    topic: "family_communication",
    answer: "Pick a calm moment, not a holiday. Start simply: 'I've been thinking about planning ahead and want to share my wishes with you.' Focus on one topic at a time. It's okay if they resist—plant the seed and return to it later.",
    followUp: "What part of this conversation feels hardest for you?"
  },
  "How do I plan for funeral costs without overpaying?": {
    topic: "financial",
    answer: "Get itemized price lists from 2-3 funeral homes (they're required to provide them). Avoid prepaying unless through a reputable provider. Consider direct cremation or burial for the lowest cost. You don't have to buy everything from one place.",
    followUp: "Would you like to know what options are available in your area?"
  },
  "What if I want a simple funeral or cremation?": {
    topic: "funeral_decisions",
    answer: "Simple is a valid choice. Direct cremation (no service) or direct burial are the most affordable options. You can still have a memorial gathering separately. Many people find simple arrangements are less stressful for everyone.",
    followUp: "Are you thinking about cremation or burial?"
  },
  // After Death
  "Someone has passed away. What needs to be done first?": {
    topic: "first_steps",
    answer: "Here's what most people do first:\n• If unexpected: call 911. If expected (hospice): call the hospice or funeral home.\n• Notify one family member to help coordinate.\n• Contact a funeral home for transport.\n• Secure the home, keys, and pets.\n• Locate ID and any written wishes.",
    followUp: "Was this at home, hospital, or hospice?"
  },
  "Who needs to be notified first after someone passes away?": {
    topic: "notifications",
    answer: "Start with:\n• Immediate family members\n• The person's employer (if applicable)\n• Social Security Administration\n• Banks and financial institutions\n• Insurance companies\n• Utility companies can wait a few weeks.",
    followUp: "Do you have a list of accounts to notify?"
  },
  "What documents will I need to gather after a death?": {
    topic: "documents",
    answer: "You'll need:\n• Death certificate (order 10+ copies)\n• Will or trust documents\n• Life insurance policies\n• Bank and investment statements\n• Property deeds\n• Social Security number\n• Birth certificate and ID",
    followUp: "Have you been able to locate any of these documents?"
  },
  "What decisions need to be made about the funeral or memorial service?": {
    topic: "funeral_decisions",
    answer: "Key decisions:\n• Burial or cremation\n• Type of service (religious, secular, celebration of life)\n• Location (funeral home, church, cemetery, other)\n• Who will officiate\n• Music, readings, speakers\n• Open or closed casket (if applicable)",
    followUp: "Did the person leave any written wishes about their service?"
  },
  "What tasks can wait until later? I don't want to miss anything urgent.": {
    topic: "timeline",
    answer: "Can wait 2-4 weeks:\n• Canceling subscriptions and memberships\n• Selling or donating belongings\n• Updating property titles\n• Filing probate (unless urgent)\n\nFocus now on: funeral arrangements, death certificates, and notifying close family.",
    followUp: "What feels most pressing to you right now?"
  },
  // Emotional Support
  "I feel overwhelmed. What should I do first?": {
    topic: "grief_coping",
    answer: "That makes sense. Grief is overwhelming. Right now, just focus on breathing. You don't have to figure everything out today. If there are practical things that need attention, ask someone to help. It's okay to take things one hour at a time.",
    followUp: "Is there someone who can help you with the immediate tasks?"
  },
  "How do I handle family conflict right now during grief?": {
    topic: "family_communication",
    answer: "Grief can bring out strong emotions. Try to pause before reacting. Focus on what the person who passed would have wanted. It's okay to step away from a conversation. Some conflicts can wait—not everything needs to be resolved right now.",
    followUp: "Is there a specific disagreement you're dealing with?"
  },
  "How do I talk to kids about loss?": {
    topic: "family_communication",
    answer: "Use simple, honest language: 'Grandma died. Her body stopped working.' Avoid euphemisms like 'passed away' or 'went to sleep.' Answer their questions honestly. Let them express feelings. It's okay to say 'I'm sad too.'",
    followUp: "How old are the children you're talking to?"
  },
  "What can I do when I cannot sleep because of grief?": {
    topic: "grief_coping",
    answer: "Grief disrupts sleep. Try a consistent bedtime routine. Limit screens before bed. Write down worries before sleeping. Gentle movement during the day can help. If it continues, talk to a doctor—it's a common part of grief.",
    followUp: "How long has sleep been difficult?"
  },
  "Is what I am feeling normal after a loss?": {
    topic: "grief_coping",
    answer: "Yes. There is no 'normal' in grief. Sadness, anger, relief, numbness, guilt—all are common. Grief comes in waves. Some days will be harder than others. You're not doing this wrong.",
    followUp: "What are you feeling most right now?"
  },
  "How do I get through the next 24 hours?": {
    topic: "grief_coping",
    answer: "Just focus on the next few hours. Eat something small, even if you're not hungry. Drink water. Rest when you can. Let someone help you. It's okay to cancel plans. You're allowed to just survive right now.",
    followUp: "Is there one thing I can help you think through?"
  },
};

// ============== POPULAR QUESTIONS - Mode-aware with topics ==============
type PopularQuestion = { label: string; prompt: string; topic: TopicCategory };

const POPULAR_QUESTIONS_PLANNING: { primary: PopularQuestion[]; more: PopularQuestion[] } = {
  primary: [
    { label: "What should I decide first?", prompt: "What should I decide first when planning ahead?", topic: "first_steps" },
    { label: "How do I choose a person in charge?", prompt: "How do I choose a person to be in charge after I'm gone?", topic: "documents" },
    { label: "What documents should I gather?", prompt: "What documents should I gather for end-of-life planning?", topic: "documents" },
    { label: "How do I share my wishes with family?", prompt: "How do I share my wishes with my family?", topic: "family_communication" },
    { label: "How do I plan costs without overpaying?", prompt: "How do I plan for funeral costs without overpaying?", topic: "financial" },
    { label: "What if I want something simple?", prompt: "What if I want a simple funeral or cremation?", topic: "funeral_decisions" },
  ],
  more: [
    { label: "What are my funeral options?", prompt: "What are my options for funeral or cremation?", topic: "funeral_decisions" },
    { label: "How do I write a legacy letter?", prompt: "How do I write a legacy letter to my family?", topic: "family_communication" },
    { label: "What about my digital accounts?", prompt: "What should I do about my digital accounts and passwords?", topic: "documents" },
    { label: "Do I need a will?", prompt: "Do I need a will, and how do I get started?", topic: "documents" },
    { label: "How do I prepay for a funeral?", prompt: "How do I prepay for a funeral, and is it a good idea?", topic: "financial" },
    { label: "What if my family disagrees?", prompt: "What if my family disagrees with my wishes?", topic: "family_communication" },
  ]
};

const POPULAR_QUESTIONS_AFTERDEATH: { primary: PopularQuestion[]; more: PopularQuestion[] } = {
  primary: [
    { label: "What needs to be done first?", prompt: "Someone has passed away. What needs to be done first?", topic: "first_steps" },
    { label: "Who needs to be notified?", prompt: "Who needs to be notified first after someone passes away?", topic: "notifications" },
    { label: "What documents do I need?", prompt: "What documents will I need to gather after a death?", topic: "documents" },
    { label: "Funeral and service decisions", prompt: "What decisions need to be made about the funeral or memorial service?", topic: "funeral_decisions" },
    { label: "What can wait until later?", prompt: "What tasks can wait until later? I don't want to miss anything urgent.", topic: "timeline" },
    { label: "How do I get death certificates?", prompt: "How do I get death certificates?", topic: "documents" },
  ],
  more: [
    { label: "What about Social Security?", prompt: "What happens to Social Security benefits after someone dies?", topic: "notifications" },
    { label: "What about bills and accounts?", prompt: "What do I do with bills and accounts after someone passes away?", topic: "financial" },
    { label: "What if there is no will?", prompt: "What happens if there is no will?", topic: "documents" },
    { label: "Do I need a lawyer?", prompt: "Do I need a lawyer to settle an estate?", topic: "documents" },
    { label: "How do I notify employers?", prompt: "How do I notify the person's employer or former employer?", topic: "notifications" },
    { label: "What about their car and property?", prompt: "What do I do with their car and personal property?", topic: "financial" },
  ]
};

const POPULAR_QUESTIONS_EMOTIONAL: { primary: PopularQuestion[]; more: PopularQuestion[] } = {
  primary: [
    { label: "I feel overwhelmed", prompt: "I feel overwhelmed. What should I do first?", topic: "grief_coping" },
    { label: "Family conflict right now", prompt: "How do I handle family conflict right now during grief?", topic: "family_communication" },
    { label: "Talking to kids about loss", prompt: "How do I talk to kids about loss?", topic: "family_communication" },
    { label: "I cannot sleep", prompt: "What can I do when I cannot sleep because of grief?", topic: "grief_coping" },
    { label: "Is what I'm feeling normal?", prompt: "Is what I am feeling normal after a loss?", topic: "grief_coping" },
    { label: "Get through the next 24 hours", prompt: "How do I get through the next 24 hours?", topic: "grief_coping" },
  ],
  more: [
    { label: "How long does grief last?", prompt: "How long does grief last?", topic: "grief_coping" },
    { label: "Is it okay to feel angry?", prompt: "Is it okay to feel angry after a loss?", topic: "grief_coping" },
    { label: "How do I cope day to day?", prompt: "How do I cope with grief day to day?", topic: "grief_coping" },
    { label: "What if I can't stop crying?", prompt: "What if I can't stop crying?", topic: "grief_coping" },
    { label: "Going back to work", prompt: "How do I go back to work after a loss?", topic: "timeline" },
    { label: "When to seek professional help?", prompt: "When should I seek professional help for grief?", topic: "grief_coping" },
  ]
};

// FAQ deep-links by mode
const FAQ_LINKS_BY_MODE: Record<Exclude<Mode, null>, string> = {
  planning: "/faq#planning",
  afterdeath: "/faq#after-death", 
  emotional: "/faq#grief"
};
export default function CareSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // GUARDRAIL: Mode starts as null - no topic buttons shown until user explicitly selects a mode
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem("claire_mode");
    return (savedMode === "planning" || savedMode === "afterdeath" || savedMode === "emotional") 
      ? savedMode 
      : null; // No default mode - forces explicit selection
  });

  // Track which modes user has seen before (for first-message logic)
  const [seenModes, setSeenModes] = useState<Set<Mode>>(() => {
    const saved = localStorage.getItem("claire_seen_modes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Set(parsed as Mode[]);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Welcome messages - first time for each mode (short, first-person, ends with clear next step)
  const MODE_FIRST_MESSAGES: Record<Exclude<Mode, null>, string> = {
    planning: `Hi, I'm Claire. I can help you think through your wishes and get organized, one small step at a time. If you want, we can start with the basics and build from there. Pick a question below, or type your own.`,
    afterdeath: `Hi, I'm Claire. If a death just happened, we can slow this down and focus on what matters first. Tell me what happened and what you need help with right now, or tap a question below.`,
    emotional: `Hi, I'm Claire. I'm here with you. You do not have to carry this all at once. If you want, tell me what is feeling hardest right now, or tap a question below.`
  };

  // Shorter returning user messages per mode
  const MODE_RETURNING_MESSAGES: Record<Exclude<Mode, null>, string> = {
    planning: "Welcome back. Tell me what you want to work on today, or tap a question below to pick up where you left off.",
    afterdeath: "Welcome back. We can continue from where you left off, or you can ask something new. Tap a question below, or type what you need.",
    emotional: "Welcome back. I'm here. Tell me what you need in this moment, or tap a question below."
  };

  // Handle mode selection with first-message logic
  const handleModeSelect = (newMode: Exclude<Mode, null>) => {
    if (mode === newMode) return;
    
    const isFirstTime = !seenModes.has(newMode);
    setMode(newMode);
    
    // Clear any error state when switching modes
    setShowErrorOptions(false);
    setPopularQuestionsOpen(false);
    setShowMoreQuestions(false);
    
    // Clear topic lock when switching modes
    setActiveTopic(null);
    setTopicLock(false);
    
    // Add Claire's welcome message - full intro for first time, short for returning
    const welcomeMessage = isFirstTime ? MODE_FIRST_MESSAGES[newMode] : MODE_RETURNING_MESSAGES[newMode];
    setMessages([{ role: "assistant", content: welcomeMessage }]);
    
    // Mark this mode as seen
    if (isFirstTime) {
      const updatedSeen = new Set(seenModes);
      updatedSeen.add(newMode);
      setSeenModes(updatedSeen);
      localStorage.setItem("claire_seen_modes", JSON.stringify([...updatedSeen]));
    }
    
    toast({ title: `Switched to: ${newMode === "planning" ? "Planning Ahead" : newMode === "afterdeath" ? "After a Death" : "Emotional Support"}`, duration: 2000 });
  };

  // Persist mode to localStorage when it changes (only when not null)
  // Also reset wrap-up state when switching modes
  useEffect(() => {
    if (mode) {
      localStorage.setItem("claire_mode", mode);
      // Reset wrap-up state when switching away from planning mode
      if (mode !== "planning") {
        setPlanningMessageCount(0);
        setShowWrapUpPrompt(false);
        setShowWrapUpConfirmation(false);
        setWrapUpDismissed(false);
      }
    }
  }, [mode]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showIAPModal, setShowIAPModal] = useState(false);
  const [showAfterDeathResources, setShowAfterDeathResources] = useState(false);
  // Guest mode allows users to access Claire without subscription - paywall shows when saving
  const [guestMode, setGuestMode] = useState(false);
  // Login required modal for save-related actions
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  // User ID for session tracking
  const [userId, setUserId] = useState<string | null>(null);
  // Emotional support session modals
  const [showSessionDisclosure, setShowSessionDisclosure] = useState(false);
  const [showSessionsExhausted, setShowSessionsExhausted] = useState(false);
  // Personal Support paywall modal
  const [showPersonalSupportModal, setShowPersonalSupportModal] = useState(false);
  const [pendingPaidAction, setPendingPaidAction] = useState<string | null>(null);
  // Pending emotional action after disclosure
  const [pendingEmotionalPrompt, setPendingEmotionalPrompt] = useState<string | null>(null);
  // Track if the last message was an error (to show quick options)
  const [showErrorOptions, setShowErrorOptions] = useState(false);
  // Store the last user message for retry functionality
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  // Track if popular questions collapsible is open
  const [popularQuestionsOpen, setPopularQuestionsOpen] = useState(false);
  // Track if "More questions" is expanded
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  // Planning Ahead wrap-up flow
  const [planningMessageCount, setPlanningMessageCount] = useState(0);
  const [showWrapUpPrompt, setShowWrapUpPrompt] = useState(false);
  const [showWrapUpConfirmation, setShowWrapUpConfirmation] = useState(false);
  const [wrapUpDismissed, setWrapUpDismissed] = useState(false);
  
  // Topic locking - when user selects a predefined question, lock to that topic
  const [activeTopic, setActiveTopic] = useState<TopicCategory | null>(null);
  const [topicLock, setTopicLock] = useState(false);
  
  // Emotional support session tracking
  const emotionalSessions = useEmotionalSupportSessions(userId);
  
  // Check if user has paid access (Personal Support)
  const hasPersonalSupport = hasAccess;

  useEffect(() => {
    checkCAREAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      const hasSeenWelcome = localStorage.getItem("claire_welcome_seen");
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [hasAccess]);

  const handleWelcomeClose = () => {
    localStorage.setItem("claire_welcome_seen", "true");
    setShowWelcome(false);
  };

  const checkCAREAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        setUserId(null);
        setCheckingAccess(false);
        return;
      }
      setIsLoggedIn(true);
      setUserId(user.id);

      const { data: hasVIPAccess } = await supabase
        .rpc('has_vip_access', { _user_id: user.id });
      
      if (hasVIPAccess) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_type")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription?.plan_type === "vip_annual" || subscription?.plan_type === "vip_monthly") {
        setHasAccess(true);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  // Helper to check if user is logged in and show modal if not
  const requireLoginForSave = (): boolean => {
    if (!isLoggedIn) {
      setShowLoginRequiredModal(true);
      return false;
    }
    return true;
  };

  // Helper to check if user has Personal Support (paid access) for paid features
  // Features that require paid: save progress, step-by-step planner, generate personalized summaries
  const requirePersonalSupport = (featureName: string): boolean => {
    if (!hasPersonalSupport) {
      setPendingPaidAction(featureName);
      setShowPersonalSupportModal(true);
      return false;
    }
    return true;
  };

  // Handle continuing free after paywall modal
  const handleContinueFree = () => {
    setPendingPaidAction(null);
    // User can continue browsing FAQs and guides
  };

  // Handle emotional support session logic
  const handleEmotionalModeSelect = () => {
    if (mode === "emotional") return; // Already in mode
    
    // If user has access and has messages remaining, check for first-use disclosure
    if (emotionalSessions.hasAccess && emotionalSessions.messagesRemaining > 0) {
      if (!emotionalSessions.firstSessionShown) {
        setShowSessionDisclosure(true);
      }
      // Use handleModeSelect for consistent first-message behavior
      handleModeSelect("emotional");
    } else if (emotionalSessions.hasAccess && emotionalSessions.messagesRemaining <= 0) {
      // Show exhausted modal
      setShowSessionsExhausted(true);
    } else {
      // No access - use handleModeSelect (guest experience with first-message)
      handleModeSelect("emotional");
    }
  };

  // Handle starting an emotional support session (consumes a message)
  const startEmotionalSession = async (prompt: string) => {
    // Check if user has access and messages
    if (!emotionalSessions.hasAccess || !isLoggedIn) {
      // Guest or no access - just proceed without tracking
      streamChat(prompt);
      return;
    }

    // Check for first-use disclosure
    if (!emotionalSessions.firstSessionShown) {
      setPendingEmotionalPrompt(prompt);
      setShowSessionDisclosure(true);
      return;
    }

    // Check remaining messages
    if (emotionalSessions.messagesRemaining <= 0) {
      setShowSessionsExhausted(true);
      return;
    }

    // Consume a message and proceed
    const consumed = await emotionalSessions.consumeMessage();
    if (consumed) {
      streamChat(prompt);
    } else {
      toast({ title: "Unable to start session", description: "Please try again.", variant: "destructive" });
    }
  };

  // Handle disclosure continue
  const handleDisclosureContinue = async () => {
    await emotionalSessions.markFirstSessionShown();
    setShowSessionDisclosure(false);
    
    if (pendingEmotionalPrompt) {
      // Consume message and start chat
      const consumed = await emotionalSessions.consumeMessage();
      if (consumed) {
        streamChat(pendingEmotionalPrompt);
      }
      setPendingEmotionalPrompt(null);
    }
  };

  const streamChat = async (userMessage: string, isRetry: boolean = false) => {
    // Store last message for retry functionality
    setLastUserMessage(userMessage);
    setShowErrorOptions(false);
    
    const newMessages: Message[] = [...messages.filter(m => !m.isError), { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Helper to add error message to chat inline
    const addErrorMessage = (errorMsg: string) => {
      const fallbackMessage = mode ? ERROR_FALLBACK_MESSAGES[mode] : GENERIC_ERROR_FALLBACK;
      setMessages(prev => [
        ...prev.filter(m => !m.isError),
        { role: "assistant", content: fallbackMessage, isError: true }
      ]);
      setShowErrorOptions(true);
    };

    // Helper to attempt the API call with timeout
    const attemptFetch = async (): Promise<Response> => {
      // For guest mode, use anon key; for logged-in users, use session token
      let authHeader: string;
      
      if (isLoggedIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Session expired");
        }
        authHeader = `Bearer ${session.access_token}`;
      } else {
        // Guest mode - use anon key for basic chat (no save functionality)
        authHeader = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ messages: newMessages, mode, activeTopic }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    try {
      let response: Response;
      
      try {
        response = await attemptFetch();
      } catch (firstError) {
        // First attempt failed - log and retry after 1 second
        const errorMessage = firstError instanceof Error ? firstError.message : "Unknown error";
        logClaireError(mode, "FIRST_ATTEMPT", errorMessage, false);
        
        if (!isRetry) {
          // Wait 1 second and retry once
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            response = await attemptFetch();
          } catch (retryError) {
            const retryErrorMessage = retryError instanceof Error ? retryError.message : "Unknown error";
            logClaireError(mode, "RETRY_FAILED", retryErrorMessage, true);
            addErrorMessage(retryErrorMessage);
            setIsLoading(false);
            return;
          }
        } else {
          addErrorMessage(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      // Check for HTTP errors
      if (!response.ok) {
        const errorCode = response.status;
        let errorMessage = "Request failed";
        
        if (errorCode === 429) {
          errorMessage = "Too many requests. Please wait a moment.";
        } else if (errorCode === 402) {
          errorMessage = "Service temporarily unavailable.";
        } else if (errorCode === 500 || errorCode === 502 || errorCode === 503) {
          errorMessage = "Service is temporarily busy.";
        }
        
        logClaireError(mode, errorCode, errorMessage, isRetry);
        
        // Retry once for server errors if this wasn't already a retry
        if (!isRetry && (errorCode >= 500 || errorCode === 429)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return streamChat(userMessage, true);
        }
        
        addErrorMessage(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        logClaireError(mode, "NO_BODY", "No response body", isRetry);
        addErrorMessage("No response received");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const filtered = prev.filter(m => !m.isError);
                const last = filtered[filtered.length - 1];
                if (last?.role === "assistant" && !last.isError) {
                  return filtered.map((m, i) => (i === filtered.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...filtered, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      // Successful response - clear error state
      setShowErrorOptions(false);
      
      // Track message count for Planning Ahead wrap-up flow
      if (mode === "planning" && !wrapUpDismissed && !showWrapUpPrompt && !showWrapUpConfirmation) {
        setPlanningMessageCount(prev => {
          const newCount = prev + 1;
          // Show wrap-up prompt after 10+ messages
          if (newCount >= 10) {
            setShowWrapUpPrompt(true);
          }
          return newCount;
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logClaireError(mode, "CATCH_ALL", errorMessage, isRetry);
      
      // Retry once if this wasn't already a retry
      if (!isRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return streamChat(userMessage, true);
      }
      
      addErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry from error options
  const handleRetry = () => {
    if (lastUserMessage) {
      setShowErrorOptions(false);
      // Remove the error message before retrying
      setMessages(prev => prev.filter(m => !m.isError));
      streamChat(lastUserMessage);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Check if user is explicitly changing topic (simple heuristics)
    const topicChangeKeywords = [
      "different question", "something else", "another topic", 
      "change topic", "new question", "let's talk about", "switch to"
    ];
    const inputLower = input.toLowerCase();
    const isTopicChange = topicChangeKeywords.some(kw => inputLower.includes(kw));
    
    if (isTopicChange) {
      // Clear topic lock when user explicitly changes topic
      setActiveTopic(null);
      setTopicLock(false);
    }
    
    streamChat(input);
    setInput("");
  };

  // Handle predefined question click - display instant answer and lock to topic
  const handleTopicClick = (prompt: string, topic?: TopicCategory) => {
    const instantAnswer = INSTANT_ANSWERS[prompt];
    
    if (instantAnswer) {
      // Display the mapped instant answer immediately (no AI call)
      const fullAnswer = `${instantAnswer.answer}\n\n${instantAnswer.followUp}`;
      setMessages(prev => [
        ...prev.filter(m => !m.isError),
        { role: "user", content: prompt },
        { role: "assistant", content: fullAnswer }
      ]);
      
      // Set topic lock
      setActiveTopic(instantAnswer.topic);
      setTopicLock(true);
    } else {
      // No instant answer - call AI but still set topic if provided
      if (topic) {
        setActiveTopic(topic);
        setTopicLock(true);
      }
      streamChat(prompt);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleGetCARESupport = async (lookupKey: string = "EFAVIPMONTHLY") => {
    if (isStoreIAP) {
      setShowIAPModal(true);
      return;
    }
    const successUrl = `${window.location.origin}/purchase-success?type=vip`;
    const cancelUrl = window.location.href;

    if (!isLoggedIn) {
      setPendingCheckout({
        lookupKey,
        successUrl,
        cancelUrl,
        postSuccessRedirect: "/care-support",
      });
      localStorage.setItem("efa_last_visited_route", location.pathname);
      navigate("/login");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { lookupKey, successUrl, cancelUrl }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Landing page removed - users go directly to Claire assistant
  // The guestMode state is no longer needed as entry gate, but kept for compatibility
  // Login is only required for save-related actions (handled by requireLoginForSave)
  
  // Show main assistant interface directly
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      
      <div className="flex-1 bg-gradient-to-b from-background to-muted/30 px-4 py-2 md:py-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Compact header for mobile */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-1 text-xs px-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Planning Menu</span>
            </Button>
            <div className="flex items-center gap-1">
              <Heart className="h-5 w-5" style={{ color: 'hsl(175, 35%, 40%)' }} />
              <span className="text-lg font-serif font-semibold" style={{ color: 'hsl(215, 20%, 22%)' }}>Claire</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1 text-xs px-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {/* Claire Mode Selection Card - Soft sage identity */}
          <div 
            className="rounded-xl shadow-md border"
            style={{ 
              backgroundColor: 'hsl(140, 20%, 95%)',
              borderColor: 'hsl(140, 18%, 88%)'
            }}
          >
            <div className="p-4 md:p-5 space-y-3">
              {/* Compact Claire Header - Mobile First */}
              <div className="flex items-center gap-3">
                <img 
                  src={claireAvatar} 
                  alt="Claire" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm border-2 flex-shrink-0"
                  style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                />
                <div>
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: 'hsl(215, 20%, 22%)' }}
                  >
                    Claire
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(215, 15%, 45%)' }}
                  >
                    Pick a mode, then ask a question.
                  </p>
                </div>
              </div>
              
              {/* Mode Selection Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Planning Ahead Button */}
                <button
                  onClick={() => handleModeSelect("planning")}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[48px] ${
                    mode === "planning"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "planning" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "planning" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "planning" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: mode === "planning" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">Planning Ahead</span>
                  </div>
                </button>

                {/* After a Death Button */}
                <button
                  onClick={() => handleModeSelect("afterdeath")}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[48px] ${
                    mode === "afterdeath"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "afterdeath" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "afterdeath" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "afterdeath" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 flex-shrink-0" style={{ color: mode === "afterdeath" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">After a Death</span>
                  </div>
                </button>

                {/* Emotional Support Button */}
                <button
                  onClick={handleEmotionalModeSelect}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[48px] ${
                    mode === "emotional"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "emotional" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "emotional" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 flex-shrink-0" style={{ color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">Emotional Support</span>
                    {emotionalSessions.hasAccess && emotionalSessions.messagesRemaining > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs ml-auto"
                        style={{ 
                          backgroundColor: mode === "emotional" ? 'hsl(175, 35%, 50%)' : 'hsl(30, 8%, 85%)',
                          color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 25%)'
                        }}
                      >
                        {emotionalSessions.messagesRemaining} left
                      </Badge>
                    )}
                  </div>
                </button>
              </div>

              {/* Helper text under mode buttons */}
              <p 
                className="text-xs text-center"
                style={{ color: 'hsl(215, 15%, 50%)' }}
              >
                Tap a mode, then type your question below.
              </p>

              {/* Free to explore section */}
              <div 
                className="pt-3 border-t space-y-1"
                style={{ borderColor: 'hsl(140, 15%, 85%)' }}
              >
                <p 
                  className="text-sm font-medium text-center"
                  style={{ color: 'hsl(215, 20%, 30%)' }}
                >
                  {hasPersonalSupport ? "Personal Support" : "Free to explore"}
                </p>
                <p 
                  className="text-xs text-center leading-relaxed"
                  style={{ color: 'hsl(215, 15%, 45%)' }}
                >
                  {hasPersonalSupport ? (
                    <>
                      Includes step-by-step guidance and progress saving.<br />
                      Emotional Support includes up to 200 messages/month.
                    </>
                  ) : (
                    <>
                      Explore FAQs, guides, and checklists for free.<br />
                      If you want step-by-step help, saving your progress, or help filling things out, Personal Support is available.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Note: Mode-specific quick action buttons moved to suggestion chips after Claire's first message */}
          
          {/* After-Death Resources Response */}
          {showAfterDeathResources && messages.length === 0 && (
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <AfterDeathResourcesResponse />
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              {/* Only show chat area when there are messages or loading */}
              {(messages.length > 0 || isLoading) && (
                <div 
                  className="space-y-3 pr-2"
                  style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                    {messages.map((msg, i) => {
                      const isAssistant = msg.role === "assistant";
                      const prevMsg = messages[i - 1];
                      const showAvatar = isAssistant && (!prevMsg || prevMsg.role !== "assistant");
                      
                      // Show popular questions collapsible after Claire's first welcome message
                      const isFirstWelcomeMessage = i === 0 && isAssistant && messages.length === 1;
                      
                      return (
                        <div key={i}>
                          <div
                            className={`flex items-start gap-3 ${
                              isAssistant ? "mr-4" : "ml-8 justify-end"
                            }`}
                          >
                            {/* Claire avatar - only on first message in sequence */}
                            {isAssistant && (
                              <div className="flex-shrink-0 w-8">
                                {showAvatar && (
                                  <img 
                                    src={claireAvatar} 
                                    alt="Claire" 
                                    className="w-8 h-8 rounded-full object-cover shadow-sm border"
                                    style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                                  />
                                )}
                              </div>
                            )}
                            
                            {/* Message bubble */}
                            <div
                              className={`p-4 rounded-xl max-w-[85%] ${
                                isAssistant 
                                  ? msg.isError ? "" : "shadow-sm"
                                  : "bg-primary/10"
                              }`}
                              style={isAssistant ? { 
                                backgroundColor: msg.isError ? 'hsl(45, 80%, 96%)' : '#EEF4F1',
                                boxShadow: msg.isError ? '0 1px 3px rgba(180, 140, 50, 0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                                borderLeft: msg.isError ? '3px solid hsl(45, 70%, 55%)' : undefined
                              } : undefined}
                            >
                              <p 
                                className="text-base leading-relaxed whitespace-pre-wrap"
                                style={{ color: msg.isError ? 'hsl(30, 30%, 30%)' : 'hsl(215, 20%, 22%)' }}
                              >
                                {msg.content}
                              </p>
                            </div>
                          </div>
                          
                          {/* Collapsible Popular Questions - shown after first welcome message */}
                          {isFirstWelcomeMessage && mode && (
                            <div className="mt-4 ml-11">
                              <Collapsible open={popularQuestionsOpen} onOpenChange={setPopularQuestionsOpen}>
                                <CollapsibleTrigger asChild>
                                  <button 
                                    className="flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/30"
                                    style={{ 
                                      backgroundColor: popularQuestionsOpen ? 'hsl(175, 30%, 97%)' : 'transparent',
                                      border: '1px solid hsl(175, 25%, 85%)'
                                    }}
                                  >
                                    <div className="flex-1">
                                      <p 
                                        className="text-sm font-medium"
                                        style={{ color: 'hsl(215, 20%, 30%)' }}
                                      >
                                        Popular questions
                                      </p>
                                      <p 
                                        className="text-xs"
                                        style={{ color: 'hsl(215, 15%, 50%)' }}
                                      >
                                        Tap one, or type your own.
                                      </p>
                                    </div>
                                    {popularQuestionsOpen ? (
                                      <ChevronUp className="h-4 w-4" style={{ color: 'hsl(175, 35%, 40%)' }} />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" style={{ color: 'hsl(175, 35%, 40%)' }} />
                                    )}
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div 
                                    className="mt-2 p-4 rounded-lg space-y-3"
                                    style={{
                                      backgroundColor: 'hsl(175, 30%, 97%)',
                                      border: '1px solid hsl(175, 25%, 85%)',
                                    }}
                                  >
                                    {/* Primary 6 questions - filtered by topic when locked */}
                                    <div className="flex flex-wrap gap-2">
                                      {(mode === "afterdeath" ? POPULAR_QUESTIONS_AFTERDEATH.primary 
                                        : mode === "planning" ? POPULAR_QUESTIONS_PLANNING.primary 
                                        : POPULAR_QUESTIONS_EMOTIONAL.primary
                                      )
                                        .filter(q => !topicLock || q.topic === activeTopic)
                                        .map((q, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => {
                                            if (mode === "emotional") {
                                              startEmotionalSession(q.prompt);
                                            } else {
                                              handleTopicClick(q.prompt, q.topic);
                                            }
                                          }}
                                          disabled={isLoading}
                                          className="px-3 py-2 text-sm rounded-full border transition-colors hover:bg-white disabled:opacity-50 text-left"
                                          style={{
                                            borderColor: 'hsl(175, 25%, 75%)',
                                            color: 'hsl(175, 35%, 30%)',
                                            backgroundColor: 'hsl(0, 0%, 100%)'
                                          }}
                                        >
                                          {q.label}
                                        </button>
                                      ))}
                                    </div>

                                    {/* More questions toggle */}
                                    {!showMoreQuestions && (
                                      <button
                                        onClick={() => setShowMoreQuestions(true)}
                                        className="text-sm font-medium underline-offset-2 hover:underline"
                                        style={{ color: 'hsl(175, 35%, 35%)' }}
                                      >
                                        More questions
                                      </button>
                                    )}

                                    {/* Additional 6 questions (shown when expanded) - filtered by topic when locked */}
                                    {showMoreQuestions && (
                                      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'hsl(175, 25%, 85%)' }}>
                                        {(mode === "afterdeath" ? POPULAR_QUESTIONS_AFTERDEATH.more 
                                          : mode === "planning" ? POPULAR_QUESTIONS_PLANNING.more 
                                          : POPULAR_QUESTIONS_EMOTIONAL.more
                                        )
                                          .filter(q => !topicLock || q.topic === activeTopic)
                                          .map((q, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              if (mode === "emotional") {
                                                startEmotionalSession(q.prompt);
                                              } else {
                                                handleTopicClick(q.prompt, q.topic);
                                              }
                                            }}
                                            disabled={isLoading}
                                            className="px-3 py-2 text-sm rounded-full border transition-colors hover:bg-white disabled:opacity-50 text-left"
                                            style={{
                                              borderColor: 'hsl(175, 25%, 75%)',
                                              color: 'hsl(175, 35%, 30%)',
                                              backgroundColor: 'hsl(0, 0%, 100%)'
                                            }}
                                          >
                                            {q.label}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {/* Topic lock indicator with option to explore other topics */}
                                    {topicLock && activeTopic && (
                                      <div className="flex items-center gap-2 pt-2">
                                        <p 
                                          className="text-xs"
                                          style={{ color: 'hsl(215, 15%, 50%)' }}
                                        >
                                          Showing related questions.
                                        </p>
                                        <button
                                          onClick={() => {
                                            setActiveTopic(null);
                                            setTopicLock(false);
                                          }}
                                          className="text-xs underline"
                                          style={{ color: 'hsl(175, 35%, 35%)' }}
                                        >
                                          Show all questions
                                        </button>
                                      </div>
                                    )}

                                    {!topicLock && (
                                      <p 
                                        className="text-xs pt-2"
                                        style={{ color: 'hsl(215, 15%, 50%)' }}
                                      >
                                        Or type anything you'd like to ask.
                                      </p>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isLoading && (
                      <div className="flex items-center gap-3 mr-4">
                        <div className="w-8 flex-shrink-0">
                          <img 
                            src={claireAvatar} 
                            alt="Claire" 
                            className="w-8 h-8 rounded-full object-cover shadow-sm border"
                            style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                          />
                        </div>
                        <div 
                          className="p-4 rounded-xl shadow-sm"
                          style={{ backgroundColor: '#EEF4F1' }}
                        >
                          <div className="flex items-center gap-2" style={{ color: 'hsl(215, 15%, 45%)' }}>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Claire is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Options - shown when there's an error */}
                    {showErrorOptions && !isLoading && (
                      <div 
                        className="mt-4 ml-11 space-y-3"
                        style={{
                          height: 'auto',
                          overflow: 'visible',
                        }}
                      >
                        {/* Error action buttons */}
                        <div className="flex flex-wrap gap-2" style={{ overflow: 'visible' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            Try again
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => mode && navigate(FAQ_LINKS_BY_MODE[mode])}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open FAQs for this topic
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/contact")}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Talk to a real person
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Planning Ahead Wrap-up Prompt */}
              {mode === "planning" && showWrapUpPrompt && !showWrapUpConfirmation && (
                <div 
                  className="rounded-xl p-4 space-y-3"
                  style={{ backgroundColor: 'hsl(140, 30%, 96%)', border: '1px solid hsl(140, 20%, 85%)' }}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={claireAvatar} 
                      alt="Claire" 
                      className="h-8 w-8 rounded-full flex-shrink-0"
                    />
                    <p className="text-sm" style={{ color: 'hsl(215, 20%, 30%)' }}>
                      Do you want to stop here for now, or keep going?
                    </p>
                  </div>
                  <div className="flex gap-2 pl-11">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowWrapUpPrompt(false);
                        setShowWrapUpConfirmation(true);
                      }}
                      className="rounded-full"
                      style={{ backgroundColor: 'hsl(175, 35%, 45%)' }}
                    >
                      I'm done for now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowWrapUpPrompt(false);
                        setWrapUpDismissed(true);
                        setPlanningMessageCount(0); // Reset so it doesn't immediately show again
                      }}
                      className="rounded-full"
                      style={{ borderColor: 'hsl(175, 25%, 65%)', color: 'hsl(175, 35%, 30%)' }}
                    >
                      Keep going
                    </Button>
                  </div>
                </div>
              )}

              {/* Planning Ahead Wrap-up Confirmation */}
              {mode === "planning" && showWrapUpConfirmation && (
                <div 
                  className="rounded-xl p-4 space-y-3"
                  style={{ backgroundColor: 'hsl(140, 30%, 96%)', border: '1px solid hsl(140, 20%, 85%)' }}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={claireAvatar} 
                      alt="Claire" 
                      className="h-8 w-8 rounded-full flex-shrink-0"
                    />
                    <p className="text-sm" style={{ color: 'hsl(215, 20%, 30%)' }}>
                      Okay. I can take you to your Planning Review so you can print, download, or edit.
                    </p>
                  </div>
                  <div className="flex gap-2 pl-11">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Check if user has Personal Support for Planning Review
                        if (!hasPersonalSupport) {
                          setPendingPaidAction("Planning Review");
                          setShowPersonalSupportModal(true);
                          return;
                        }
                        navigate("/preplan-summary");
                      }}
                      className="rounded-full"
                      style={{ backgroundColor: 'hsl(175, 35%, 45%)' }}
                    >
                      Go to Planning Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowWrapUpConfirmation(false);
                        setWrapUpDismissed(true);
                      }}
                      className="rounded-full"
                      style={{ borderColor: 'hsl(175, 25%, 65%)', color: 'hsl(175, 35%, 30%)' }}
                    >
                      Stay here
                    </Button>
                  </div>
                </div>
              )}



              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={() => {
                      setIsRecording(!isRecording);
                      toast({
                        title: isRecording ? "Recording stopped" : "Recording started",
                        description: isRecording ? "Processing your voice..." : "Speak now",
                      });
                    }}
                    disabled={isLoading}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                  >
                    {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Claire a question..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="resize-none h-10 py-2"
                    rows={1}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  You can close this anytime.
                </p>
                <button 
                  onClick={() => {
                    if (requireLoginForSave()) {
                      navigate("/saved-summaries");
                    }
                  }}
                  className="text-xs text-primary hover:underline block mx-auto"
                >
                  View your saved summaries
                </button>
                <p className="text-xs text-muted-foreground/70">
                  Claire provides planning guidance and educational support. She does not provide legal, medical, or financial advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AppFooter />
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      <StoreIAPModal open={showIAPModal} onOpenChange={setShowIAPModal} />
      
      {/* Login Required Modal for save-related actions */}
      <Dialog open={showLoginRequiredModal} onOpenChange={setShowLoginRequiredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sign in to save</DialogTitle>
            <DialogDescription className="text-center pt-2">
              To save or edit your plan later, please sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                setShowLoginRequiredModal(false);
                navigate("/login");
              }}
              className="min-h-[48px]"
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowLoginRequiredModal(false)}
              className="min-h-[48px]"
            >
              Continue without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emotional Support Session Disclosure Modal (first use) */}
      <Dialog open={showSessionDisclosure} onOpenChange={setShowSessionDisclosure}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Guided Emotional Support
            </DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-3">
              <p>
                Personal Support includes up to 200 messages/month in Emotional Support mode.
              </p>
              <p className="font-medium text-foreground">
                You have {emotionalSessions.messagesRemaining} messages remaining this month.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleDisclosureContinue}
              className="min-h-[48px]"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personal Support Paywall Modal */}
      <PersonalSupportModal
        open={showPersonalSupportModal}
        onOpenChange={setShowPersonalSupportModal}
        onContinueFree={handleContinueFree}
        featureAttempted={pendingPaidAction || undefined}
      />

      {/* Emotional Support Limit Modal */}
      <EmotionalSupportLimitModal
        open={showSessionsExhausted}
        onOpenChange={setShowSessionsExhausted}
        messagesUsed={emotionalSessions.messagesUsed}
        messagesLimit={emotionalSessions.messagesLimit}
      />
    </div>
  );
}
