import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { type GeneratedImage } from './imageService';

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
  review?: string;
  detailedInfo?: string;
  onClose: () => void;
  onRestart: () => void;
  restaurant?: any;
  generatedImages?: GeneratedImage[];
}

interface DraggableItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  editable?: boolean;
}



const PageEditor: React.FC<PageEditorProps> = ({ journal, pageId, vibes, review, detailedInfo, onClose, onRestart, restaurant, generatedImages = [] }) => {
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
          setCanvasItems(data.items || []);
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
  }, [journal.id, pageId]);

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
    { id: 'text', type: 'text' as const, content: 'Text' },
    { id: 'image', type: 'upload' as const, content: 'Image' },
    ...(vibes ? [{ id: 'vibes', type: 'text' as const, content: vibes }] : []),
    ...(review ? [{ id: 'review', type: 'text' as const, content: review }] : []),
    ...generatedImages.map((image, index) => ({
      id: `generated-image-${index}`,
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

  const handleDragEnd = (e: React.DragEvent) => {
    if (draggedItem) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newItem: DraggableItem = {
        ...draggedItem,
        x,
        y,
        id: `${draggedItem.id}-${Date.now()}`, // Make unique
        content: draggedItem.type === 'text' && draggedItem.content !== vibes && draggedItem.content !== review ? '' : draggedItem.content, // Start with empty text for text items, but keep vibes and review content
        editable: draggedItem.content !== vibes && draggedItem.content !== review, // Vibes and review text are not editable
      };

      setCanvasItems([...canvasItems, newItem]);

      // If it's a text item and editable, start editing immediately
      if (draggedItem.type === 'text' && draggedItem.content !== vibes) {
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
    if (!canvasElement) return null;

    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: 'white',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl;
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };

  const handleRestart = async () => {
    try {
      // Delete the page data from Firestore
      const pageRef = doc(db, 'journals', journal.id, 'pages', `page-${pageId}`);
      await deleteDoc(pageRef);
      console.log('Page data deleted, restarting...');
      onRestart();
    } catch (error) {
      console.error('Error deleting page data:', error);
    }
  };

  // Share this page
  const sharePage = async () => {
    try {
      // Share the journal if it's not already shared (required for page access)
      const journalRef = doc(db, 'journals', journal.id);
      const journalSnap = await getDoc(journalRef);

      let journalShared = false;
      if (journalSnap.exists()) {
        const data = journalSnap.data();
        journalShared = data.isPublic || false;
      }

      // If journal is not shared, share it first
      if (!journalShared) {
        await updateDoc(journalRef, {
          isPublic: true,
          sharedAt: new Date()
        });
      }

      // Generate share link for this specific page
      const currentDomain = window.location.origin;
      const link = `${currentDomain}/shared/journal/${journal.id}/page/${pageId}`;
      setShareLink(link);
      setShowShareOptions(true);
    } catch (error) {
      console.error('Error sharing page:', error);
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
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div className="text-preview">{item.content}</div>
                    )}
                  </div>
                )
              ))}
          </div>
          <p className="generated-by">Generated by Yelp AI API</p>
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
                <div className="restaurant-meta">
                  ⭐ {restaurant.rating} ({restaurant.review_count} reviews) • {restaurant.categories?.map((c: any) => c.title).join(', ')}
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
                  <button onClick={handleRestart} className="restart-btn">
                    Restart
                  </button>
                </div>
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
