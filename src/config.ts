// Demo mode configuration
// Set DEMO_MODE to true to use default mock data instead of API calls
export const DEMO_MODE = true;

// Default mock data for demo mode
export const DEMO_RESTAURANTS = [
  {
    id: 'demo-1',
    name: 'The Cozy Kitchen',
    rating: 4.5,
    review_count: 328,
    location: {
      address1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102'
    },
    categories: [{ title: 'American (Traditional)' }, { title: 'Breakfast & Brunch' }],
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/KhmuJQz6yGz6uQ7KnqUPDA/o.jpg',
    url: 'https://www.yelp.com/biz/the-cozy-kitchen-san-francisco'
  },
  {
    id: 'demo-2',
    name: 'Sakura Sushi House',
    rating: 3.5,
    review_count: 256,
    location: {
      address1: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94103'
    },
    categories: [{ title: 'Sushi Bars' }, { title: 'Japanese' }],
    coordinates: {
      latitude: 37.7833,
      longitude: -122.4167
    },
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/KhmuJQz6yGz6uQ7KnqUPDA/o.jpg',
    url: 'https://www.yelp.com/biz/sakura-sushi-house-san-francisco'
  },
  {
    id: 'demo-3',
    name: 'Mama Mia Italian',
    rating: 4.5,
    review_count: 512,
    location: {
      address1: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zip_code: '10003'
    },
    categories: [{ title: 'Italian' }, { title: 'Pizza' }],
    coordinates: {
      latitude: 40.7282,
      longitude: -73.9942
    },
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/KhmuJQz6yGz6uQ7KnqUPDA/o.jpg',
    url: 'https://www.yelp.com/biz/mama-mia-italian-new-york'
  },
  {
    id: 'demo-4',
    name: 'Taco Fiesta',
    rating: 3.5,
    review_count: 189,
    location: {
      address1: '321 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90028'
    },
    categories: [{ title: 'Mexican' }, { title: 'Tacos' }],
    coordinates: {
      latitude: 34.0975,
      longitude: -118.3258
    },
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/KhmuJQz6yGz6uQ7KnqUPDA/o.jpg',
    url: 'https://www.yelp.com/biz/taco-fiesta-los-angeles'
  },
  {
    id: 'demo-5',
    name: 'Golden Dragon Chinese',
    rating: 2.5,
    review_count: 445,
    location: {
      address1: '555 Chinatown Ave',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94108'
    },
    categories: [{ title: 'Chinese' }, { title: 'Dim Sum' }],
    coordinates: {
      latitude: 37.7942,
      longitude: -122.4073
    },
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/KhmuJQz6yGz6uQ7KnqUPDA/o.jpg',
    url: 'https://www.yelp.com/biz/golden-dragon-chinese-san-francisco'
  }
];

export const DEMO_AUTOCOMPLETE_SUGGESTIONS = [
  { text: 'Pizza' },
  { text: 'Pizza near me' },
  { text: 'Pizza delivery' },
  { text: 'Pizza restaurant' },
  { text: 'Pizza hut' }
];