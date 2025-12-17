import OpenAI from 'openai';

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export class ImageService {
  private openai: OpenAI | null = null;

  constructor() {
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
      prompts.push(`Generate a single, cartoon-style sticker of the menu item ${item}.

The image should feature only this menu item.

Use a solid background color that contrasts well with the item.

Style should be cute, aesthetic, journal-friendly, and sticker-like, like something you could place in a digital journal.

No text or logos (except very minimal, optional small label if necessary).

The item should be centered and clearly visible, with clean, simple lines.

No extra objects, clutter, or background details.`);
    });

    console.log('🎨 Generated 3 prompts:', prompts);
    return prompts;
  }

  async generateImagesFromPrompts(prompts: string[]): Promise<GeneratedImage[]> {
    if (!this.openai) {
      console.warn('OpenAI API not initialized - cannot generate images');
      return [];
    }

    console.log('🎨 Generating 3 images from prompts...', prompts);

    const imagePromises = prompts.map(async (prompt, index) => {
      try {
        console.log(`🖼️ Generating image ${index + 1}/3: "${prompt}"`);
        const response = await this.openai!.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) {
          throw new Error(`No image URL returned for prompt ${index + 1}`);
        }

        console.log(`✅ Image ${index + 1} generated:`, imageUrl);
        return {
          url: imageUrl,
          prompt: prompt
        };
      } catch (error) {
        console.error(`❌ Error generating image ${index + 1}:`, error);
        // Return placeholder on error
        return {
          url: `https://via.placeholder.com/512x512.png?text=Error+${index + 1}`,
          prompt: prompt
        };
      }
    });

    try {
      const results = await Promise.all(imagePromises);
      console.log('🎉 All images generated successfully!', results.length, 'images');
      return results;
    } catch (error) {
      console.error('❌ Error generating images:', error);
      return [];
    }
  }

  async generateRestaurantImages(detailedInfo: string): Promise<GeneratedImage[]> {
    const prompts = await this.generateImagePrompts(detailedInfo);
    return await this.generateImagesFromPrompts(prompts);
  }
}

// Export a singleton instance
export const imageService = new ImageService();
