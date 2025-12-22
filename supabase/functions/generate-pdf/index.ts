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
      console.log('Template not found in storage (status:', templateResponse.status, '), will generate from scratch');
      // Fall back to generating a simple PDF without template
      return await generateSimplePdf(planData, selectedSections, piiData, user.id, supabase, corsHeaders);
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

// Fallback function to generate a simple PDF without template
async function generateSimplePdf(
  planData: any, 
  selectedSections: string[], 
  piiData: any,
  userId: string,
  supabase: any,
  corsHeaders: Record<string, string>
) {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  // Add cover page
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 100;
  
  // Title
  page.drawText('My Life & Legacy Planner', {
    x: margin,
    y,
    size: 28,
    font: helveticaBold,
    color: rgb(0.1, 0.18, 0.27),
  });
  
  y -= 40;
  page.drawText('End-of-Life Planning Guide', {
    x: margin,
    y,
    size: 14,
    font: helvetica,
    color: rgb(0.27, 0.27, 0.27),
  });
  
  y -= 60;
  const profile = { ...(planData.personal_profile || {}), ...(piiData || {}) };
  if (profile.full_name) {
    page.drawText(`Prepared for: ${profile.full_name}`, {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });
  }
  
  y -= 30;
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: margin,
    y,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Footer
  page.drawText('For planning purposes only. Not a legal document.', {
    x: margin,
    y: 50,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('Provided by Everlasting Funeral Advisors', {
    x: margin,
    y: 35,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Helper to sanitize text for PDF (remove special chars that WinAnsi can't encode)
  const sanitizeForPdf = (text: string): string => {
    if (!text) return '';
    return text
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

  // Helper to add content page
  const addContentPage = (title: string, content: string | null) => {
    if (!content) return;
    
    const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - 60;
    
    // Title
    newPage.drawText(sanitizeForPdf(title), {
      x: margin,
      y: currentY,
      size: 18,
      font: helveticaBold,
      color: rgb(0.05, 0.46, 0.46),
    });
    
    currentY -= 30;
    
    // Content - sanitize and split by spaces
    const sanitizedContent = sanitizeForPdf(content);
    const words = sanitizedContent.split(' ').filter(w => w.length > 0);
    let line = '';
    const maxWidth = pageWidth - (margin * 2);
    
    for (const word of words) {
      const sanitizedWord = sanitizeForPdf(word);
      if (!sanitizedWord) continue;
      
      const testLine = line ? `${line} ${sanitizedWord}` : sanitizedWord;
      const width = helvetica.widthOfTextAtSize(testLine, 11);
      
      if (width > maxWidth && line) {
        newPage.drawText(line, {
          x: margin,
          y: currentY,
          size: 11,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentY -= 15;
        line = sanitizedWord;
        
        if (currentY < 80) break;
      } else {
        line = testLine;
      }
    }
    
    if (line && currentY >= 80) {
      newPage.drawText(line, {
        x: margin,
        y: currentY,
        size: 11,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    
    // Footer
    newPage.drawText('For planning purposes only. Not a legal document.', {
      x: margin,
      y: 50,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  };

  // Add sections based on selection
  if (selectedSections.includes('personal') && profile.full_name) {
    const personalContent = [
      profile.full_name && `Name: ${profile.full_name}`,
      profile.address && `Address: ${profile.address}`,
      profile.phone && `Phone: ${profile.phone}`,
      profile.email && `Email: ${profile.email}`,
      profile.dob && `Date of Birth: ${profile.dob}`,
      profile.birthplace && `Place of Birth: ${profile.birthplace}`,
      profile.marital_status && `Marital Status: ${profile.marital_status}`,
      profile.partner_name && `Spouse/Partner: ${profile.partner_name}`,
    ].filter(Boolean).join(' | '); // Use pipe separator instead of newlines
    
    if (personalContent) {
      addContentPage('My Personal Information', personalContent);
    }
  }

  if (selectedSections.includes('legacy') && planData.about_me_notes) {
    addContentPage('About Me - My Story & Legacy', planData.about_me_notes);
  }

  if (selectedSections.includes('funeral') && planData.funeral_wishes_notes) {
    addContentPage('My Funeral & Memorial Wishes', planData.funeral_wishes_notes);
  }

  if (selectedSections.includes('financial') && planData.financial_notes) {
    addContentPage('Financial Life', planData.financial_notes);
  }

  if (selectedSections.includes('insurance') && planData.insurance_notes) {
    addContentPage('Insurance', planData.insurance_notes);
  }

  if (selectedSections.includes('property') && planData.property_notes) {
    addContentPage('My Property', planData.property_notes);
  }

  if (selectedSections.includes('legal') && planData.legal_notes) {
    addContentPage('Legal', planData.legal_notes);
  }

  if (selectedSections.includes('messages') && planData.messages_notes) {
    addContentPage('Messages to Loved Ones', planData.messages_notes);
  }

  const pdfBytes = await pdfDoc.save();
  const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  
  return new Response(JSON.stringify({ 
    success: true, 
    pdfBase64: base64Pdf,
    filename: `My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
