import OpenAI from 'openai';

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export class ImageService {
  // COMMENTED OUT TO SAVE CHATGPT CREDITS
  // private openai: OpenAI | null = null;

  constructor() {
    // COMMENTED OUT TO SAVE CHATGPT CREDITS
    /*
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
      });
      console.log('✅ OpenAI API initialized');
    } else {
      console.warn('⚠️ OpenAI API key not found. Set VITE_OPENAI_API_KEY in .env');
    }
    */
  }

  // Parse menu items and location from Yelp AI response
  private parseYelpResponse(detailedInfo: string): { menuItems: string[], location: string } {
    const lines = detailedInfo.split('\n').map(line => line.trim());

    let menuItems: string[] = [];
    let location = '';

    let inMenuSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('menu items:')) {
        inMenuSection = true;
        continue;
      }

      if (line.toLowerCase().includes('location:')) {
        inMenuSection = false;
        // Extract location description after "Location:"
        const locationMatch = line.match(/location:\s*(.+)/i);
        if (locationMatch) {
          location = locationMatch[1].trim();
        }
        continue;
      }

      if (inMenuSection && line && !line.startsWith('Menu Items:') && line.length > 0) {
        // Clean up the menu item (remove numbering, extra spaces)
        const cleanItem = line.replace(/^\d+\.\s*/, '').trim();
        if (cleanItem) {
          menuItems.push(cleanItem);
        }
      }
    }

    // Ensure we have at least 3 menu items, pad with McDonald's defaults if needed
    while (menuItems.length < 3) {
      const defaultItems = ["McDonald's fries", "McDonald's burger", "vanilla milkshake"];
      menuItems.push(defaultItems[menuItems.length] || `Menu Item ${menuItems.length + 1}`);
    }

    // Take only first 3 menu items
    menuItems = menuItems.slice(0, 3);

    // Default location if not found
    if (!location) {
      location = 'countryside';
    }

    return { menuItems, location };
  }

  async generateImagePrompts(detailedInfo: string): Promise<string[]> {
    console.log('🔍 Parsing Yelp AI response:', detailedInfo);
    const { menuItems, location } = this.parseYelpResponse(detailedInfo);

    console.log('📝 Extracted menu items:', menuItems);
    console.log('📍 Extracted location:', location);

    // Generate 3 prompts: menu items only
    const prompts: string[] = [];

    // Add menu item prompts
    menuItems.forEach(item => {
    prompts.push(`Generate a single, cartoon-style image of the menu item ${item}.

The image should feature only this menu item.

Use a solid background color that contrasts well with the item.

Style should be cute and cartoon-like.

No text or logos (except very minimal, optional small label if necessary).

The item should be centered and clearly visible, with clean, simple lines.

No extra objects, clutter, or background details.`);
    });

    console.log('🎨 Generated 3 prompts:', prompts);
    return prompts;
  }

  // COMMENTED OUT TO SAVE CHATGPT CREDITS - Convert image URL to data URL for local storage
  /*
  private async convertImageToDataURL(imageUrl: string): Promise<string> {
    try {
      console.log('📥 Downloading image from Azure:', imageUrl);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataURL = reader.result as string;
          console.log('✅ Image converted to data URL, size:', dataURL.length, 'characters');
          resolve(dataURL);
        };
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to data URL:', error);
      throw error;
    }
  }
  */

  async generateImagesFromPrompts(prompts: string[]): Promise<GeneratedImage[]> {
    // COMMENTED OUT TO SAVE CHATGPT/DALL-E CREDITS
    console.log('🎨 Image generation commented out to save credits');
    console.log('Would generate images from prompts:', prompts);

    // Return placeholder images instead
    return prompts.map((prompt, index) => ({
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" fill="#e3f2fd"/>
          <text x="256" y="240" text-anchor="middle" font-family="Arial" font-size="20" fill="#1976d2">
            Image Generation
          </text>
          <text x="256" y="270" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
            Paused to Save Credits
          </text>
          <text x="256" y="290" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
            ${index + 1}/3
          </text>
        </svg>
      `)}`,
      prompt: prompt
    }));

    /*
    if (!this.openai) {
      console.warn('OpenAI API not initialized - cannot generate images');
      return [];
    }

    console.log('🎨 Generating 3 images from prompts...', prompts);

    const imagePromises = prompts.map(async (prompt, index) => {
      try {
        console.log(`🖼️ Generating image ${index + 1}/3: "${prompt.substring(0, 50)}..."`);
        const response = await this.openai!.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });

        const azureImageUrl = response.data?.[0]?.url;
        if (!azureImageUrl) {
          throw new Error(`No image URL returned for prompt ${index + 1}`);
        }

        console.log(`✅ Image ${index + 1} generated from Azure:`, azureImageUrl.substring(0, 50) + '...');

        // Convert the Azure URL to a local data URL
        const dataUrl = await this.convertImageToDataURL(azureImageUrl);

        return {
          url: dataUrl,
          prompt: prompt
        };
      } catch (error) {
        console.error(`❌ Error generating image ${index + 1}:`, error);
        // Return a simple placeholder data URL on error
        const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(`
          <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="#f0f0f0"/>
            <text x="256" y="256" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="24" fill="#666">
              Error ${index + 1}
            </text>
          </svg>
        `)}`;

        return {
          url: placeholderDataUrl,
          prompt: prompt
        };
      }
    });

    try {
      const results = await Promise.all(imagePromises);
      console.log('🎉 All images generated and converted successfully!', results.length, 'images');
      return results;
    } catch (error) {
      console.error('❌ Error generating images:', error);
      return [];
    }
    */
  }

  async generateRestaurantImages(detailedInfo: string): Promise<GeneratedImage[]> {
    const prompts = await this.generateImagePrompts(detailedInfo);
    return await this.generateImagesFromPrompts(prompts);
  }
}

// Export a singleton instance
export const imageService = new ImageService();
