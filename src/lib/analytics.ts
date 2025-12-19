import { supabase } from "@/integrations/supabase/client";

// User role types
type UserRole = 'account_holder' | 'trusted_contact' | 'admin';

// Source screen types
type SourceScreen = 
  | 'dashboard' 
  | 'card_grid' 
  | 'resources' 
  | 'section_page' 
  | 'trusted_contacts' 
  | 'checkout';

// Shared props for all events
interface SharedProps {
  user_role: UserRole;
  user_id: string;
  plan_id?: string;
  source_screen: SourceScreen;
  timestamp: string;
}

// Event-specific props
interface CardImpressionProps extends Partial<SharedProps> {
  card_id: string;
  card_name: string;
}

interface CardClickProps extends Partial<SharedProps> {
  card_id: string;
  card_name: string;
  cta_label: string;
  destination_type: 'internal' | 'download' | 'checkout';
}

interface DownloadClickProps extends Partial<SharedProps> {
  doc_type: 'reference_guide' | 'pre_planning_checklist' | 'after_death_checklist';
  file_format: 'pdf' | 'docx';
}

interface DownloadSuccessProps extends DownloadClickProps {
  file_size_kb?: number;
}

interface DownloadFailedProps extends Partial<SharedProps> {
  doc_type: 'reference_guide' | 'pre_planning_checklist' | 'after_death_checklist';
  file_format: 'pdf' | 'docx';
  error_code: 'network' | 'not_found' | 'permission' | 'timeout' | 'unknown';
}

interface TrustedContactAddedProps extends Partial<SharedProps> {
  method: 'email' | 'link';
  invited_email_domain?: string;
}

interface TrustedContactInviteSentProps extends Partial<SharedProps> {
  channel: 'email' | 'sms' | 'link';
  invite_type: 'trusted_contact';
}

interface TrustedContactPermissionToggleProps extends Partial<SharedProps> {
  permission_key: 'after_death_planner' | 'after_death_checklist' | 'shared_documents';
  new_value: boolean;
}

interface TrustedContactRequestAccessProps extends Partial<SharedProps> {
  requested_tool: 'after_death_planner' | 'after_death_checklist';
}

interface CheckoutStartProps extends Partial<SharedProps> {
  product: 'vip' | 'do_it_for_you' | 'memorial_song';
  price?: number;
  billing_period: 'one_time' | 'monthly' | 'annual';
}

interface CheckoutSuccessProps extends Partial<SharedProps> {
  product: 'vip' | 'do_it_for_you' | 'memorial_song';
  price?: number;
  billing_period: 'one_time' | 'monthly' | 'annual';
  order_id?: string;
}

interface CheckoutFailedProps extends Partial<SharedProps> {
  product: 'vip' | 'do_it_for_you' | 'memorial_song';
  error_code: 'cancelled' | 'card_declined' | 'processing_error' | 'unknown';
}

interface SectionCompletedProps extends Partial<SharedProps> {
  section_name: string;
  category: 'pre_planning' | 'after_death';
}

interface ChecklistItemCheckedProps extends Partial<SharedProps> {
  checklist: 'pre_planning' | 'after_death';
  item_id: string;
  section_name: string;
}

// Event map for type safety
type EventMap = {
  card_impression: CardImpressionProps;
  card_click: CardClickProps;
  download_click: DownloadClickProps;
  download_success: DownloadSuccessProps;
  download_failed: DownloadFailedProps;
  trusted_contact_added: TrustedContactAddedProps;
  trusted_contact_invite_sent: TrustedContactInviteSentProps;
  trusted_contact_permission_toggle: TrustedContactPermissionToggleProps;
  trusted_contact_request_access: TrustedContactRequestAccessProps;
  checkout_start: CheckoutStartProps;
  checkout_success: CheckoutSuccessProps;
  checkout_failed: CheckoutFailedProps;
  section_completed: SectionCompletedProps;
  checklist_item_checked: ChecklistItemCheckedProps;
};

// Get current user info for shared props
const getSharedProps = async (
  sourceScreen: SourceScreen,
  overrides?: Partial<SharedProps>
): Promise<SharedProps> => {
  let userId = 'anonymous';
  let userRole: UserRole = 'account_holder';
  let planId: string | undefined;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;

      // Get user role from org_members
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role, org_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (orgMember) {
        if (orgMember.role === 'trusted_contact') {
          userRole = 'trusted_contact';
        } else if (orgMember.role === 'admin' || orgMember.role === 'coach') {
          userRole = 'admin';
        }

        // Get plan_id if applicable
        const { data: plan } = await supabase
          .from('plans')
          .select('id')
          .eq('org_id', orgMember.org_id)
          .maybeSingle();

        if (plan) {
          planId = plan.id;
        }
      }
    }
  } catch (error) {
    console.error('[Analytics] Error getting user info:', error);
  }

  return {
    user_role: overrides?.user_role ?? userRole,
    user_id: overrides?.user_id ?? userId,
    plan_id: overrides?.plan_id ?? planId,
    source_screen: overrides?.source_screen ?? sourceScreen,
    timestamp: new Date().toISOString(),
  };
};

// Main track function
export const analytics = {
  track: async <E extends keyof EventMap>(
    eventName: E,
    props: EventMap[E],
    sourceScreen: SourceScreen = 'dashboard'
  ): Promise<void> => {
    try {
      const sharedProps = await getSharedProps(sourceScreen, props as Partial<SharedProps>);
      
      const eventData = {
        event_name: eventName,
        ...sharedProps,
        ...props,
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, eventData);
      }

      // Store in visit_events or a dedicated analytics table
      // For now, we'll log to console and could extend to send to an analytics endpoint
      // You can extend this to send to Mixpanel, Amplitude, or your own analytics endpoint
      
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  },

  // Convenience methods for common events
  trackCardImpression: (cardId: string, cardName: string, sourceScreen: SourceScreen = 'card_grid') => {
    return analytics.track('card_impression', { card_id: cardId, card_name: cardName }, sourceScreen);
  },

  trackCardClick: (
    cardId: string,
    cardName: string,
    ctaLabel: string,
    destinationType: 'internal' | 'download' | 'checkout',
    sourceScreen: SourceScreen = 'card_grid'
  ) => {
    return analytics.track('card_click', {
      card_id: cardId,
      card_name: cardName,
      cta_label: ctaLabel,
      destination_type: destinationType,
    }, sourceScreen);
  },

  trackDownloadClick: (
    docType: DownloadClickProps['doc_type'],
    fileFormat: DownloadClickProps['file_format'] = 'pdf',
    sourceScreen: SourceScreen = 'resources'
  ) => {
    return analytics.track('download_click', { doc_type: docType, file_format: fileFormat }, sourceScreen);
  },

  trackDownloadSuccess: (
    docType: DownloadSuccessProps['doc_type'],
    fileFormat: DownloadSuccessProps['file_format'] = 'pdf',
    fileSizeKb?: number,
    sourceScreen: SourceScreen = 'resources'
  ) => {
    return analytics.track('download_success', {
      doc_type: docType,
      file_format: fileFormat,
      file_size_kb: fileSizeKb,
    }, sourceScreen);
  },

  trackDownloadFailed: (
    docType: DownloadFailedProps['doc_type'],
    fileFormat: DownloadFailedProps['file_format'],
    errorCode: DownloadFailedProps['error_code'],
    sourceScreen: SourceScreen = 'resources'
  ) => {
    return analytics.track('download_failed', {
      doc_type: docType,
      file_format: fileFormat,
      error_code: errorCode,
    }, sourceScreen);
  },

  trackCheckoutStart: (
    product: CheckoutStartProps['product'],
    billingPeriod: CheckoutStartProps['billing_period'],
    price?: number
  ) => {
    return analytics.track('checkout_start', {
      product,
      billing_period: billingPeriod,
      price,
    }, 'checkout');
  },

  trackCheckoutSuccess: (
    product: CheckoutSuccessProps['product'],
    billingPeriod: CheckoutSuccessProps['billing_period'],
    orderId?: string,
    price?: number
  ) => {
    return analytics.track('checkout_success', {
      product,
      billing_period: billingPeriod,
      order_id: orderId,
      price,
    }, 'checkout');
  },

  trackCheckoutFailed: (
    product: CheckoutFailedProps['product'],
    errorCode: CheckoutFailedProps['error_code']
  ) => {
    return analytics.track('checkout_failed', {
      product,
      error_code: errorCode,
    }, 'checkout');
  },

  trackTrustedContactPermissionToggle: (
    permissionKey: TrustedContactPermissionToggleProps['permission_key'],
    newValue: boolean
  ) => {
    return analytics.track('trusted_contact_permission_toggle', {
      permission_key: permissionKey,
      new_value: newValue,
    }, 'trusted_contacts');
  },

  trackSectionCompleted: (sectionName: string, category: 'pre_planning' | 'after_death') => {
    return analytics.track('section_completed', {
      section_name: sectionName,
      category,
    }, 'section_page');
  },
};

export type { 
  UserRole, 
  SourceScreen, 
  EventMap,
  DownloadClickProps,
  CheckoutStartProps,
};
