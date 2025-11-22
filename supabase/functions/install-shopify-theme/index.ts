import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_API_VERSION = '2024-04';

interface ShopifyTheme {
  id: number;
  name: string;
  role: string;
  processing: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopifyUrl, accessToken, themeColor, sessionId } = await req.json();

    if (!shopifyUrl || !accessToken || !sessionId) {
      throw new Error('Missing required fields');
    }

    console.log('🎨 Installing Refresh theme from Supabase Storage...');
    console.log(`📍 Store: ${shopifyUrl}`);
    console.log(`🎨 Brand color: ${themeColor || 'Not provided'}`);
    console.log(`🆔 Session: ${sessionId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Generate signed URL for the theme ZIP (10 minutes)
    console.log('🔗 Generating signed URL for Refresh theme...');
    const { data: signedData, error: signedError } = await supabase.storage
      .from('themes')
      .createSignedUrl('refresh/refresh.zip', 600);

    if (signedError || !signedData?.signedUrl) {
      console.error('❌ Failed to generate signed URL:', signedError);
      throw new Error('Failed to generate signed URL for theme ZIP. Please ensure the theme is uploaded to storage.');
    }

    const zipUrl = signedData.signedUrl;
    console.log('✅ Signed URL generated successfully');

    const cleanUrl = shopifyUrl.replace(/\/$/, '');
    const headers = {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    };

    // Helper function with retry logic
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, options);
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
            console.log(`⏳ Rate limited, waiting ${retryAfter}s...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }
          return response;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      throw new Error('Max retries exceeded');
    };

    // Step 2: Find or install Refresh theme
    console.log('🔍 Checking for existing Refresh theme...');
    const themesResponse = await fetchWithRetry(
      `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
      { headers }
    );

    if (!themesResponse.ok) {
      throw new Error(`Failed to fetch themes: ${themesResponse.statusText}`);
    }

    const themesData = await themesResponse.json();
    let refreshTheme = themesData.themes?.find((t: ShopifyTheme) => 
      /refresh/i.test(t.name)
    );

    if (!refreshTheme) {
      console.log('📥 Installing Refresh theme from ZIP...');
      const installResponse = await fetchWithRetry(
        `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            theme: {
              name: 'Refresh',
              src: zipUrl,
            },
          }),
        }
      );

      if (!installResponse.ok) {
        const errorText = await installResponse.text();
        console.error('❌ Theme installation failed:', errorText);
        throw new Error(`Failed to install theme: ${installResponse.statusText}`);
      }

      const installData = await installResponse.json();
      refreshTheme = installData.theme;
      console.log(`✅ Refresh theme installed with ID: ${refreshTheme.id}`);

      // Poll until processing is complete
      console.log('⏳ Waiting for theme processing...');
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const checkResponse = await fetchWithRetry(
          `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${refreshTheme.id}.json`,
          { headers }
        );
        const checkData = await checkResponse.json();
        if (!checkData.theme.processing) {
          console.log('✅ Theme processing complete');
          refreshTheme = checkData.theme;
          break;
        }
        attempts++;
      }
    } else {
      console.log(`✅ Found existing Refresh theme with ID: ${refreshTheme.id}`);
    }

    // Step 3: Publish Refresh as main theme
    console.log('🚀 Publishing Refresh as the Current theme...');
    const publishResponse = await fetchWithRetry(
      `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${refreshTheme.id}.json`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          theme: {
            id: refreshTheme.id,
            role: 'main',
          },
        }),
      }
    );

    if (!publishResponse.ok) {
      throw new Error(`Failed to publish theme: ${publishResponse.statusText}`);
    }

    console.log('✅ Refresh is now the Current theme');

    // Step 4: Delete all other themes
    console.log('🗑️ Removing other themes...');
    const otherThemes = themesData.themes?.filter((t: ShopifyTheme) => 
      t.id !== refreshTheme.id
    ) || [];

    for (const theme of otherThemes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        await fetchWithRetry(
          `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${theme.id}.json`,
          { method: 'DELETE', headers }
        );
        console.log(`✅ Deleted theme: ${theme.name}`);
      } catch (error) {
        console.error(`⚠️ Failed to delete theme ${theme.name}:`, error);
      }
    }

    // Step 5: Apply brand color if provided
    if (themeColor) {
      console.log(`🎨 Applying brand color: ${themeColor}`);
      await applyBrandColor(cleanUrl, accessToken, refreshTheme.id, themeColor);
    }

    // Step 6: Final verification
    console.log('🔍 Verifying final theme configuration...');
    const verifyResponse = await fetchWithRetry(
      `${cleanUrl}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
      { headers }
    );
    const verifyData = await verifyResponse.json();
    const mainTheme = verifyData.themes?.find((t: ShopifyTheme) => t.role === 'main');

    if (!mainTheme || !/refresh/i.test(mainTheme.name)) {
      console.error('⚠️ Warning: Refresh might not be the main theme');
    } else {
      console.log('✅ Verified: Refresh is the Current theme');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Refresh theme installed, published, and customized',
        themeId: refreshTheme.id,
        themeName: refreshTheme.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Theme installation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function applyBrandColor(
  shopifyUrl: string,
  accessToken: string,
  themeId: number,
  color: string
) {
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  };

  try {
    // Read current settings
    console.log('📖 Reading theme settings...');
    const settingsResponse = await fetch(
      `${shopifyUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
      { headers }
    );

    if (!settingsResponse.ok) {
      console.error('⚠️ Could not read settings_data.json');
      return;
    }

    const settingsData = await settingsResponse.json();
    let settings = JSON.parse(settingsData.asset.value || '{}');
    
    console.log('🔍 Current settings structure:', Object.keys(settings));

    // Initialize current settings if needed
    if (!settings.current) settings.current = {};

    // Apply brand color to all color scheme presets
    if (settings.current.color_schemes) {
      console.log('🎨 Updating color schemes...');
      const schemes = settings.current.color_schemes;
      
      // Update accent schemes with brand color
      Object.keys(schemes).forEach(schemeName => {
        if (schemeName.includes('accent') || schemeName.includes('inverse')) {
          const scheme = schemes[schemeName];
          if (scheme.settings) {
            scheme.settings.background = color;
            scheme.settings.text = '#ffffff';
            scheme.settings.button = '#ffffff';
            scheme.settings.button_label = color;
            scheme.settings.secondary_button_label = '#ffffff';
            console.log(`✅ Updated color scheme: ${schemeName}`);
          }
        }
      });
    }
    
    // Apply to direct color settings
    const colorSettings = {
      colors_accent_1: color,
      colors_accent_2: color,
      gradient_accent_1: color,
      gradient_accent_2: color,
      colors_button_primary: color,
      button_primary_color: color,
      primary_color: color,
      accent_color: color,
      colors_link: color,
      header_background: color,
      footer_background: color,
      badge_sale_background: color,
      price_color: color,
    };

    Object.assign(settings.current, colorSettings);

    // Write back settings
    console.log('💾 Writing updated theme settings...');
    const updateResponse = await fetch(
      `${shopifyUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify(settings, null, 2),
          },
        }),
      }
    );

    if (updateResponse.ok) {
      console.log('✅ Theme settings updated with brand color');
    } else {
      const errorText = await updateResponse.text();
      console.error('⚠️ Failed to update settings:', errorText);
    }

    // Apply comprehensive custom CSS
    console.log('🎨 Applying comprehensive custom CSS...');
    const customCSS = `
/* ============================================
   BRAND COLOR: ${color}
   Comprehensive Refresh Theme Override
   ============================================ */

:root {
  --color-brand: ${color};
  --color-brand-text: #ffffff;
}

/* ============================================
   HEADER - Complete coverage
   ============================================ */
.header-wrapper,
.header,
.shopify-section-group-header-group,
header.header,
.section-header,
.header__wrapper,
.header-group,
section[id*="shopify-section-header"] {
  background-color: ${color} !important;
}

/* Header text & icons - white for contrast */
.header__heading,
.header__heading-link,
.header__heading-link:hover,
.header__menu-item,
.header__menu-item span,
.list-menu__item,
.list-menu__item > a,
.header__icon,
.header__icon svg,
.header__icon--cart,
.header__icon--account,
.header__icon--search,
.cart-count-bubble,
.menu-drawer__navigation-link,
.header__active-menu-item,
.header__heading-logo-wrapper,
.header__menu-item:hover {
  color: #ffffff !important;
  fill: #ffffff !important;
}

/* ============================================
   PAGE TITLE BAR (The black strip)
   ============================================ */
.page-header,
.collection-hero,
.collection-hero__title,
.page-title,
.page-width:first-child,
.main-page-title,
section[class*="page-title"],
.template-collection .page-width:first-child,
.template-page .page-width:first-child,
div[class*="breadcrumbs"],
.breadcrumb {
  background-color: ${color} !important;
  color: #ffffff !important;
}

h1.page-title,
h1.collection-hero__title,
h1.main-page-title,
.page-header h1,
.collection__title {
  color: #ffffff !important;
}

/* ============================================
   BUTTONS & CTAs - Brand colored
   ============================================ */
.button,
.button--primary,
.button--full-width,
.shopify-payment-button__button--unbranded,
.product-form__submit,
button[type="submit"],
.cart__submit,
.cart__checkout-button,
input[type="submit"],
.btn,
.btn--primary,
button.button,
a.button--primary {
  background-color: ${color} !important;
  border-color: ${color} !important;
  color: #ffffff !important;
}

.button:hover,
.button--primary:hover,
.product-form__submit:hover {
  background-color: ${color} !important;
  opacity: 0.9;
  color: #ffffff !important;
}

/* ============================================
   PRICES & SALE BADGES
   ============================================ */
.price,
.price--on-sale,
.price__sale,
.price__sale .price-item--sale,
.price-item--sale,
.product__price,
.product-price {
  color: ${color} !important;
}

.badge,
.badge--sale,
.card__badge,
.product__badge,
.badge--bottom-left,
.price__badge-sale,
.product-badge,
.badge-sale {
  background-color: ${color} !important;
  color: #ffffff !important;
  border-color: ${color} !important;
}

/* ============================================
   FOOTER - Complete coverage
   ============================================ */
.footer,
.shopify-section-group-footer-group,
footer.footer,
.section-footer,
.footer-block,
section[id*="shopify-section-footer"] {
  background-color: ${color} !important;
  color: #ffffff !important;
}

/* Footer text & links - white */
.footer *:not(svg),
.footer__heading,
.footer__list-social a,
.footer__list-social svg,
.footer a,
.footer__copyright,
.footer__content-top,
.footer__content-bottom,
.footer__blocks-wrapper,
.footer__column,
.footer-block__heading,
.footer__list-social,
.list-social__link {
  color: #ffffff !important;
  fill: #ffffff !important;
}

/* ============================================
   LINKS & ACCENTS
   ============================================ */
a.link--accent,
.link--accent:hover,
a:hover[href*="/products/"],
a:hover[href*="/collections/"],
.text-accent {
  color: ${color} !important;
}

/* ============================================
   ANNOUNCEMENT BAR
   ============================================ */
.announcement-bar,
.shopify-section-group-header-group .announcement-bar {
  background-color: ${color} !important;
  color: #ffffff !important;
}

.announcement-bar__message,
.announcement-bar__link {
  color: #ffffff !important;
}

/* ============================================
   NAVIGATION & MENUS
   ============================================ */
.list-menu--disclosure,
.header__submenu,
.mega-menu,
.header__menu {
  background-color: ${color} !important;
}

.list-menu--disclosure a,
.header__submenu a,
.mega-menu a {
  color: #ffffff !important;
}

/* ============================================
   PRODUCT CARDS & COLLECTIONS
   ============================================ */
.card__badge,
.product-card__badge {
  background-color: ${color} !important;
  color: #ffffff !important;
}

/* ============================================
   ADD TO CART & CHECKOUT
   ============================================ */
.product-form__submit,
.shopify-payment-button__button,
form[action*="/cart/add"] button,
.cart-item__remove,
.cart__checkout-button {
  background-color: ${color} !important;
  color: #ffffff !important;
  border-color: ${color} !important;
}

/* ============================================
   QUANTITY SELECTOR & INTERACTIVE ELEMENTS
   ============================================ */
.quantity__button:hover,
button:hover {
  background-color: ${color} !important;
  color: #ffffff !important;
}

/* Force important styles to override theme defaults */
.color-accent-1,
.color-accent-2,
.gradient.color-accent-1,
.gradient.color-accent-2 {
  background-color: ${color} !important;
  color: #ffffff !important;
}
`;

    const cssUpload = await fetch(
      `${shopifyUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          asset: {
            key: 'assets/custom-brand.css',
            value: customCSS,
          },
        }),
      }
    );

    if (cssUpload.ok) {
      console.log('✅ Custom CSS uploaded successfully');
    } else {
      console.error('⚠️ Failed to upload custom CSS');
    }

    // Ensure custom CSS is linked in theme.liquid
    console.log('🔗 Linking custom CSS in theme.liquid...');
    const themeResponse = await fetch(
      `${shopifyUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`,
      { headers }
    );

    if (themeResponse.ok) {
      const themeData = await themeResponse.json();
      let themeContent = themeData.asset.value || '';

      const cssLink = `{{ 'custom-brand.css' | asset_url | stylesheet_tag }}`;
      
      if (!themeContent.includes('custom-brand.css')) {
        // Insert before </head>
        themeContent = themeContent.replace(
          '</head>',
          `  ${cssLink}\n</head>`
        );

        const linkUpload = await fetch(
          `${shopifyUrl}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              asset: {
                key: 'layout/theme.liquid',
                value: themeContent,
              },
            }),
          }
        );

        if (linkUpload.ok) {
          console.log('✅ Custom CSS linked in theme.liquid');
        }
      } else {
        console.log('✅ Custom CSS already linked');
      }
    }

    console.log('✅ Brand color application complete');
  } catch (error) {
    console.error('❌ Error applying brand color:', error);
  }
}
