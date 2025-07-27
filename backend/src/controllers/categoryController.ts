import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Category } from '../models/Category';
import { cacheService } from '../utils/cache';

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryController {
  // Get all categories
  static async getAll(req: Request, res: Response) {
    try {
      // Check cache first
      const cached = await cacheService.get('categories:all');
      if (cached) {
        return res.json(cached);
      }

      const categories = await categoryRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });

      const result = {
        categories,
        count: categories.length
      };

      // Cache for 1 hour
      await cacheService.set('categories:all', result, 3600);

      res.json(result);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new category (admin only)
  static async create(req: Request, res: Response) {
    try {
      const { name, description, color } = req.body;

      // Validate input
      if (!name || !description || !color) {
        return res.status(400).json({ 
          message: 'Name, description, and color are required' 
        });
      }

      // Check if category already exists
      const existingCategory = await categoryRepository.findOne({ 
        where: { name: name.toLowerCase() } 
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      // Create category
      const category = categoryRepository.create({
        name: name.toLowerCase(),
        description,
        color,
        isActive: true
      });

      await categoryRepository.save(category);

      // Invalidate categories cache
      await cacheService.delete('categories:all');

      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update category (admin only)
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, color, isActive } = req.body;

      const category = await categoryRepository.findOne({ 
        where: { id: parseInt(id) } 
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Update fields
      if (name !== undefined) category.name = name.toLowerCase();
      if (description !== undefined) category.description = description;
      if (color !== undefined) category.color = color;
      if (isActive !== undefined) category.isActive = isActive;

      await categoryRepository.save(category);

      // Invalidate categories cache
      await cacheService.delete('categories:all');

      res.json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete category (admin only)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await categoryRepository.findOne({ 
        where: { id: parseInt(id) } 
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Soft delete by setting isActive to false
      category.isActive = false;
      await categoryRepository.save(category);

      // Invalidate categories cache
      await cacheService.delete('categories:all');

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 