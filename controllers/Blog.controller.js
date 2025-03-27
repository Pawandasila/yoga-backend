import Blog from '../models/Blog.model.js';

/**
 * Create a new blog post
 * @route POST /api/blogs
 * @access Private
 */
export const createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };
    
    // Handle tags if they are sent as a string
    if (typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim());
    }
    
    // Convert date string to Date object if needed
    if (blogData.date && typeof blogData.date === 'string') {
      blogData.date = new Date(blogData.date);
    }
    
    // Since we're using CloudinaryStorage, the file path is already in req.files
    // We just need to get the URL from the file object
    if (req.files && req.files.image && req.files.image[0]) {
      blogData.image = req.files.image[0].path;
    }
    
    // Handle author image if present
    if (req.files && req.files.authorImage && req.files.authorImage[0]) {
      blogData.authorImage = req.files.authorImage[0].path;
    }
    
    const blog = new Blog(blogData);
    const newBlog = await blog.save();
    
    res.status(201).json({
      success: true,
      data: newBlog
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all blog posts with filtering options
 * @route GET /api/blogs
 * @access Public
 */
export const getAllBlogs = async (req, res) => {
  try {
    const { category, featured, tags, search, limit = 10, page = 1 } = req.query;
    
    // Build query object
    const queryObject = {};
    
    // Filter by category if provided
    if (category && category !== 'All') {
      queryObject.category = category;
    }
    
    // Filter by featured status if provided
    if (featured !== undefined) {
      queryObject.featured = featured === 'true';
    }
    
    // Filter by tags if provided
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      queryObject.tags = { $in: tagsArray };
    }
    
    // Search in title or content if search term provided
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with sorting, pagination
    const blogs = await Blog.find(queryObject)
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(queryObject);
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      total: totalBlogs,
      totalPages: Math.ceil(totalBlogs / parseInt(limit)),
      currentPage: parseInt(page),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blogs',
      error: error.message
    });
  }
};

/**
 * Get a single blog post by ID
 * @route GET /api/blog/:id
 * @access Public
 */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update a blog post
 * @route PUT /api/blog/:id
 * @access Private
 */
export const updateBlog = async (req, res) => {
  try {
    let blogData = { ...req.body };
    
    // Handle tags if they are sent as a string
    if (typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim());
    }
    
    // Handle image upload if a new image is provided
    if (req.files && req.files.image && req.files.image[0]) {
      blogData.image = req.files.image[0].path;
    }
    
    // Handle author image if a new one is provided
    if (req.files && req.files.authorImage && req.files.authorImage[0]) {
      blogData.authorImage = req.files.authorImage[0].path;
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      blogData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a blog post
 * @route DELETE /api/blog/:id
 * @access Private
 */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};