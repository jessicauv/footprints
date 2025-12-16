import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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
  onClose: () => void;
  onRestart: () => void;
  restaurant?: any;
}

interface DraggableItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
}

const PageEditor: React.FC<PageEditorProps> = ({ journal, pageId, vibes, onClose, onRestart, restaurant }) => {
  const [canvasItems, setCanvasItems] = useState<DraggableItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, [journal.id, pageId]);

  // Save page content to Firestore
  const savePageContent = async (items: DraggableItem[]) => {
    try {
      const pageRef = doc(db, 'journals', journal.id, 'pages', `page-${pageId}`);
      const pageData: any = {
        items,
        lastModified: new Date()
      };

      if (restaurant) {
        pageData.restaurant = restaurant;
      }
      if (vibes) {
        pageData.vibes = vibes;
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
    { id: 'text1', type: 'text' as const, content: 'Add your text here...' },
    { id: 'text2', type: 'text' as const, content: 'Another text block' },
    { id: 'image1', type: 'image' as const, content: '📷 Image Placeholder' },
    { id: 'image2', type: 'image' as const, content: '🖼️ Another Image' },
    ...(vibes ? [{ id: 'vibes', type: 'text' as const, content: vibes }] : []),
  ];

  const handleDragStart = (item: Omit<DraggableItem, 'x' | 'y'>) => {
    setDraggedItem({ ...item, x: 0, y: 0 });
    setIsDragging(true);
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
      };

      setCanvasItems([...canvasItems, newItem]);
    }
    setDraggedItem(null);
    setIsDragging(false);
  };

  const handleItemMove = (id: string, x: number, y: number) => {
    setCanvasItems(items =>
      items.map(item => item.id === id ? { ...item, x, y } : item)
    );
  };

  const deleteItem = (id: string) => {
    setCanvasItems(items => items.filter(item => item.id !== id));
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

  return (
    <div className="page-editor-overlay">
      <div className="page-editor">
        <div className="editor-header">
          <div className="page-info">
            <h2>Editing Page {pageId} - {journal.title}</h2>
            {restaurant && (
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.location?.address1}, {restaurant.location?.city}</p>
                <div className="restaurant-meta">
                  ⭐ {restaurant.rating} ({restaurant.review_count} reviews) • {restaurant.categories?.map((c: any) => c.title).join(', ')}
                </div>
              </div>
            )}
          </div>
          <div className="editor-actions">
            <button onClick={handleRestart} className="restart-btn">
              Change Restaurant
            </button>
            <button onClick={onClose} className="close-editor-btn">×</button>
          </div>
        </div>

        <div className="editor-content">
          <div className="sidebar">
            <h3>Drag & Drop Items</h3>
            <div className="sidebar-items">
              {sidebarItems.map(item => (
                <div
                  key={item.id}
                  className="sidebar-item"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  {item.type === 'text' ? (
                    <div className="text-preview">{item.content}</div>
                  ) : (
                    <div className="image-preview">{item.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragEnd}
          >
            <div className="canvas-paper">
              {canvasItems.map(item => (
                <div
                  key={item.id}
                  className={`canvas-item ${item.type}-item`}
                  style={{
                    left: item.x,
                    top: item.y,
                  }}
                  onDoubleClick={() => deleteItem(item.id)}
                >
                  {item.type === 'text' ? (
                    <div className="canvas-text">{item.content}</div>
                  ) : (
                    <div className="canvas-image">{item.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <p>Double-click items to delete them. Drag from sidebar to add.</p>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
