import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a blog title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Yoga', 'Wellness', 'Fitness', 'Meditation', 'Mindfulness', 'Nutrition', 'Lifestyle']
  },
  author: {
    type: String,
    required: [true, 'Please provide author name'],
    trim: true
  },
  authorRole: {
    type: String,
    required: [true, 'Please provide author role'],
    trim: true
  },
  authorImage: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Please provide blog date'],
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide blog excerpt'],
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide blog content'],
    trim: true
  },
  readTime: {
    type: String,
    required: [true, 'Please provide estimated read time'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  bookmarks: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;