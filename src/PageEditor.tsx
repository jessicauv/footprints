import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
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
  width?: number;
  height?: number;
  rotation?: number;
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
  const [resizingItem, setResizingItem] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotatingItem, setRotatingItem] = useState<string | null>(null);
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0 });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
      const newItems = [...canvasItems, newItem];
      setCanvasItems(newItems);
      // Save after uploading image
      savePageContent(newItems);
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

      // Set default sizes - make photostrip larger
      let defaultWidth = draggedItem.type === 'text' ? 200 : 150;
      let defaultHeight = draggedItem.type === 'text' ? 50 : 150;

      // Special case for photostrip - make it larger
      if (draggedItem.id === 'component-photostrip') {
        defaultWidth = 300;
        defaultHeight = 200;
      }

      const newItem: DraggableItem = {
        ...draggedItem,
        x,
        y,
        id: `${draggedItem.id}-${Date.now()}`, // Make unique
        content,
        width: draggedItem.width || defaultWidth,
        height: draggedItem.height || defaultHeight,
        editable: draggedItem.content !== vibes && draggedItem.content !== `⭐ ${restaurant?.rating || ''}`, // Vibes and rating text are not editable
      };

      const newItems = [...canvasItems, newItem];
      setCanvasItems(newItems);

      // Save after adding new item
      savePageContent(newItems);

      // If it's a text item and editable, start editing immediately
      if (draggedItem.type === 'text' && draggedItem.content !== vibes && draggedItem.content !== `⭐ ${restaurant?.rating || ''}`) {
        setEditingTextId(newItem.id);
      }
    }
    setDraggedItem(null);
  };



  const deleteItem = (id: string) => {
    const newItems = canvasItems.filter(item => item.id !== id);
    setCanvasItems(newItems);
    // Save after deleting item
    savePageContent(newItems);
  };

  const startEditingText = (id: string) => {
    setEditingTextId(id);
  };

  const updateTextContent = (id: string, newContent: string) => {
    const newItems = canvasItems.map(item =>
      item.id === id ? { ...item, content: newContent } : item
    );
    setCanvasItems(newItems);
    // Save after text content update
    savePageContent(newItems);
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
    if (rotatingItem) {
      handleRotationMove(e);
      return;
    }

    if (resizingItem) {
      handleResizeMove(e);
      return;
    }

    if (!draggingItem) return;

    const canvasRect = document.querySelector('.canvas-paper')?.getBoundingClientRect();
    if (!canvasRect) return;

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    setCanvasItems(items =>
      items.map(item =>
        item.id === draggingItem
          ? { ...item, x: newX, y: newY }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    if (draggingItem || resizingItem || rotatingItem) {
      // Save after drag, resize, or rotate operations
      savePageContent(canvasItems);
    }
    setDraggingItem(null);
    setResizingItem(null);
    setRotatingItem(null);
  };

  const handleRotationStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = canvasItems.find(item => item.id === itemId);
    if (!item) return;

    const itemCenterX = item.x + (item.width || 150) / 2;
    const itemCenterY = item.y + (item.height || 150) / 2;

    // Calculate initial angle from center to mouse
    const angle = Math.atan2(e.clientY - itemCenterY, e.clientX - itemCenterX) * (180 / Math.PI);

    setRotatingItem(itemId);
    setRotationStart({
      x: itemCenterX,
      y: itemCenterY,
      angle: angle - (item.rotation || 0)
    });

    e.preventDefault();
  };

  const handleRotationMove = (e: React.MouseEvent) => {
    if (!rotatingItem) return;

    // Calculate new angle from center to mouse
    const newAngle = Math.atan2(e.clientY - rotationStart.y, e.clientX - rotationStart.x) * (180 / Math.PI);

    // Apply rotation with constraints
    let finalAngle = newAngle - rotationStart.angle;

    // Normalize angle to -180 to 180 range
    while (finalAngle > 180) finalAngle -= 360;
    while (finalAngle < -180) finalAngle += 360;

    setCanvasItems(items =>
      items.map(item =>
        item.id === rotatingItem
          ? { ...item, rotation: Math.round(finalAngle) }
          : item
      )
    );
  };

  const handleResizeStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = canvasItems.find(item => item.id === itemId);
    if (!item) return;

    setResizingItem(itemId);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.width || 150,
      height: item.height || 150
    });

    e.preventDefault();
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingItem) return;

    const item = canvasItems.find(item => item.id === resizingItem);
    if (!item) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(50, resizeStart.width + deltaX);
    const newHeight = Math.max(50, resizeStart.height + deltaY);

    setCanvasItems(items =>
      items.map(i =>
        i.id === resizingItem
          ? { ...i, width: newWidth, height: newHeight }
          : i
      )
    );
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
      // First check if user is authenticated
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error('User not authenticated');
        alert('You must be logged in to share pages. Please refresh the page and try again.');
        return;
      }

      console.log('Current user:', currentUser.uid);

      // Share the journal if it's not already shared (required for page access)
      const journalRef = doc(db, 'journals', journal.id);
      console.log('Checking journal document:', journalRef.path);
      const journalSnap = await getDoc(journalRef);

      console.log('Journal document exists:', journalSnap.exists());
      let journalShared = false;
      let journalData: any = null;

      if (journalSnap.exists()) {
        journalData = journalSnap.data();
        console.log('Journal data:', journalData);
        console.log('Journal userId:', journalData?.userId);
        console.log('Current user matches:', journalData?.userId === currentUser.uid);

        // Check if user owns this journal (either by userId or if it's a legacy journal)
        const userOwnsJournal = journalData?.userId === currentUser.uid || !journalData?.userId;
        if (!userOwnsJournal) {
          console.error('User does not own this journal');
          alert('You do not have permission to share this journal.');
          return;
        }

        journalShared = journalData?.isPublic || false;
        console.log('Journal is currently shared:', journalShared);
      } else {
        console.error('Journal document does not exist!');
        alert('Journal not found. Please try again.');
        return;
      }

    // If journal is not shared, share it first
    if (!journalShared) {
      console.log('Making journal public...');
      console.log('Journal data before update:', journalData);

      try {
        const updateData = {
          isPublic: true,
          sharedAt: new Date()
        };
        console.log('Updating with data:', updateData);

        await updateDoc(journalRef, updateData);
        console.log('updateDoc completed successfully');

        // Verify the update worked
        console.log('Verifying update...');
        const verifySnap = await getDoc(journalRef);
        const verifyData = verifySnap.data();
        console.log('Verification - journal data after update:', verifyData);
        console.log('Verification - journal is now public:', verifyData?.isPublic);

        if (!verifyData?.isPublic) {
          console.error('Update verification failed - journal is still not public!');
          alert('Failed to make journal public. Please try again.');
          return;
        }

        console.log('Journal successfully made public');
      } catch (updateError) {
        console.error('Failed to make journal public:', updateError);
        const error = updateError as Error;
        console.error('Error details:', {
          code: (error as any)?.code,
          message: error.message,
          name: error.name
        });

        // Check for specific Firestore errors
        if ((error as any)?.code === 'permission-denied') {
          alert('You do not have permission to share this journal. Please check that you own this journal.');
        } else {
          alert('Failed to share journal. Please try again.');
        }
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
      const err = error as Error;
      console.error('Error details:', {
        code: (err as any)?.code,
        message: err.message,
        name: err.name
      });
      // Show user-friendly error message
      alert('Failed to share page. Please check your permissions and try again.');
    }
  };

  // Share to gallery only (without making journal public)
  const shareToGallery = async () => {
    console.log('Share to gallery button clicked for journal:', journal.id, 'page:', pageId);
    try {
      console.log('Starting canvas capture...');
      // Capture canvas image
      const canvasImage = await captureCanvas();
      if (!canvasImage) {
        console.error('Canvas capture returned null/empty');
        alert('Failed to capture journal image. Please try again.');
        return;
      }
      console.log('Canvas captured successfully, image length:', canvasImage.length);

      console.log('Attempting to add to gallery collection...');
      // Add to gallery collection
      const galleryRef = collection(db, 'gallery');
      await addDoc(galleryRef, {
        imageUrl: canvasImage,
        journalId: journal.id,
        pageId: pageId,
        restaurant: restaurant || null,
        createdAt: new Date()
      });

      console.log('Page added to gallery successfully');
      // Redirect to gallery page
      window.location.href = '/gallery';
    } catch (error) {
      console.error('Error sharing to gallery:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error);
      alert(`Failed to share to gallery: ${errorMessage}`);
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
                    width: item.width || (item.type === 'text' ? 200 : 150),
                    height: item.height || (item.type === 'text' ? 50 : 150),
                    transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
                    transformOrigin: 'center center',
                    cursor: editingTextId === item.id ? 'text' : (item.editable !== false ? 'move' : 'default')
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onDoubleClick={() => deleteItem(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          item.editable !== false && startEditingText(item.id);
                        }}
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
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        border: 'none',
                        pointerEvents: 'none'
                      }}
                      onError={(e) => {
                        // Handle CORS errors for DALL-E images by showing placeholder
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                          target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                              <rect width="150" height="150" fill="#e3f2fd"/>
                              <text x="75" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#1976d2">
                                AI Image
                              </text>
                              <text x="75" y="85" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
                                (CORS blocked)
                              </text>
                            </svg>
                          `)}`;
                        }
                      }}
                    />
                  )}

                  {/* Transform handles - only show when hovered and not editing text */}
                  {hoveredItem === item.id && item.editable !== false && !editingTextId && (
                    <div className="transform-handles">
                      {/* Resize handle */}
                      <div
                        className="resize-handle se"
                        onMouseDown={(e) => handleResizeStart(e, item.id)}
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          bottom: '-4px',
                          width: '8px',
                          height: '8px',
                          background: '#646cff',
                          cursor: 'nw-resize',
                          borderRadius: '50%'
                        }}
                      />
                      {/* Rotation handle */}
                      <div
                        className="rotation-handle"
                        onMouseDown={(e) => handleRotationStart(e, item.id)}
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '12px',
                          height: '12px',
                          background: '#ff6b6b',
                          cursor: 'alias',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
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
                  <button onClick={shareToGallery} className="share-gallery-btn">
                    🖼️ Share to Gallery
                  </button>
                </div>
                <p className="powered-by-yelp" style={{ fontFamily: 'Montserrat, sans-serif', marginTop: '16px' }}>Powered by Yelp AI API</p>
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
