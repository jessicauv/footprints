<!-- Your Logo Header -->
![Logo Header](public/mainlogo.png)

<!-- Use this website to generate badges: https://shields.io/ -->
[![YouTube](https://img.shields.io/badge/-Demo%20Video-FF0000?style=flat&logo=YouTube&logoColor=white)](https://youtube.com/your-demo)
[![Devpost](https://img.shields.io/badge/-Devpost-003E54?style=flat&logo=Devpost&logoColor=white)](https://devpost.com/software/1139781)

## Project Overview
**Footprints** is a digital diary that lets you aesthetically document the places you’ve been: restaurants, bars, cafés, hotels, spas, and more.

Using the Yelp AI API, it extracts rich, niche details about each business: menu highlights, ambiance, and unique characteristics, etc and transforms them into custom-designed journal components allowing users to create shareable journal entries with drag-and-drop editing.

<!-- How It Works - add clear steps and a GIF -->
**How It Works:**
<div style="display: flex; align-items: center; gap: 20px;">
  <div style="flex: 1;">
    <ol>
      <li><strong>Choose a Location:</strong> Search and select from thousands of locations using Yelp's database</li>
      <li><strong>Content Generation:</strong> Automatically generate personalized vibes, menu descriptions, and AI illustrations you can use in your journal</li>
      <li><strong>Design Your Page:</strong> Use the drag-and-drop canvas editor to arrange text, images, and journal components</li>
      <li><strong>Share & Discover:</strong> Publish your journal pages to the community gallery or share them directly to others</li>
    </ol>
  </div>
  <div style="flex: 1;">
    <img src="public/mainlogo.png" alt="Footprints Logo" width="100%">
  </div>
</div>

## Technical Architecture

<!-- Core Technologies - get icons from simpleicons.org for your tech stack and color code according to key -->
**Core Technologies**<br>
<!-- Can use AI to update this part -->

<table>
  <tr>
    <td align="center"> <img src="https://cdn.simpleicons.org/react/61DAFB" height="40"><br> <sub>React 19</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/typescript/3178C6" height="40"><br> <sub>TypeScript</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/firebase/FFCA28" height="40"><br> <sub>Firebase</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/vite/646CFF" height="40"><br> <sub>Vite</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/vercel/000000" height="40"><br> <sub>Vercel</sub> </td>
  </tr>
  <tr>
    <td align="center"> <img src="https://cdn.simpleicons.org/openai/412991" height="40"><br> <sub>OpenAI</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/yelp/FF1A1A" height="40"><br> <sub>Yelp API</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/html5/E34F26" height="40"><br> <sub>HTML5 Canvas</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/css3/1572B6" height="40"><br> <sub>CSS3</sub> </td>
    <td align="center"> <img src="https://cdn.simpleicons.org/npm/CB3837" height="40"><br> <sub>npm</sub> </td>
  </tr>
</table>

**Technical Features**
- **Drag-and-Drop Canvas Editor**: Intuitive visual editor for arranging text, images, and journal components
- **Custom Journalling Component Generation**: Uses Yelp AI API to extract niche info on the place - eg 3 words that describe the vibe. Using this, it dynamically creates journal components
- **Community Gallery**: Public showcase of user-created journal pages with live previews
- **Restaurant Search Integration**: Direct connection to Yelp's restaurant database with autocomplete
- **Responsive Design**: Optimized experience across desktop and mobile devices
- **Firebase Authentication**: Secure user accounts with email/password authentication
- **Cloud Data Storage**: Persistent journal storage using Firestore NoSQL database

## Usage & Testing
**Using the Deployed Application**

🔗 The app is live & ready to use - <a href="https://try-footprints.vercel.app/">Try It Out</a>

<div style="border: 1px solid rgba(176, 174, 172, 1); padding: 10px; border-radius: 5px; margin-top: 10px; display: inline-block; margin-left: 20px;">
  <em>Testing Notes</em>
  <ul>
    <li>Yelp API has usage limits - may show default content if quota exceeded</li>
    <!--<li>OpenAI DALL-E 3 image generation may take 10-30 seconds per image</li>-->
    <!--<li>Firebase storage has document size limits for gallery sharing</li>-->
  </ul>
</div>

<!-- Can use AI to update this part -->
### Local Development Setup

Here's all the steps you need to run Footprints locally:

**Prerequisites**
- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

**Setup Instructions**
1. **Clone the Repository**
   ```bash
   git clone https://github.com/jessicauviovo/footprints.git
   cd footprints
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Get API keys from the following services:
     - **OpenAI API Key**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
     - **Yelp API Key**: [https://www.yelp.com/developers](https://www.yelp.com/developers)
     - **Firebase Config**: Already configured in the project

4. **Configure Environment Variables**
   Add your API keys to the `.env` file:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key_here
   VITE_YELP_API_KEY=your_yelp_key_here
   ```

**Running Instructions**

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Build for Production**
```bash
npm run build
npm run preview
```

**Troubleshooting Local Development**

- **API Key Issues**: Ensure all required environment variables are set in `.env`
- **Build Errors**: Run `npm install` to ensure all dependencies are installed
- **Firebase Connection**: Check that Firebase configuration matches your project settings
- **CORS Issues**: Some external images may not load due to CORS restrictions in development

## Disclosures

**AI Usage Statement**<br>
This project leverages AI technologies in the following ways:

- **AI in the Application**:
  - Yelp AI API
  - OpenAI DALL-E 3

- **AI in Development**:
  - Used AI-assisted tool ClineAI for general development and debugging needs
  - All AI-generated code was reviewed, tested, and modified by human developers