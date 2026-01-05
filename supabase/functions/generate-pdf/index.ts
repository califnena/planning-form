import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Section to page mapping in the template PDF (0-indexed)
const SECTION_PAGES: Record<string, number[]> = {
  cover: [0],
  toc: [1],
  checklist: [2],
  instructions: [3],
  personal: [4, 5],
  legacy: [6],
  contacts: [7, 8],
  vendors: [9],
  funeral: [10, 11],
  financial: [12],
  insurance: [13],
  property: [14],
  pets: [15],
  digital: [16],
  legal: [17],
  messages: [18, 19, 20, 21],
  revisions: [22, 23],
};

// Map section IDs from user settings to template sections
const SECTION_ID_MAP: Record<string, string> = {
  overview: 'cover',
  instructions: 'instructions',
  personal: 'personal',
  legacy: 'legacy',
  contacts: 'contacts',
  providers: 'vendors',
  funeral: 'funeral',
  financial: 'financial',
  insurance: 'insurance',
  property: 'property',
  pets: 'pets',
  digital: 'digital',
  legal: 'legal',
  messages: 'messages',
};

interface TextPosition {
  x: number;
  y: number;
  maxWidth: number;
  fontSize?: number;
}

// Text coordinates for overlaying data (y is from bottom of page)
const FIELD_POSITIONS: Record<string, Record<string, TextPosition>> = {
  cover: {
    prepared_for: { x: 105, y: 620, maxWidth: 300, fontSize: 14 },
    date: { x: 105, y: 602, maxWidth: 150, fontSize: 12 },
  },
  personal: {
    full_name: { x: 170, y: 665, maxWidth: 350, fontSize: 11 },
    nicknames: { x: 170, y: 644, maxWidth: 350, fontSize: 11 },
    maiden_name: { x: 170, y: 622, maxWidth: 350, fontSize: 11 },
    dob: { x: 170, y: 600, maxWidth: 200, fontSize: 11 },
    birthplace: { x: 170, y: 578, maxWidth: 350, fontSize: 11 },
    ssn: { x: 170, y: 556, maxWidth: 200, fontSize: 11 },
    citizenship: { x: 170, y: 534, maxWidth: 200, fontSize: 11 },
    address: { x: 170, y: 490, maxWidth: 350, fontSize: 11 },
    phone: { x: 170, y: 445, maxWidth: 200, fontSize: 11 },
    email: { x: 170, y: 423, maxWidth: 300, fontSize: 11 },
  },
  personal_family: {
    marital_status: { x: 170, y: 690, maxWidth: 200, fontSize: 11 },
    partner_name: { x: 170, y: 660, maxWidth: 300, fontSize: 11 },
    partner_phone: { x: 170, y: 640, maxWidth: 200, fontSize: 11 },
    partner_email: { x: 170, y: 620, maxWidth: 300, fontSize: 11 },
    ex_spouse_name: { x: 170, y: 598, maxWidth: 300, fontSize: 11 },
    religion: { x: 170, y: 576, maxWidth: 200, fontSize: 11 },
    father_name: { x: 170, y: 530, maxWidth: 300, fontSize: 11 },
    father_phone: { x: 170, y: 510, maxWidth: 200, fontSize: 11 },
    father_email: { x: 170, y: 490, maxWidth: 300, fontSize: 11 },
    mother_name: { x: 170, y: 448, maxWidth: 300, fontSize: 11 },
    mother_phone: { x: 170, y: 428, maxWidth: 200, fontSize: 11 },
    mother_email: { x: 170, y: 408, maxWidth: 300, fontSize: 11 },
    children: { x: 70, y: 360, maxWidth: 450, fontSize: 10 },
  },
  legacy: {
    story: { x: 70, y: 600, maxWidth: 450, fontSize: 10 },
  },
  funeral: {
    preference: { x: 70, y: 640, maxWidth: 450, fontSize: 10 },
    disposition: { x: 70, y: 520, maxWidth: 450, fontSize: 10 },
    cemetery: { x: 70, y: 440, maxWidth: 450, fontSize: 10 },
    disposition_notes: { x: 70, y: 380, maxWidth: 450, fontSize: 10 },
  },
  funeral_cont: {
    flower_preferences: { x: 70, y: 510, maxWidth: 450, fontSize: 10 },
    charity_donations: { x: 70, y: 450, maxWidth: 450, fontSize: 10 },
    location: { x: 70, y: 390, maxWidth: 450, fontSize: 10 },
    music: { x: 70, y: 330, maxWidth: 450, fontSize: 10 },
    readings: { x: 70, y: 270, maxWidth: 450, fontSize: 10 },
    speakers: { x: 70, y: 210, maxWidth: 450, fontSize: 10 },
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planData, selectedSections, piiData, docType = 'full', isDraft = false, outputAllPages = true } = await req.json();
    console.log('Generating PDF for user:', user.id, 'docType:', docType, 'isDraft:', isDraft, 'outputAllPages:', outputAllPages);
    console.log('Selected sections:', selectedSections);
    console.log('Plan data keys:', Object.keys(planData || {}));
    console.log('Contacts count:', planData?.contacts_notify?.length || 0);
    console.log('Insurance count:', planData?.insurance_policies?.length || 0);

    // Fetch the blank PDF template from storage
    const templateUrl = `${supabaseUrl}/storage/v1/object/public/pdf-templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf`;
    
    console.log('Fetching template from:', templateUrl);
    const templateResponse = await fetch(templateUrl);
    
    if (!templateResponse.ok) {
      console.log('Template not found in storage (status:', templateResponse.status, '), generating full 23-page fallback PDF');
      // Generate comprehensive 23-page PDF matching blank form structure
      return await generateSimplePdf(planData, selectedSections, piiData, user.id, supabase, corsHeaders, isDraft);
    }

    const templateBytes = await templateResponse.arrayBuffer();
    console.log('Template loaded, size:', templateBytes.byteLength);
    
    const templatePdf = await PDFDocument.load(templateBytes);
    const helvetica = await templatePdf.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await templatePdf.embedFont(StandardFonts.HelveticaBold);

    // Create new PDF - ALWAYS copy ALL pages from template (outputAllPages = true)
    const newPdf = await PDFDocument.create();
    const totalPages = templatePdf.getPageCount();
    console.log('Template has', totalPages, 'pages - copying ALL pages');
    
    // Copy ALL pages from template (full 23-page binder)
    const allPageIndices = Array.from({ length: totalPages }, (_, i) => i);
    const copiedPages = await newPdf.copyPages(templatePdf, allPageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    // Get pages for overlaying text
    const pages = newPdf.getPages();
    
    // Overlay user data onto the PDF
    const profile = { ...(planData.personal_profile || {}), ...(piiData || {}) };
    const textColor = rgb(0.1, 0.1, 0.1);

    // Helper to sanitize text for PDF (remove special chars that WinAnsi can't encode)
    const sanitizeForPdf = (text: string): string => {
      if (!text) return '';
      return String(text)
        .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u2013|\u2014/g, '-') // Em/en dashes
        .replace(/\u2026/g, '...') // Ellipsis
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
        .trim();
    };

    // Simple text wrapping function with sanitization
    function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
      const sanitized = sanitizeForPdf(text);
      const words = sanitized.split(' ').filter(w => w.length > 0);
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    }

    // Helper to draw text with wrapping
    const drawText = (page: any, text: string, pos: TextPosition) => {
      if (!text) return;
      const fontSize = pos.fontSize || 11;
      const lines = wrapText(text, pos.maxWidth, fontSize, helvetica);
      let currentY = pos.y;
      
      for (const line of lines.slice(0, 5)) { // Max 5 lines
        page.drawText(line, {
          x: pos.x,
          y: currentY,
          size: fontSize,
          font: helvetica,
          color: textColor,
        });
        currentY -= fontSize + 2;
      }
    };

    // Find the cover page in our new PDF and add prepared_for
    if (pages.length > 0) {
      const coverPage = pages[0];
      const coverPositions = FIELD_POSITIONS.cover;
      
      if (profile.full_name) {
        drawText(coverPage, profile.full_name, coverPositions.prepared_for);
      }
      
      drawText(coverPage, new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), coverPositions.date);
    }

    // Find personal info page and overlay data (page 4 in 0-indexed = personal info)
    // Since we copy ALL pages, page index matches the original template
    const personalPage = pages[4]; // Personal info is page 5 (0-indexed = 4)
    if (personalPage) {
      const positions = FIELD_POSITIONS.personal;
      
      if (profile.full_name) drawText(personalPage, profile.full_name, positions.full_name);
      if (profile.nicknames) drawText(personalPage, profile.nicknames, positions.nicknames);
      if (profile.maiden_name) drawText(personalPage, profile.maiden_name, positions.maiden_name);
      if (profile.dob) drawText(personalPage, profile.dob, positions.dob);
      if (profile.birthplace) drawText(personalPage, profile.birthplace, positions.birthplace);
      if (piiData?.ssn) drawText(personalPage, piiData.ssn, positions.ssn);
      if (profile.citizenship) drawText(personalPage, profile.citizenship, positions.citizenship);
      if (profile.address) drawText(personalPage, profile.address, positions.address);
      if (profile.phone) drawText(personalPage, profile.phone, positions.phone);
      if (profile.email) drawText(personalPage, profile.email, positions.email);
    }

    // Find legacy (About Me) page - page 6 (0-indexed)
    const legacyPage = pages[6];
    if (legacyPage && planData.about_me_notes) {
      drawText(legacyPage, planData.about_me_notes, FIELD_POSITIONS.legacy.story);
    }

    // Find funeral page - page 10 (0-indexed)
    const funeralPage = pages[10];
    if (funeralPage) {
      const funeral = planData.funeral || {};
      
      if (funeral.funeral_preference) {
        drawText(funeralPage, funeral.funeral_preference, FIELD_POSITIONS.funeral.preference);
      }
      if (funeral.cemetery_plot) {
        drawText(funeralPage, funeral.cemetery_plot, FIELD_POSITIONS.funeral.cemetery);
      }
      if (funeral.burial_notes || funeral.cremation_notes) {
        drawText(funeralPage, funeral.burial_notes || funeral.cremation_notes, FIELD_POSITIONS.funeral.disposition_notes);
      }
    }

    // Overlay contacts on page 7 (0-indexed)
    const contactsPage = pages[7];
    if (contactsPage && Array.isArray(planData.contacts_notify)) {
      let contactY = 620;
      const contactFontSize = 10;
      for (let i = 0; i < Math.min(planData.contacts_notify.length, 5); i++) {
        const contact = planData.contacts_notify[i];
        if (contact?.name) {
          const contactLine = [
            contact.name,
            contact.relationship ? `(${contact.relationship})` : '',
            contact.contact || contact.phone || contact.email || ''
          ].filter(Boolean).join(' - ');
          
          contactsPage.drawText(sanitizeForPdf(contactLine), {
            x: 70,
            y: contactY,
            size: contactFontSize,
            font: helvetica,
            color: textColor,
          });
          contactY -= 30;
        }
      }
    }

    // Overlay insurance on page 13 (0-indexed)
    const insurancePage = pages[13];
    if (insurancePage && Array.isArray(planData.insurance_policies)) {
      let insuranceY = 620;
      const insuranceFontSize = 10;
      for (let i = 0; i < Math.min(planData.insurance_policies.length, 5); i++) {
        const policy = planData.insurance_policies[i];
        if (policy?.company) {
          const policyLine = [
            policy.company,
            policy.type || '',
            policy.policy_number ? `#${policy.policy_number}` : ''
          ].filter(Boolean).join(' - ');
          
          insurancePage.drawText(sanitizeForPdf(policyLine), {
            x: 70,
            y: insuranceY,
            size: insuranceFontSize,
            font: helvetica,
            color: textColor,
          });
          insuranceY -= 25;
        }
      }
    }

    // Overlay pets on page 15 (0-indexed)
    const petsPage = pages[15];
    if (petsPage && Array.isArray(planData.pets)) {
      let petY = 620;
      const petFontSize = 10;
      for (let i = 0; i < Math.min(planData.pets.length, 5); i++) {
        const pet = planData.pets[i];
        if (pet?.name) {
          const petLine = [
            pet.name,
            pet.breed || '',
            pet.caregiver ? `Care: ${pet.caregiver}` : ''
          ].filter(Boolean).join(' - ');
          
          petsPage.drawText(sanitizeForPdf(petLine), {
            x: 70,
            y: petY,
            size: petFontSize,
            font: helvetica,
            color: textColor,
          });
          petY -= 25;
        }
      }
    }

    // Overlay properties on page 14 (0-indexed)
    const propertyPage = pages[14];
    if (propertyPage && Array.isArray(planData.properties)) {
      let propY = 620;
      const propFontSize = 10;
      for (let i = 0; i < Math.min(planData.properties.length, 5); i++) {
        const prop = planData.properties[i];
        if (prop?.address) {
          const propLine = [
            prop.address,
            prop.mortgage_bank ? `Lender: ${prop.mortgage_bank}` : ''
          ].filter(Boolean).join(' - ');
          
          propertyPage.drawText(sanitizeForPdf(propLine), {
            x: 70,
            y: propY,
            size: propFontSize,
            font: helvetica,
            color: textColor,
          });
          propY -= 25;
        }
      }
    }

    // Add DRAFT watermark if isDraft
    if (isDraft) {
      for (const page of pages) {
        page.drawText('DRAFT', {
          x: 200,
          y: 400,
          size: 72,
          font: helveticaBold,
          color: rgb(0.9, 0.9, 0.9),
          rotate: { type: 'degrees', angle: 45 } as any,
        });
      }
    }

    // Serialize the PDF
    const pdfBytes = await newPdf.save();
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${docType}_${timestamp}.pdf`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('generated-pdfs')
      .upload(filename, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Return the PDF directly as base64 if storage upload fails
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      return new Response(JSON.stringify({ 
        success: true, 
        pdfBase64: base64Pdf,
        filename: `My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate signed URL
    const { data: signedUrl, error: signedError } = await supabase
      .storage
      .from('generated-pdfs')
      .createSignedUrl(filename, 3600); // 1 hour expiry

    if (signedError) {
      console.error('Signed URL error:', signedError);
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      return new Response(JSON.stringify({ 
        success: true, 
        pdfBase64: base64Pdf,
        filename: `My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store reference in generated_documents table
    await supabase
      .from('generated_documents')
      .insert({
        user_id: user.id,
        plan_id: planData.id || null,
        doc_type: docType,
        storage_bucket: 'generated-pdfs',
        storage_path: filename,
      });

    console.log('PDF generated successfully:', signedUrl.signedUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      url: signedUrl.signedUrl,
      filename: `My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Failed to generate PDF',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function to generate a FULL 23-page PDF matching blank form layout
async function generateSimplePdf(
  planData: any, 
  selectedSections: string[], 
  piiData: any,
  userId: string,
  supabase: any,
  corsHeaders: Record<string, string>,
  isDraft: boolean = false
) {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 16;
  
  const profile = { ...(planData.personal_profile || {}), ...(piiData || {}) };
  const textColor = rgb(0.15, 0.15, 0.15);
  const headerColor = rgb(0.05, 0.35, 0.35);
  
  // Helper to sanitize text for PDF
  const sanitizeForPdf = (text: string): string => {
    if (!text) return '';
    return String(text)
      .replace(/[\r\n]+/g, ' ')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .trim();
  };

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    const sanitized = sanitizeForPdf(text);
    const words = sanitized.split(' ').filter(w => w.length > 0);
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = helvetica.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper to add draft watermark
  const addDraftWatermark = (page: any) => {
    if (isDraft) {
      page.drawText('DRAFT', {
        x: 200,
        y: 400,
        size: 72,
        font: helveticaBold,
        color: rgb(0.92, 0.92, 0.92),
        opacity: 0.5,
      });
    }
  };

  // Helper to add page footer
  const addFooter = (page: any, pageNum: number) => {
    page.drawText('For planning purposes only. Not a legal document.', {
      x: margin, y: 40, size: 9, font: helvetica, color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Page ${pageNum}`, {
      x: pageWidth - margin - 40, y: 40, size: 9, font: helvetica, color: rgb(0.5, 0.5, 0.5),
    });
  };

  // Helper to add section header
  const addSectionHeader = (page: any, title: string, y: number): number => {
    page.drawText(sanitizeForPdf(title), {
      x: margin, y, size: 16, font: helveticaBold, color: headerColor,
    });
    return y - 30;
  };

  // Helper to add labeled field
  const addField = (page: any, label: string, value: string, y: number): number => {
    page.drawText(`${label}:`, {
      x: margin, y, size: 10, font: helveticaBold, color: textColor,
    });
    if (value) {
      page.drawText(sanitizeForPdf(value), {
        x: margin + 120, y, size: 10, font: helvetica, color: textColor,
      });
    }
    return y - lineHeight;
  };

  // Helper to add array items
  const addArrayItems = (page: any, items: any[], formatter: (item: any) => string, y: number, maxItems: number = 6): number => {
    let currentY = y;
    const displayItems = items.slice(0, maxItems);
    
    for (const item of displayItems) {
      const text = sanitizeForPdf(formatter(item));
      if (text && currentY > 80) {
        page.drawText(`• ${text}`, {
          x: margin, y: currentY, size: 10, font: helvetica, color: textColor,
        });
        currentY -= lineHeight;
      }
    }
    
    if (items.length > maxItems) {
      page.drawText(`... and ${items.length - maxItems} more`, {
        x: margin, y: currentY, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= lineHeight;
    }
    
    return currentY;
  };

  // Helper to add notes box
  const addNotesBox = (page: any, label: string, notes: string, y: number): number => {
    let currentY = y;
    if (!notes) return currentY;
    
    page.drawText(`${label}:`, {
      x: margin, y: currentY, size: 10, font: helveticaBold, color: textColor,
    });
    currentY -= lineHeight;
    
    const lines = wrapText(notes, pageWidth - margin * 2, 10);
    for (const line of lines.slice(0, 8)) {
      if (currentY > 80) {
        page.drawText(line, {
          x: margin, y: currentY, size: 10, font: helvetica, color: textColor,
        });
        currentY -= 14;
      }
    }
    
    return currentY - 10;
  };

  let pageNum = 1;

  // PAGE 1: Cover
  const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
  coverPage.drawText('My Life & Legacy Planner', {
    x: margin, y: pageHeight - 120, size: 32, font: helveticaBold, color: headerColor,
  });
  coverPage.drawText('A Complete Guide for End-of-Life Planning', {
    x: margin, y: pageHeight - 160, size: 14, font: helvetica, color: textColor,
  });
  if (profile.full_name) {
    coverPage.drawText(`Prepared for: ${sanitizeForPdf(profile.full_name)}`, {
      x: margin, y: pageHeight - 220, size: 16, font: helveticaBold, color: textColor,
    });
  }
  coverPage.drawText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: margin, y: pageHeight - 250, size: 12, font: helvetica, color: rgb(0.4, 0.4, 0.4),
  });
  addDraftWatermark(coverPage);
  addFooter(coverPage, pageNum++);

  // PAGE 2: Table of Contents
  const tocPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let tocY = addSectionHeader(tocPage, 'Table of Contents', pageHeight - 80);
  const sections = [
    'Checklist', 'Instructions', 'Personal Information', 'Life Story & Legacy',
    'Contacts to Notify', 'Service Providers', 'Funeral & Memorial Wishes',
    'Financial Life', 'Insurance Policies', 'Property & Valuables', 'Pets',
    'Digital Accounts', 'Legal Documents', 'Messages to Loved Ones', 'Revisions'
  ];
  for (let i = 0; i < sections.length; i++) {
    tocPage.drawText(`${i + 3}. ${sections[i]}`, {
      x: margin, y: tocY, size: 11, font: helvetica, color: textColor,
    });
    tocY -= 20;
  }
  addDraftWatermark(tocPage);
  addFooter(tocPage, pageNum++);

  // PAGE 3: Checklist
  const checklistPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let checkY = addSectionHeader(checklistPage, 'Planning Checklist', pageHeight - 80);
  const checkItems = [
    'Complete personal information', 'List contacts to notify',
    'Document funeral wishes', 'Record financial accounts',
    'List insurance policies', 'Document property and valuables',
    'Arrange pet care', 'List digital accounts',
    'Gather legal documents', 'Write messages to loved ones'
  ];
  for (const item of checkItems) {
    checklistPage.drawText(`[ ] ${item}`, {
      x: margin, y: checkY, size: 11, font: helvetica, color: textColor,
    });
    checkY -= 22;
  }
  addDraftWatermark(checklistPage);
  addFooter(checklistPage, pageNum++);

  // PAGE 4: Instructions
  const instructionsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let instrY = addSectionHeader(instructionsPage, 'How to Use This Document', pageHeight - 80);
  instrY = addNotesBox(instructionsPage, 'Instructions', planData.instructions_notes || 
    'This document contains important information about your wishes and affairs. Store it in a safe place and inform your loved ones of its location.', instrY);
  addDraftWatermark(instructionsPage);
  addFooter(instructionsPage, pageNum++);

  // PAGE 5-6: Personal Information
  const personal1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let pY = addSectionHeader(personal1, 'Personal Information', pageHeight - 80);
  pY = addField(personal1, 'Full Legal Name', profile.full_name || '', pY);
  pY = addField(personal1, 'Nicknames', profile.nicknames || '', pY);
  pY = addField(personal1, 'Maiden Name', profile.maiden_name || '', pY);
  pY = addField(personal1, 'Date of Birth', profile.dob || profile.date_of_birth || '', pY);
  pY = addField(personal1, 'Place of Birth', profile.birthplace || profile.place_of_birth || '', pY);
  if (piiData?.ssn) pY = addField(personal1, 'SSN', piiData.ssn, pY);
  pY = addField(personal1, 'Citizenship', profile.citizenship || '', pY);
  pY -= 10;
  pY = addField(personal1, 'Address', profile.address || '', pY);
  pY = addField(personal1, 'Phone', profile.phone || '', pY);
  pY = addField(personal1, 'Email', profile.email || '', pY);
  pY -= 10;
  pY = addField(personal1, 'Marital Status', profile.marital_status || '', pY);
  pY = addField(personal1, 'Spouse/Partner', profile.partner_name || '', pY);
  pY = addField(personal1, 'Religion', profile.religion || '', pY);
  addDraftWatermark(personal1);
  addFooter(personal1, pageNum++);

  const personal2 = pdfDoc.addPage([pageWidth, pageHeight]);
  pY = addSectionHeader(personal2, 'Family Information', pageHeight - 80);
  pY = addField(personal2, 'Father', profile.father_name || '', pY);
  pY = addField(personal2, 'Mother', profile.mother_name || '', pY);
  pY = addField(personal2, 'Ex-Spouse', profile.ex_spouse_name || '', pY);
  if (profile.child_names?.length) {
    pY = addField(personal2, 'Children', profile.child_names.join(', '), pY);
  }
  addDraftWatermark(personal2);
  addFooter(personal2, pageNum++);

  // PAGE 7: Life Story & Legacy
  const legacyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let legacyY = addSectionHeader(legacyPage, 'My Life Story & Legacy', pageHeight - 80);
  legacyY = addNotesBox(legacyPage, 'About Me', planData.about_me_notes || '', legacyY);
  addDraftWatermark(legacyPage);
  addFooter(legacyPage, pageNum++);

  // PAGE 8-9: Important Contacts
  const contacts1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let cY = addSectionHeader(contacts1, 'Important Contacts', pageHeight - 80);
  const contactsList = planData.contacts_notify || [];
  cY = addArrayItems(contacts1, contactsList, (c) => 
    [c.name, c.relationship ? `(${c.relationship})` : '', c.contact || c.phone || c.email].filter(Boolean).join(' - '),
    cY, 12
  );
  addDraftWatermark(contacts1);
  addFooter(contacts1, pageNum++);

  const contacts2 = pdfDoc.addPage([pageWidth, pageHeight]);
  cY = addSectionHeader(contacts2, 'Professional Contacts', pageHeight - 80);
  const professionalList = planData.contacts_professional || [];
  cY = addArrayItems(contacts2, professionalList, (c) => 
    [c.role, c.name, c.company, c.contact].filter(Boolean).join(' - '),
    cY, 12
  );
  addDraftWatermark(contacts2);
  addFooter(contacts2, pageNum++);

  // PAGE 10: Service Providers (Vendors)
  const vendorsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let vY = addSectionHeader(vendorsPage, 'Service Providers', pageHeight - 80);
  vY = addNotesBox(vendorsPage, 'Notes', 'Record any service providers, funeral homes, or other vendors here.', vY);
  addDraftWatermark(vendorsPage);
  addFooter(vendorsPage, pageNum++);

  // PAGE 11-12: Funeral & Memorial Wishes
  const funeral1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let fY = addSectionHeader(funeral1, 'Funeral & Memorial Wishes', pageHeight - 80);
  fY = addNotesBox(funeral1, 'My Wishes', planData.funeral_wishes_notes || '', fY);
  const funding = planData.funeral_funding || [];
  if (funding.length > 0) {
    fY -= 20;
    funeral1.drawText('Funding Sources:', { x: margin, y: fY, size: 10, font: helveticaBold, color: textColor });
    fY -= lineHeight;
    fY = addArrayItems(funeral1, funding, (f) => [f.source, f.account].filter(Boolean).join(' - '), fY, 4);
  }
  addDraftWatermark(funeral1);
  addFooter(funeral1, pageNum++);

  const funeral2 = pdfDoc.addPage([pageWidth, pageHeight]);
  fY = addSectionHeader(funeral2, 'Service Details (continued)', pageHeight - 80);
  addDraftWatermark(funeral2);
  addFooter(funeral2, pageNum++);

  // PAGE 13: Financial Life
  const financialPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let finY = addSectionHeader(financialPage, 'Financial Life', pageHeight - 80);
  finY = addNotesBox(financialPage, 'Financial Notes', planData.financial_notes || '', finY);
  const bankList = planData.bank_accounts || [];
  if (bankList.length > 0) {
    finY -= 10;
    financialPage.drawText('Bank Accounts:', { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(financialPage, bankList, (b) => 
      [b.bank_name, b.account_type, b.pod ? `POD: ${b.pod}` : ''].filter(Boolean).join(' - '),
      finY, 6
    );
  }
  const investList = planData.investments || [];
  if (investList.length > 0) {
    finY -= 10;
    financialPage.drawText('Investments:', { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(financialPage, investList, (i) => 
      [i.brokerage, i.account_type].filter(Boolean).join(' - '),
      finY, 4
    );
  }
  addDraftWatermark(financialPage);
  addFooter(financialPage, pageNum++);

  // PAGE 14: Insurance Policies
  const insurancePage = pdfDoc.addPage([pageWidth, pageHeight]);
  let insY = addSectionHeader(insurancePage, 'Insurance Policies', pageHeight - 80);
  insY = addNotesBox(insurancePage, 'Notes', planData.insurance_notes || '', insY);
  const insuranceList = planData.insurance_policies || [];
  if (insuranceList.length > 0) {
    insY -= 10;
    insY = addArrayItems(insurancePage, insuranceList, (p) => 
      [p.company, p.type, p.policy_number ? `#${p.policy_number}` : '', p.contact_person].filter(Boolean).join(' - '),
      insY, 10
    );
  }
  addDraftWatermark(insurancePage);
  addFooter(insurancePage, pageNum++);

  // PAGE 15: Property & Valuables
  const propertyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let propY = addSectionHeader(propertyPage, 'Property & Valuables', pageHeight - 80);
  propY = addNotesBox(propertyPage, 'Notes', planData.property_notes || '', propY);
  const propList = planData.properties || [];
  if (propList.length > 0) {
    propY -= 10;
    propY = addArrayItems(propertyPage, propList, (p) => 
      [p.address, p.kind, p.mortgage_bank ? `Lender: ${p.mortgage_bank}` : ''].filter(Boolean).join(' - '),
      propY, 8
    );
  }
  addDraftWatermark(propertyPage);
  addFooter(propertyPage, pageNum++);

  // PAGE 16: Pets
  const petsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let petY = addSectionHeader(petsPage, 'Pets', pageHeight - 80);
  petY = addNotesBox(petsPage, 'Notes', planData.pets_notes || '', petY);
  const petsList = planData.pets || [];
  if (petsList.length > 0) {
    petY -= 10;
    petY = addArrayItems(petsPage, petsList, (p) => 
      [p.name, p.breed, p.caregiver ? `Caregiver: ${p.caregiver}` : '', p.vet_contact ? `Vet: ${p.vet_contact}` : ''].filter(Boolean).join(' - '),
      petY, 8
    );
  }
  addDraftWatermark(petsPage);
  addFooter(petsPage, pageNum++);

  // PAGE 17: Digital Accounts
  const digitalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let digY = addSectionHeader(digitalPage, 'Digital Accounts', pageHeight - 80);
  digY = addNotesBox(digitalPage, 'Notes', planData.digital_notes || '', digY);
  addDraftWatermark(digitalPage);
  addFooter(digitalPage, pageNum++);

  // PAGE 18: Legal Documents
  const legalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let legY = addSectionHeader(legalPage, 'Legal Documents', pageHeight - 80);
  legY = addNotesBox(legalPage, 'Notes', planData.legal_notes || '', legY);
  addDraftWatermark(legalPage);
  addFooter(legalPage, pageNum++);

  // PAGES 19-22: Messages to Loved Ones
  const messagesPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let msgY = addSectionHeader(messagesPage, 'Messages to Loved Ones', pageHeight - 80);
  msgY = addNotesBox(messagesPage, 'General Message', planData.to_loved_ones_message || planData.messages_notes || '', msgY);
  const messagesList = planData.messages || [];
  if (messagesList.length > 0) {
    msgY -= 10;
    msgY = addArrayItems(messagesPage, messagesList, (m) => 
      [m.audience || m.to_name, m.title].filter(Boolean).join(': '),
      msgY, 6
    );
  }
  addDraftWatermark(messagesPage);
  addFooter(messagesPage, pageNum++);

  // Add 3 more message pages for continuity
  for (let i = 0; i < 3; i++) {
    const msgContPage = pdfDoc.addPage([pageWidth, pageHeight]);
    addSectionHeader(msgContPage, `Messages (continued - page ${i + 2})`, pageHeight - 80);
    addDraftWatermark(msgContPage);
    addFooter(msgContPage, pageNum++);
  }

  // PAGES 23-24: Revisions
  const revPage1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let revY = addSectionHeader(revPage1, 'Revisions & Updates', pageHeight - 80);
  revPage1.drawText('Use this section to record any changes or updates to your plan.', {
    x: margin, y: revY, size: 11, font: helvetica, color: textColor,
  });
  revY -= 40;
  revPage1.drawText('Date                    Change Made                    Initials', {
    x: margin, y: revY, size: 10, font: helveticaBold, color: textColor,
  });
  revY -= 20;
  for (let i = 0; i < 10; i++) {
    revPage1.drawText('________    ________________________________    ______', {
      x: margin, y: revY, size: 10, font: helvetica, color: rgb(0.7, 0.7, 0.7),
    });
    revY -= 24;
  }
  addDraftWatermark(revPage1);
  addFooter(revPage1, pageNum++);

  const revPage2 = pdfDoc.addPage([pageWidth, pageHeight]);
  revY = addSectionHeader(revPage2, 'Revisions (continued)', pageHeight - 80);
  revY -= 20;
  for (let i = 0; i < 12; i++) {
    revPage2.drawText('________    ________________________________    ______', {
      x: margin, y: revY, size: 10, font: helvetica, color: rgb(0.7, 0.7, 0.7),
    });
    revY -= 24;
  }
  addDraftWatermark(revPage2);
  addFooter(revPage2, pageNum++);

  // Final page count should be 23-24
  console.log(`Generated fallback PDF with ${pageNum - 1} pages`);

  const pdfBytes = await pdfDoc.save();
  const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  
  const lastName = (profile.full_name || '').split(' ').pop() || 'Unknown';
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = isDraft 
    ? `DRAFT-My-Life-and-Legacy-Planner_${lastName}_${dateStr}.pdf`
    : `My-Life-and-Legacy-Planner_${lastName}_${dateStr}.pdf`;
  
  return new Response(JSON.stringify({ 
    success: true, 
    pdfBase64: base64Pdf,
    filename
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
