import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { type GeneratedImage } from './imageService';
import YelpStars, { getYelpStarsImageUrl } from './YelpStars';

interface PageEditorProps {
  journal: {
    id: string;
    title: string;
    createdAt: Date;
    description?: string;
    color?: string;
  };
  pageId: number;
  vibes?: string;
  detailedInfo?: string;
  onClose: () => void;
  restaurant?: any;
  generatedImages?: GeneratedImage[];
  onImagesLoaded?: (images: GeneratedImage[]) => void;
}

interface DraggableItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  editable?: boolean;
}



const PageEditor: React.FC<PageEditorProps> = ({ journal, pageId, vibes, detailedInfo, onClose, restaurant, generatedImages = [], onImagesLoaded }) => {
  // Static journal component images
  const journalComponentImages = [
    { id: 'flower', url: '/journal-components/flower.png', alt: 'Flower' },
    { id: 'highlight', url: '/journal-components/highlight.png', alt: 'Highlight' },
    { id: 'photostrip', url: '/journal-components/photostrip.png', alt: 'Photo Strip' },
    { id: 'postcard', url: '/journal-components/postcard.png', alt: 'Postcard' },
    { id: 'scrappaper', url: '/journal-components/scrappaper.png', alt: 'Scrap Paper' },
    { id: 'stickynote', url: '/journal-components/stickynote.png', alt: 'Sticky Note' },
    { id: 'tape', url: '/journal-components/tape.png', alt: 'Tape' },
    { id: 'ticket', url: '/journal-components/ticketplain.png', alt: 'Ticket' },
    { id: 'receipt', url: '/journal-components/customizable/receipt.png', alt: 'Receipt' },
    { id: 'custom-ticket', url: '/journal-components/customizable/ticket.png', alt: 'Custom Ticket' },
  ];

  // Function to create a customized ticket image with restaurant name and address
  const createCustomizedTicket = async (ticketUrl: string, restaurant: any): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original ticket image
        ctx.drawImage(img, 0, 0);

        // Add restaurant name and address text overlay
        ctx.fillStyle = '#000000'; // Black color
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Position text more to the right
        const textX = 550; // 550px from left edge
        const centerY = canvas.height / 2;

        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw the restaurant name (large font) - max 16 characters
        ctx.font = 'bold 44px "Special Elite", cursive';
        const truncatedName = restaurant.name.length > 16 ? restaurant.name.substring(0, 16) + '...' : restaurant.name;
        ctx.fillText(truncatedName, textX, centerY - 50);

        // Draw the restaurant address (medium-large font) - max 22 characters
        ctx.font = 'bold 32px "Special Elite", cursive';
        const fullAddress = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}`.trim();
        const truncatedAddress = fullAddress.length > 22 ? fullAddress.substring(0, 22) + '...' : fullAddress;
        ctx.fillText(truncatedAddress, textX, centerY - 15);

        // Draw menu items (small font) - exactly 2 items
        ctx.font = 'bold 24px "Special Elite", cursive';
        const menuItems = restaurant.menuItems ? restaurant.menuItems.split('\n').slice(0, 2) : ['Sample Item - $15.99'];
        menuItems.forEach((item: string, index: number) => {
          const truncatedItem = item.length > 20 ? item.substring(0, 20) + '...' : item;
          ctx.fillText(truncatedItem, textX, centerY + 15 + (index * 30));
        });

        // Convert canvas to data URL
        const customizedTicketUrl = canvas.toDataURL('image/png');
        resolve(customizedTicketUrl);
      };
      img.src = ticketUrl;
    });
  };

  // Function to create a customized receipt image with restaurant name and address
  const createCustomizedReceipt = async (receiptUrl: string, restaurant: any): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original receipt image
        ctx.drawImage(img, 0, 0);

        // Add restaurant name and address text overlay
        ctx.fillStyle = '#000000'; // Black color
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Position text higher up and more to the right
        const textX = 450; // 450px from left edge (moved right)
        const centerY = canvas.height / 2 - 200; // Moved 200px higher

        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw the restaurant name (large font) - max 16 characters
        ctx.font = 'bold 40px "Special Elite", cursive';
        const truncatedName = restaurant.name.length > 16 ? restaurant.name.substring(0, 16) + '...' : restaurant.name;
        ctx.fillText(truncatedName, textX, centerY - 50);

        // Draw the restaurant address (medium-large font) - max 22 characters
        ctx.font = 'bold 28px "Special Elite", cursive';
        const fullAddress = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}`.trim();
        const truncatedAddress = fullAddress.length > 22 ? fullAddress.substring(0, 22) + '...' : fullAddress;
        ctx.fillText(truncatedAddress, textX, centerY - 15);

        // Draw menu items (small font) - exactly 2 items
        ctx.font = 'bold 24px "Special Elite", cursive';
        const menuItems = restaurant.menuItems ? restaurant.menuItems.split('\n').slice(0, 2) : ['Sample Item - $15.99'];
        menuItems.forEach((item: string, index: number) => {
          const truncatedItem = item.length > 20 ? item.substring(0, 20) + '...' : item;
          ctx.fillText(truncatedItem, textX, centerY + 15 + (index * 30));
        });

        // Convert canvas to data URL
        const customizedReceiptUrl = canvas.toDataURL('image/png');
        resolve(customizedReceiptUrl);
      };
      img.src = receiptUrl;
    });
  };
  const [canvasItems, setCanvasItems] = useState<DraggableItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const hasLoadedRef = useRef(false);

  // Load page content from Firestore
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const pageRef = doc(db, 'journals', journal.id, 'pages', `page-${pageId}`);
        console.log('Loading page content from:', pageRef.path);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
          const data = pageSnap.data();
          console.log('Loaded page data:', data);

          // Handle backward compatibility: convert old text-based ratings to image-based
          let items = data.items || [];
          items = items.map((item: DraggableItem) => {
            // Check if this is an old text rating item (e.g., "⭐ 4.5")
            if (item.type === 'text' && item.content && item.content.startsWith('⭐ ')) {
              const ratingMatch = item.content.match(/^⭐ (\d+(?:\.\d+)?)$/);
              if (ratingMatch) {
                const rating = parseFloat(ratingMatch[1]);
                return {
                  ...item,
                  type: 'image' as const,
                  content: getYelpStarsImageUrl(rating),
                  editable: false // Yelp stars are not editable
                };
              }
            }
            return item;
          });

          setCanvasItems(items);

          // Load existing generated images if available and notify parent
          if (data.generatedImages && onImagesLoaded) {
            onImagesLoaded(data.generatedImages);
          }
        } else {
          console.log('No existing page data found');
          setCanvasItems([]);
        }
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading page content:', error);
      }
    };

    loadPageContent();
  }, [journal.id, pageId, onImagesLoaded]);

  // Save page content to Firestore
  const savePageContent = async (items: DraggableItem[]) => {
    try {
      // Capture canvas as image
      const canvasImage = await captureCanvas();

      const pageRef = doc(db, 'journals', journal.id, 'pages', `page-${pageId}`);
      const pageData: any = {
        items,
        canvasImage, // Save the captured image
        lastModified: new Date()
      };

      if (restaurant) {
        pageData.restaurant = restaurant;
      }
      if (vibes) {
        pageData.vibes = vibes;
      }
      if (detailedInfo) {
        pageData.detailedInfo = detailedInfo;
      }
      if (generatedImages.length > 0) {
        pageData.generatedImages = generatedImages;
      }

      console.log('Saving page content to:', pageRef.path, 'with data:', pageData);
      await setDoc(pageRef, pageData);
      console.log('Page content saved successfully');
    } catch (error) {
      console.error('Error saving page content:', error);
    }
  };

  // Save when items change (only after initial load)
  useEffect(() => {
    if (hasLoadedRef.current) {
      savePageContent(canvasItems);
    }
  }, [canvasItems]);

  const sidebarItems = [
    { id: 'text', type: 'text' as const, content: 'Add Text' },
    { id: 'image', type: 'upload' as const, content: 'Add Image' },
    ...(vibes ? [{ id: 'vibes', type: 'text' as const, content: vibes }] : []),
    ...(restaurant?.rating ? [{ id: 'rating', type: 'image' as const, content: getYelpStarsImageUrl(restaurant.rating) }] : []),
    ...generatedImages.map((image, index) => ({
      id: `generated-image-${index}`,
      type: 'image' as const,
      content: image.url
    })),
    ...journalComponentImages.map((image) => ({
      id: `component-${image.id}`,
      type: 'image' as const,
      content: image.url
    }))
  ];

  const handleDragStart = (item: Omit<DraggableItem, 'x' | 'y'>) => {
    setDraggedItem({ ...item, x: 0, y: 0 });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      const newItem: DraggableItem = {
        id: `uploaded-image-${Date.now()}`,
        type: 'image',
        content: imageDataUrl,
        x: 50, // Default position
        y: 50,
      };
      setCanvasItems([...canvasItems, newItem]);
    };
    reader.readAsDataURL(file);

    // Reset the input
    e.target.value = '';
  };

  // Convert image URL to data URL for canvas compatibility
  const convertImageToDataURL = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = () => resolve(imageUrl); // Fallback to original URL if conversion fails
      img.src = imageUrl;
    });
  };

  const handleDragEnd = async (e: React.DragEvent) => {
    if (draggedItem) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let content = draggedItem.content;

      // Convert AI-generated images and Yelp stars to data URLs for canvas compatibility
      if ((draggedItem.id.startsWith('generated-image-') || draggedItem.id === 'rating') && typeof content === 'string') {
        console.log('Converting image to data URL:', content.substring(0, 50) + '...');
        try {
          const convertedContent = await convertImageToDataURL(content);
          console.log('Successfully converted to data URL, length:', convertedContent.length);
          content = convertedContent;
        } catch (error) {
          console.warn('Failed to convert image to data URL:', error);
          // Keep original URL as fallback
        }
      }

      // Check if this is a ticket that needs customization (only custom-ticket, not plain ticket)
      const isTicket = draggedItem.id === 'component-custom-ticket';
      const isReceipt = draggedItem.id === 'component-receipt';

      if (isTicket && restaurant?.name) {
        try {
          // Create customized ticket with restaurant name
          content = await createCustomizedTicket(draggedItem.content, restaurant);
        } catch (error) {
          console.error('Failed to customize ticket:', error);
          // Fall back to original ticket if customization fails
        }
      } else if (isReceipt && restaurant?.name) {
        try {
          // Create customized receipt with restaurant name
          content = await createCustomizedReceipt(draggedItem.content, restaurant);
        } catch (error) {
          console.error('Failed to customize receipt:', error);
          // Fall back to original receipt if customization fails
        }
      } else {
        // Handle text items
        content = draggedItem.type === 'text' && draggedItem.content !== vibes && draggedItem.content !== `⭐ ${restaurant?.rating || ''}` ? '' : draggedItem.content;
      }

      const newItem: DraggableItem = {
        ...draggedItem,
        x,
        y,
        id: `${draggedItem.id}-${Date.now()}`, // Make unique
        content,
        editable: draggedItem.content !== vibes && draggedItem.content !== `⭐ ${restaurant?.rating || ''}`, // Vibes and rating text are not editable
      };

      setCanvasItems([...canvasItems, newItem]);

      // If it's a text item and editable, start editing immediately
      if (draggedItem.type === 'text' && draggedItem.content !== vibes && draggedItem.content !== `⭐ ${restaurant?.rating || ''}`) {
        setEditingTextId(newItem.id);
      }
    }
    setDraggedItem(null);
  };



  const deleteItem = (id: string) => {
    setCanvasItems(items => items.filter(item => item.id !== id));
  };

  const startEditingText = (id: string) => {
    setEditingTextId(id);
  };

  const updateTextContent = (id: string, newContent: string) => {
    setCanvasItems(items =>
      items.map(item =>
        item.id === id ? { ...item, content: newContent } : item
      )
    );
  };

  const finishEditingText = () => {
    setEditingTextId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    // Don't start dragging if we're editing text
    if (editingTextId) return;

    const item = canvasItems.find(item => item.id === itemId);
    if (!item) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingItem(itemId);
    setDragOffset({ x: offsetX, y: offsetY });

    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem) return;

    const canvasRect = document.querySelector('.canvas-paper')?.getBoundingClientRect();
    if (!canvasRect) return;

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    setCanvasItems(items =>
      items.map(item =>
        item.id === draggingItem
          ? { ...item, x: Math.max(0, newX), y: Math.max(0, newY) }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  // Capture canvas as image
  const captureCanvas = async (): Promise<string | null> => {
    const canvasElement = document.querySelector('.canvas-paper') as HTMLElement;
    if (!canvasElement) {
      console.warn('Canvas element not found for capture');
      return null;
    }

    try {
      console.log('Capturing canvas screenshot...');

      // Wait for images to load
      const images = canvasElement.querySelectorAll('img');
      console.log('Found', images.length, 'images to wait for');

      if (images.length > 0) {
        const imagePromises = Array.from(images).map(img => {
          return new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Don't wait forever on errors
            }
          });
        });

        console.log('Waiting for images to load...');
        await Promise.all(imagePromises);
        console.log('All images loaded, proceeding with capture');
      }

      // Give a small additional delay for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simple, reliable screenshot - capture whatever is currently visible
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: 'white',
        scale: 1, // Standard quality
        useCORS: true,
        allowTaint: false, // Don't allow tainting for security
        logging: false, // Disable verbose logging
      });

      const dataUrl = canvas.toDataURL('image/png');
      console.log('Canvas captured successfully, data URL length:', dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };



  // Share this page
  const sharePage = async () => {
    console.log('Share button clicked for journal:', journal.id, 'page:', pageId);
    try {
      // Share the journal if it's not already shared (required for page access)
      const journalRef = doc(db, 'journals', journal.id);
      console.log('Checking journal document:', journalRef.path);
      const journalSnap = await getDoc(journalRef);

      console.log('Journal document exists:', journalSnap.exists());
      let journalShared = false;
      if (journalSnap.exists()) {
        const data = journalSnap.data();
        console.log('Journal data:', data);
        journalShared = data?.isPublic || false;
        console.log('Journal is currently shared:', journalShared);
      } else {
        console.error('Journal document does not exist!');
        return;
      }

      // If journal is not shared, share it first
      if (!journalShared) {
        console.log('Making journal public...');
        try {
          await updateDoc(journalRef, {
            isPublic: true,
            sharedAt: new Date()
          });
          console.log('Journal successfully made public');
        } catch (updateError) {
          console.error('Failed to make journal public:', updateError);
          alert('Failed to share journal. You may not have permission to share this journal, or there may be a database issue.');
          return;
        }
      }

      // Generate share link for this specific page
      const currentDomain = window.location.origin;
      const link = `${currentDomain}/shared/journal/${journal.id}/page/${pageId}`;
      console.log('Generated share link:', link);
      setShareLink(link);
      setShowShareOptions(true);
      console.log('Share options set to visible, link:', link);
    } catch (error) {
      console.error('Error sharing page:', error);
      // Show user-friendly error message
      alert('Failed to share page. Please check your permissions and try again.');
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <div className="page-editor-overlay">
      <div className="page-editor">
        <div className="journal-title-header">
          <div></div>
          <h1 className="journal-title">{journal.title}</h1>
          <button onClick={onClose} className="close-editor-btn">×</button>
        </div>

        <div className="editor-content">
          <div className="sidebar">
            <h3>Drag & Drop Items</h3>

            <div className="sidebar-items">
              {sidebarItems.map(item => (
                item.type === 'upload' ? (
                  <div key={item.id} className="sidebar-item">
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="image-preview">{item.content}</div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="sidebar-item"
                    draggable
                    onDragStart={() => handleDragStart(item as any)}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.content}
                        alt="Generated"
                        className="image-preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '80px',
                          objectFit: 'contain',
                          display: 'block',
                          backgroundColor: 'transparent'
                        }}
                      />
                    ) : (
                      <div className="text-preview">{item.content}</div>
                    )}
                  </div>
                )
              ))}
          </div>
        </div>

          <div
            className="canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragEnd}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className="canvas-paper">
              {canvasItems.map(item => (
                <div
                  key={item.id}
                  className={`canvas-item ${item.type}-item ${draggingItem === item.id ? 'dragging' : ''}`}
                  style={{
                    left: item.x,
                    top: item.y,
                    cursor: editingTextId === item.id ? 'text' : (item.editable !== false ? 'move' : 'default')
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onDoubleClick={() => deleteItem(item.id)}
                >
                  {item.type === 'text' ? (
                    editingTextId === item.id ? (
                      <input
                        type="text"
                        value={item.content}
                        onChange={(e) => updateTextContent(item.id, e.target.value)}
                        onBlur={finishEditingText}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            finishEditingText();
                          }
                        }}
                        className="canvas-text-input"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="canvas-text"
                        onClick={() => item.editable !== false && startEditingText(item.id)}
                      >
                        {item.content || (item.editable !== false ? 'Click to edit text' : '')}
                      </div>
                    )
                  ) : (
                    <img
                      src={item.content}
                      alt="Uploaded image"
                      className="canvas-image"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        border: 'none',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {restaurant && (
            <div className="restaurant-sidebar">
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.location?.address1}, {restaurant.location?.city}</p>
                <div className="restaurant-rating">
                  <YelpStars rating={restaurant.rating} />
                  {/* Debug: {restaurant.rating} */}
                </div>
                <div className="restaurant-reviews">
                  Based on {restaurant.review_count} reviews
                  <img
                    src="/yelp_logo.png"
                    alt="Yelp"
                    className="yelp-logo"
                    style={{ height: '28px', marginLeft: '8px', verticalAlign: 'middle', cursor: 'pointer' }}
                    onClick={() => restaurant?.url && window.open(restaurant.url, '_blank')}
                    title="View on Yelp"
                  />
                </div>
                <div className="restaurant-categories">
                  {restaurant.categories?.map((c: any) => c.title).join(', ')}
                </div>
              </div>
              <div className="page-info-sidebar">
                <p className="page-number">{pageId}</p>
                <div className="editor-instructions">
                  <p>Double-click items to delete them. Drag from sidebar to add.</p>
                </div>
                <div className="sidebar-actions">
                  <button onClick={sharePage} className="share-page-btn">
                    📤 Share
                  </button>
                </div>
                <p className="powered-by-yelp" style={{ fontFamily: 'Montserrat, sans-serif' }}>Powered by Yelp AI API</p>
              </div>
            </div>
          )}
        </div>



        {showShareOptions && (
          <div className="share-options">
            <p>Share this page of your journal:</p>
            <div className="share-link-container">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="share-link-input"
              />
              <button onClick={copyShareLink} className="copy-link-btn">
                Copy Link
              </button>
            </div>
            <button
              onClick={() => setShowShareOptions(false)}
              className="close-share-options"
            >
              ×
            </button>
          </div>
        )}




      </div>
    </div>
  );
};

export default PageEditor;
