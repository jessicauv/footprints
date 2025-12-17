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
      // Test API call to verify it's working
      (async () => {
        try {
          const completion = await this.openai!.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Test message" }],
            max_tokens: 5,
          });
          console.log('✅ OpenAI API test successful:', completion.choices[0]?.message?.content);
        } catch (error) {
          console.error('❌ OpenAI API test failed:', error);
        }
      })();
    }
  }

  async generateImagePrompts(detailedInfo: string): Promise<string[]> {
    if (!this.openai) {
      console.warn('OpenAI API key not configured - using default prompts');
      return [
        "Restaurant exterior with warm lighting",
        "Cozy interior dining area",
        "Delicious food presentation",
        "Colorful decor and ambiance",
        "People enjoying a meal together",
        "Signature dish close-up",
        "Atmospheric lighting and mood",
        "Restaurant entrance and signage"
      ];
    }

    console.log('🤖 Generating image prompts from detailedInfo...');
    const prompt = `Based on this detailed information about a restaurant: "${detailedInfo}"

    Generate exactly 8 distinct image-generation prompts for DALL·E.
Each prompt should describe a cute, sticker-style illustration that can be used in a digital diary or journal to represent a restaurant or place visited.

Sticker style requirements:

Cute, playful, and simple (cartoon / kawaii-style)

Designed as individual stickers

Transparent background (no background)

No text, letters, numbers, or words in the image

Sticker content guidelines:

Each prompt should represent a different visual idea, such as:

A polaroid-style picture frame (without any text)

Cartoon illustrations of menu items

A flag representing the cuisine or country

Emojis or symbolic icons

A city/high-rise building if the place is downtown

A money or luxury symbol if the place is expensive

Do not repeat the same concept across prompts

Output only the 8 image prompts, clearly separated (one per line or numbered). Do not include explanations or extra text.

Return only the 8 prompts, one per line, with no additional text or numbering.`;

    try {
      console.log('📡 Calling ChatGPT API...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      console.log('✅ ChatGPT response received:', response);

      // Split by newlines and clean up
      const prompts = response.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 8); // Ensure we only get 8 prompts

      console.log('🎨 Generated prompts:', prompts);

      if (prompts.length < 8) {
        // If we don't have 8 prompts, create some defaults
        const defaults = [
          "Restaurant exterior with warm lighting",
          "Cozy interior dining area",
          "Delicious food presentation",
          "Colorful decor and ambiance",
          "People enjoying a meal together",
          "Signature dish close-up",
          "Atmospheric lighting and mood",
          "Restaurant entrance and signage"
        ];
        return [...prompts, ...defaults.slice(prompts.length)];
      }

      return prompts;
    } catch (error) {
      console.error('❌ Error generating image prompts:', error);
      // Return default prompts if API fails
      console.log('⚠️ Using fallback prompts');
      return [
        "Restaurant exterior with warm lighting",
        "Cozy interior dining area",
        "Delicious food presentation",
        "Colorful decor and ambiance",
        "People enjoying a meal together",
        "Signature dish close-up",
        "Atmospheric lighting and mood",
        "Restaurant entrance and signage"
      ];
    }
  }

  async generateImagesFromPrompts(prompts: string[]): Promise<GeneratedImage[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🎨 Generating images from prompts...', prompts);

    const imagePromises = prompts.map(async (prompt, index) => {
      try {
        console.log(`🖼️ Generating image ${index + 1}/8: "${prompt}"`);
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
        // Return a placeholder or throw
        throw error;
      }
    });

    try {
      const results = await Promise.all(imagePromises);
      console.log('🎉 All images generated successfully!', results.length, 'images');
      return results;
    } catch (error) {
      console.error('❌ Error generating images:', error);
      // Return empty array or partial results
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
